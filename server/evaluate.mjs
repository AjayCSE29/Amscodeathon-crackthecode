import { DEBUG_QUESTIONS } from "../src/data/debugQuestions.ts";
import { ROUND3_QUESTIONS } from "../src/data/round3Questions.ts";
import { keyFor } from "./answerKey.mjs";
import {
  getRound2Submission,
  getRound3Submission,
  listPendingRound2Submissions,
  listPendingRound3Submissions,
  setRound2IsRight,
  setRound3IsRight,
} from "./supabase.mjs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
const GEMINI_DISABLED = process.env.GEMINI_DISABLE === "1";

const LLM_API_URL = (process.env.LLM_API_URL ?? "").replace(/\/+$/, "");
const LLM_MODEL = process.env.LLM_MODEL ?? "";
const LLM_API_KEY = process.env.LLM_API_KEY ?? "";
const LLM_DISABLED = process.env.LLM_DISABLE === "1";
const LLM_TIMEOUT_MS = Number(
  process.env.LLM_TIMEOUT_MS ?? process.env.GEMINI_TIMEOUT_MS ?? 15_000,
);
const LLM_MAX_CONCURRENCY = Number(
  process.env.LLM_MAX_CONCURRENCY ?? process.env.GEMINI_MAX_CONCURRENCY ?? 3,
);
const LLM_QUOTA_BACKOFF_MS = Math.max(
  1_000,
  Number(process.env.LLM_QUOTA_BACKOFF_MS ?? process.env.GEMINI_QUOTA_BACKOFF_MS ?? 60_000),
);

const ROUND1_QUESTION_COUNT = 60;
const GEMINI_MAX_ATTEMPTS = 5;
const GEMINI_RETRY_ATTEMPTS = 5;
const GEMINI_RETRY_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let quotaGateUntil = 0;

function geminiError(message, status = null) {
  const err = new Error(message);
  err.status = status;
  err.retryable = status === null || GEMINI_RETRY_STATUSES.has(status);
  return err;
}

async function waitForQuotaGate() {
  const waitMs = quotaGateUntil - Date.now();
  if (waitMs > 0) await sleep(waitMs);
}

function pushQuotaGate(attempt) {
  const backoffMs = Math.min(10_000 * 2 ** attempt, LLM_QUOTA_BACKOFF_MS);
  quotaGateUntil = Math.max(quotaGateUntil, Date.now() + backoffMs);
}

export function geminiEnabled() {
  if (LLM_DISABLED) return false;
  if (LLM_API_URL && LLM_MODEL) return true;
  return !GEMINI_DISABLED && GEMINI_API_KEY.length > 0;
}

export function llmInfo() {
  if (LLM_DISABLED) return { provider: null, model: null, enabled: false };
  if (LLM_API_URL && LLM_MODEL) {
    return { provider: "qwen", model: LLM_MODEL, enabled: true };
  }
  if (!GEMINI_DISABLED && GEMINI_API_KEY.length > 0) {
    return { provider: "gemini", model: GEMINI_MODEL, enabled: true };
  }
  return { provider: null, model: null, enabled: false };
}

function parseJsonObject(text) {
  if (typeof text !== "string") return null;
  let cleaned = text.trim();
  const fence = /```(?:json)?\s*([\s\S]*?)\s*```/.exec(cleaned);
  if (fence) cleaned = fence[1].trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through to bracket scan
  }
  const start = cleaned.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth += 1;
    else if (cleaned[i] === "}") {
      depth -= 1;
      if (depth > 0) continue;
      try {
        return JSON.parse(cleaned.slice(start, i + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

async function generateContent(system, user) {
  const useLlm = Boolean(LLM_API_URL && LLM_MODEL) && !LLM_DISABLED;
  const useGemini =
    !useLlm && GEMINI_API_KEY.length > 0 && !GEMINI_DISABLED && !LLM_DISABLED;
  const label = useGemini ? "Gemini" : "LLM";
  let lastError = null;
  for (let attempt = 0; attempt < GEMINI_RETRY_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      const backoffMs = Math.min(500 * 2 ** (attempt - 1), 5000);
      await sleep(backoffMs);
    }
    await waitForQuotaGate();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
    let response;
    try {
      if (useLlm) {
        response = await fetch(`${LLM_API_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(LLM_API_KEY ? { Authorization: `Bearer ${LLM_API_KEY}` } : {}),
          },
          body: JSON.stringify({
            model: LLM_MODEL,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            temperature: 0,
            response_format: { type: "json_object" },
            enable_thinking: false,
          }),
          signal: controller.signal,
        });
      } else {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": GEMINI_API_KEY,
            },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: system }] },
              contents: [{ role: "user", parts: [{ text: user }] }],
              generationConfig: { temperature: 0, responseMimeType: "application/json" },
            }),
            signal: controller.signal,
          },
        );
      }
    } catch (err) {
      lastError = geminiError(
        controller.signal.aborted
          ? `${label} timed out after ${LLM_TIMEOUT_MS}ms.`
          : `${label} unreachable: ${err instanceof Error ? err.message : err}`,
      );
      clearTimeout(timer);
      continue;
    } finally {
      clearTimeout(timer);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      lastError = geminiError(
        `${label} returned HTTP ${response.status} ${body.slice(0, 240)}`,
        response.status,
      );
      if (lastError.retryable) {
        pushQuotaGate(attempt);
        continue;
      }
      throw lastError;
    }
    let data;
    try {
      data = await response.json();
    } catch {
      throw geminiError(`${label} returned an invalid response.`);
    }
    const text = useLlm
      ? data?.choices?.[0]?.message?.content
      : data?.candidates?.[0]?.content?.parts
          ?.map((part) => (typeof part.text === "string" ? part.text : ""))
          .join("");
    const verdict = parseJsonObject(text);
    if (verdict === null) {
      lastError = geminiError(`${label} verdict was not JSON.`);
      continue;
    }
    return verdict;
  }
  throw lastError ?? geminiError("LLM failed after exhaustion.");
}

export function round1KeyRows() {
  const rows = [];
  for (let qNo = 1; qNo <= ROUND1_QUESTION_COUNT; qNo++) {
    const correct = keyFor(qNo);
    if (correct) rows.push({ q_no: qNo, correct });
  }
  return rows;
}

function buildRound1Prompt(answers) {
  const keyLines = round1KeyRows()
    .map((row) => `Q${row.q_no}: ${row.correct}`)
    .join("\n");
  const answerLines = answers
    .map((answer) => `Q${answer.qNo}: ${answer.option}`)
    .join("\n");
  const system =
    "You are a strict MCQ grader for a multiple choice exam. Grade every candidate answer against the answer key exactly. A question the candidate did not answer is not counted as attended. Respond only with JSON.";
  const userLines = [
    "ANSWER KEY (correct option per question):",
    keyLines,
    "",
    "CANDIDATE ANSWERS:",
    answerLines || "(no answers attempted)",
    "",
    `There are ${ROUND1_QUESTION_COUNT} questions. Respond only with JSON of the form`,
    '{"attended": <integer>, "correct": <integer>, "score": <number 0-100, two decimals>}',
  ].join("\n");
  return { system, user: userLines };
}

export async function evaluateRound1(answers) {
  if (!geminiEnabled()) throw new Error("LLM evaluation is not enabled.");
  const { system, user } = buildRound1Prompt(answers);
  const verdict = await generateContent(system, user);
  const attended = Number(verdict?.attended);
  const correct = Number(verdict?.correct);
  const score = Number(verdict?.score);
  if (
    !Number.isInteger(attended) ||
    !Number.isInteger(correct) ||
    !Number.isFinite(score)
  ) {
    throw new Error("LLM Round 1 verdict was not parseable.");
  }
  const qAttended = Math.max(0, Math.min(ROUND1_QUESTION_COUNT, attended));
  const qCorrect = Math.max(0, Math.min(qAttended, correct));
  return {
    qAttended,
    qCorrect,
    score: Math.max(0, Math.min(100, Math.round(score * 100) / 100)),
  };
}

function buildRound2Prompt(row) {
  const question = DEBUG_QUESTIONS.find((q) => q.index === row.q_no);
  const expected = question?.sampleCases?.[row.language] ?? [];
  const expectedLines =
    expected.length > 0
      ? expected
          .map(
            (sample, i) =>
              `- Sample ${i + 1}${sample.input ? ` (input: ${sample.input})` : ""} expected output: ${JSON.stringify(sample.output)}`,
          )
          .join("\n")
      : "(no sample cases defined)";
  const system =
    "You evaluate programming debug-competition submissions for cheating. A submission is correct ONLY if the candidate program is a genuine fix that computes the expected outputs for the sample inputs by real logic and produces the observed output. Reject programs that merely print or hardcode the expected output with no real computation, programs unrelated to the task, or programs whose observed output is not genuinely produced by their own logic. Answer based on the program text plus the observed output. Respond only with JSON.";
  const user = [
    `Task: ${question?.statement ?? "(unknown task)"}`,
    "",
    "Expected outputs:",
    expectedLines,
    "",
    `Language: ${row.language}`,
    "",
    "Candidate program:",
    row.program || "(empty program)",
    "",
    "Observed stdout:",
    row.output || "(none)",
    "",
    "Observed stderr:",
    row.stderr || "(none)",
    "",
    `Exit code: ${row.exit_code ?? "(none)"}`,
    "",
    'Respond only with JSON: {"is_right": <true|false>, "hardcoded": <true|false>, "reason": "<short explanation>"}',
  ].join("\n");
  return { system, user };
}

export async function evaluateRound2(row) {
  if (!geminiEnabled()) throw new Error("LLM evaluation is not enabled.");
  const { system, user } = buildRound2Prompt(row);
  const verdict = await generateContent(system, user);
  if (typeof verdict?.is_right !== "boolean") {
    throw new Error("LLM Round 2 verdict was not parseable.");
  }
  return {
    isRight: verdict.is_right,
    hardcoded: verdict.hardcoded === true,
    reason:
      typeof verdict.reason === "string" ? verdict.reason.slice(0, 500) : "",
  };
}

const round2Queue = [];
const round2InFlight = new Set();
const round2Attempts = new Map();
let round2Workers = 0;

async function runRound2Job(job) {
  round2Workers += 1;
  const key = `${job.userId}:${job.qNo}`;
  try {
    const row = job.row ?? (await getRound2Submission(job.userId, job.qNo));
    if (!row) return;
    if (row.is_right !== null) return;
    if (!geminiEnabled()) return;
    const verdict = await evaluateRound2(row);
    await setRound2IsRight(job.userId, row.q_no, verdict.isRight);
  } catch (err) {
    const attempts = (round2Attempts.get(key) ?? 0) + 1;
    round2Attempts.set(key, attempts);
    if (attempts >= GEMINI_MAX_ATTEMPTS) {
      console.warn(`LLM Round 2 gave up on ${key} after ${attempts} attempts.`);
    } else {
      console.warn(
        `LLM Round 2 failed for ${key}: ${err instanceof Error ? err.message : err}`,
      );
    }
  } finally {
    round2Workers -= 1;
    round2InFlight.delete(key);
    pumpRound2();
  }
}

function pumpRound2() {
  if (!geminiEnabled()) return;
  while (round2Workers < LLM_MAX_CONCURRENCY && round2Queue.length > 0) {
    const job = round2Queue.shift();
    void runRound2Job(job);
  }
}

export function enqueueRound2Eval(userId, qNo, row = null) {
  if (!geminiEnabled()) return;
  const key = `${userId}:${qNo}`;
  if (round2InFlight.has(key)) return;
  if ((round2Attempts.get(key) ?? 0) >= GEMINI_MAX_ATTEMPTS) return;
  round2InFlight.add(key);
  round2Queue.push({ userId, qNo, row });
  pumpRound2();
}

export async function sweepPendingRound2() {
  if (!geminiEnabled()) return;
  const rows = await listPendingRound2Submissions();
  for (const row of rows) {
    if (round2InFlight.has(`${row.user_id}:${row.q_no}`)) continue;
    if ((round2Attempts.get(`${row.user_id}:${row.q_no}`) ?? 0) >= GEMINI_MAX_ATTEMPTS) continue;
    enqueueRound2Eval(row.user_id, row.q_no, row);
  }
}

export function startRound2Sweeper(intervalMs = 30_000) {
  const id = setInterval(() => {
    void sweepPendingRound2().catch(() => {
      // sweep failures self-heal on the next tick
    });
  }, intervalMs);
  id.unref();
  return id;
}

export async function evaluateRound2Single(userId, qNo) {
  if (!geminiEnabled()) return { ok: false, reason: "LLM evaluation is not enabled." };
  const row = await getRound2Submission(userId, qNo);
  if (!row) return { ok: false, reason: "Submission not found." };
  const verdict = await evaluateRound2(row);
  await setRound2IsRight(userId, row.q_no, verdict.isRight);
  return { ok: true, isRight: verdict.isRight, hardcoded: verdict.hardcoded, reason: verdict.reason };
}

export async function evaluateBatchRound2() {
  if (!geminiEnabled()) return { evaluated: 0, failed: 0, pending: 0 };
  const pending = await listPendingRound2Submissions();
  let evaluated = 0;
  let failed = 0;
  let head = 0;
  async function worker() {
    for (;;) {
      const row = pending[head++];
      if (!row) return;
      const key = `${row.user_id}:${row.q_no}`;
      if (round2InFlight.has(key)) continue;
      round2InFlight.add(key);
      try {
        const verdict = await evaluateRound2(row);
        await setRound2IsRight(row.user_id, row.q_no, verdict.isRight);
        round2Attempts.delete(key);
        evaluated += 1;
      } catch {
        const attempts = (round2Attempts.get(key) ?? 0) + 1;
        round2Attempts.set(key, attempts);
        failed += 1;
      } finally {
        round2InFlight.delete(key);
      }
    }
  }
  const workers = Math.max(1, Math.min(LLM_MAX_CONCURRENCY, pending.length));
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return { evaluated, failed, pending: pending.length };
}

function buildRound3Prompt(row) {
  const question = ROUND3_QUESTIONS.find((q) => q.index === row.q_no);
  const expected = question?.sampleCases?.[row.language] ?? [];
  const expectedLines =
    expected.length > 0
      ? expected
          .map(
            (sample, i) =>
              `- Sample ${i + 1}${sample.input ? ` (input: ${JSON.stringify(sample.input)})` : ""} expected output: ${JSON.stringify(sample.output)}`,
          )
          .join("\n")
      : "(no sample cases defined)";
  const system =
    "You evaluate coding contest solutions for cheating. The candidate program is a LeetCode-style `class Solution` method plus a small driver that reads sample input from stdin and prints the result. A submission is correct ONLY if the Solution method genuinely computes the expected outputs for the sample inputs by real logic and produces the observed stdout. Reject programs that merely print or hardcode the expected output with no real computation, programs unrelated to the task, or programs whose observed output is not genuinely produced by their own logic. Answer based on the program text plus the observed output. Respond only with JSON.";
  const user = [
    `Task: ${question?.statement ?? "(unknown task)"}`,
    "",
    "Expected outputs:",
    expectedLines,
    "",
    `Language: ${row.language}`,
    "",
    "Candidate program:",
    row.program || "(empty program)",
    "",
    "Observed stdout:",
    row.output || "(none)",
    "",
    "Observed stderr:",
    row.stderr || "(none)",
    "",
    `Exit code: ${row.exit_code ?? "(none)"}`,
    "",
    'Respond only with JSON: {"is_right": <true|false>, "hardcoded": <true|false>, "reason": "<short explanation>"}',
  ].join("\n");
  return { system, user };
}

export async function evaluateRound3(row) {
  if (!geminiEnabled()) throw new Error("LLM evaluation is not enabled.");
  const { system, user } = buildRound3Prompt(row);
  const verdict = await generateContent(system, user);
  if (typeof verdict?.is_right !== "boolean") {
    throw new Error("LLM Round 3 verdict was not parseable.");
  }
  return {
    isRight: verdict.is_right,
    hardcoded: verdict.hardcoded === true,
    reason:
      typeof verdict.reason === "string" ? verdict.reason.slice(0, 500) : "",
  };
}

const round3Queue = [];
const round3InFlight = new Set();
const round3Attempts = new Map();
let round3Workers = 0;

async function runRound3Job(job) {
  round3Workers += 1;
  const key = `${job.userId}:${job.qNo}`;
  try {
    const row = job.row ?? (await getRound3Submission(job.userId, job.qNo));
    if (!row) return;
    if (row.is_right !== null) return;
    if (!geminiEnabled()) return;
    const verdict = await evaluateRound3(row);
    await setRound3IsRight(job.userId, row.q_no, verdict.isRight);
  } catch (err) {
    const attempts = (round3Attempts.get(key) ?? 0) + 1;
    round3Attempts.set(key, attempts);
    if (attempts >= GEMINI_MAX_ATTEMPTS) {
      console.warn(`LLM Round 3 gave up on ${key} after ${attempts} attempts.`);
    } else {
      console.warn(
        `LLM Round 3 failed for ${key}: ${err instanceof Error ? err.message : err}`,
      );
    }
  } finally {
    round3Workers -= 1;
    round3InFlight.delete(key);
    pumpRound3();
  }
}

function pumpRound3() {
  if (!geminiEnabled()) return;
  while (round3Workers < LLM_MAX_CONCURRENCY && round3Queue.length > 0) {
    const job = round3Queue.shift();
    void runRound3Job(job);
  }
}

export function enqueueRound3Eval(userId, qNo, row = null) {
  if (!geminiEnabled()) return;
  const key = `${userId}:${qNo}`;
  if (round3InFlight.has(key)) return;
  if ((round3Attempts.get(key) ?? 0) >= GEMINI_MAX_ATTEMPTS) return;
  round3InFlight.add(key);
  round3Queue.push({ userId, qNo, row });
  pumpRound3();
}

export async function sweepPendingRound3() {
  if (!geminiEnabled()) return;
  const rows = await listPendingRound3Submissions();
  for (const row of rows) {
    if (round3InFlight.has(`${row.user_id}:${row.q_no}`)) continue;
    if ((round3Attempts.get(`${row.user_id}:${row.q_no}`) ?? 0) >= GEMINI_MAX_ATTEMPTS) continue;
    enqueueRound3Eval(row.user_id, row.q_no, row);
  }
}

export function startRound3Sweeper(intervalMs = 30_000) {
  const id = setInterval(() => {
    void sweepPendingRound3().catch(() => {
      // sweep failures self-heal on the next tick
    });
  }, intervalMs);
  id.unref();
  return id;
}

export async function evaluateRound3Single(userId, qNo) {
  if (!geminiEnabled()) return { ok: false, reason: "LLM evaluation is not enabled." };
  const row = await getRound3Submission(userId, qNo);
  if (!row) return { ok: false, reason: "Submission not found." };
  const verdict = await evaluateRound3(row);
  await setRound3IsRight(userId, row.q_no, verdict.isRight);
  return { ok: true, isRight: verdict.isRight, hardcoded: verdict.hardcoded, reason: verdict.reason };
}

export async function evaluateBatchRound3() {
  if (!geminiEnabled()) return { evaluated: 0, failed: 0, pending: 0 };
  const pending = await listPendingRound3Submissions();
  let evaluated = 0;
  let failed = 0;
  let head = 0;
  async function worker() {
    for (;;) {
      const row = pending[head++];
      if (!row) return;
      const key = `${row.user_id}:${row.q_no}`;
      if (round3InFlight.has(key)) continue;
      round3InFlight.add(key);
      try {
        const verdict = await evaluateRound3(row);
        await setRound3IsRight(row.user_id, row.q_no, verdict.isRight);
        round3Attempts.delete(key);
        evaluated += 1;
      } catch {
        const attempts = (round3Attempts.get(key) ?? 0) + 1;
        round3Attempts.set(key, attempts);
        failed += 1;
      } finally {
        round3InFlight.delete(key);
      }
    }
  }
  const workers = Math.max(1, Math.min(LLM_MAX_CONCURRENCY, pending.length));
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return { evaluated, failed, pending: pending.length };
}