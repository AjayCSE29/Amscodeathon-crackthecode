import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import {
  adminConfigured,
  hashPassword,
  issueAdminToken,
  issueToken,
  readAdminToken,
  readToken,
  verifyAdminLogin,
  verifyPassword,
} from "./auth.mjs";
import { clampFinishSeconds, scoreRound1 } from "./scoring.mjs";
import { ROUND1_QUESTION_COUNT, keyFor } from "./answerKey.mjs";
import {
  enqueueRound2Eval,
  enqueueRound3Eval,
  evaluateBatchRound2,
  evaluateBatchRound3,
  evaluateRound1,
  evaluateRound2Single,
  evaluateRound3Single,
  geminiEnabled,
  llmInfo,
  startRound2Sweeper,
  startRound3Sweeper,
} from "./evaluate.mjs";
import {
  countRound1Results,
  countRound2Results,
  countRound3Results,
  createUser,
  deleteUser,
  findUserByTeamName,
  findUserById,
  getRound1Result,
  getRound2Submission,
  getRound3Submission,
  isConfigured,
  listPendingRound2Submissions,
  listPendingRound3Submissions,
  listRound1Answers,
  listRound1Crosschecks,
  listRound1ResultsRecent,
  listRound1Summary,
  listRound2ResultsRecent,
  listRound2Standings,
  listRound2Submissions,
  listRound3ResultsRecent,
  listRound3Standings,
  listRound3Submissions,
  listTeams,
  replaceRound1Answers,
  resetAllResults,
  setRound2IsRight,
  setRound3IsRight,
  updateUser,
  upsertRound1Crosscheck,
  upsertRound1Result,
  upsertRound2Result,
  upsertRound2Submissions,
  upsertRound3Result,
  upsertRound3Submissions,
} from "./supabase.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");

const PORT = Number(process.env.PORT ?? 8787);
const PISTON_URL = (
  process.env.PISTON_URL ?? "http://127.0.0.1:2000/api/v2"
).replace(/\/+$/, "");
const RUN_TIMEOUT_MS = Number(process.env.RUN_TIMEOUT_MS ?? 10_000);
const QUEUE_TIMEOUT_MS = Number(process.env.QUEUE_TIMEOUT_MS ?? 30_000);
const MAX_CONCURRENCY = Number(process.env.MAX_CONCURRENCY ?? 8);
const RATE_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN ?? 30);
const MAX_CODE_BYTES = Number(process.env.MAX_CODE_BYTES ?? 64 * 1024);
const MAX_STDIN_BYTES = Number(process.env.MAX_STDIN_BYTES ?? 16 * 1024);
const BODY_LIMIT_BYTES = Number(process.env.BODY_LIMIT_BYTES ?? 192 * 1024);
const SYNC_BODY_LIMIT_BYTES = Number(process.env.SYNC_BODY_LIMIT_BYTES ?? 4 * 1024 * 1024);
const LOGIN_RATE_LIMIT_PER_MIN = Number(process.env.LOGIN_RATE_LIMIT_PER_MIN ?? 10);
const SYNC_RATE_LIMIT_PER_MIN = Number(process.env.SYNC_RATE_LIMIT_PER_MIN ?? 6);
const ADMIN_LOGIN_RATE_LIMIT_PER_MIN = Number(process.env.ADMIN_LOGIN_RATE_LIMIT_PER_MIN ?? 10);
const ADMIN_RATE_LIMIT_PER_MIN = Number(process.env.ADMIN_RATE_LIMIT_PER_MIN ?? 30);
const EVAL_RATE_LIMIT_PER_MIN = Number(process.env.EVAL_RATE_LIMIT_PER_MIN ?? 5);
const ROUND2_CONFIRM_RATE_LIMIT_PER_MIN = Number(
  process.env.ROUND2_CONFIRM_RATE_LIMIT_PER_MIN ?? 60,
);
const ROUND3_CONFIRM_RATE_LIMIT_PER_MIN = Number(
  process.env.ROUND3_CONFIRM_RATE_LIMIT_PER_MIN ?? 60,
);
const ROUND1_MAX_SECONDS = 45 * 60;
const ROUND2_MAX_SECONDS = 60 * 60;
const ROUND2_QUESTION_COUNT = 20;
const ROUND3_MAX_SECONDS = 60 * 60;
const ROUND3_QUESTION_COUNT = 4;

const LANGUAGE_MAP = {
  "C++": { piston: "c++", file: "solution.cpp" },
  Python: { piston: "python", file: "solution.py" },
  Java: { piston: "java", file: "Main.java" },
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

const queue = [];
const inflight = new Set();
const rateHits = new Map();
function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let done = false;
    const finish = (err, buf) => {
      if (done) return;
      done = true;
      if (err) reject(err);
      else resolve(buf);
    };
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        finish(new Error("request body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => finish(null, Buffer.concat(chunks)));
    req.on("error", finish);
  });
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

function rateLimited(ip, bucket, limit) {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const hits = (rateHits.get(key) ?? []).filter((t) => now - t < 60_000);
  if (hits.length >= limit) {
    rateHits.set(key, hits);
    return true;
  }
  hits.push(now);
  rateHits.set(key, hits);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of rateHits) {
    const next = hits.filter((t) => now - t < 60_000);
    if (next.length === 0) rateHits.delete(key);
    else rateHits.set(key, next);
  }
}, 60_000).unref();

function scrubPaths(text) {
  return text.replace(/\/tmp\/[^\s/]+\//g, "");
}

async function callPiston(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RUN_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${PISTON_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: payload.piston,
        version: "*",
        files: [{ name: payload.file, content: payload.code }],
        stdin: payload.stdin,
      }),
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new Error(`Execution timed out after ${RUN_TIMEOUT_MS}ms.`);
    }
    throw new Error(`Execution service unreachable (${PISTON_URL}).`);
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    throw new Error(`Execution service returned HTTP ${response.status}.`);
  }
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  const run = data.run ?? {};
  const compile = data.compile ?? {};
  const compileFailed =
    typeof compile.code === "number" && compile.code !== 0;
  const exitCode =
    typeof run.code === "number"
      ? run.code
      : compileFailed
        ? compile.code
        : null;
  let stdout = "";
  let stderr = "";
  if (compileFailed) {
    stderr = String(compile.stderr ?? compile.stdout ?? "");
  } else {
    stdout = String(run.stdout ?? "");
    stderr = String(run.stderr ?? "");
  }
  return {
    stdout: scrubPaths(stdout),
    stderr: scrubPaths(stderr),
    exitCode,
  };
}

function executeJob(job) {
  return callPiston(job.payload).then(
    (result) => json(job.res, 200, result),
    (err) =>
      json(job.res, 200, {
        stdout: "",
        stderr: err instanceof Error ? err.message : "Execution failed.",
        exitCode: null,
      }),
  );
}

function pump() {
  while (inflight.size < MAX_CONCURRENCY && queue.length > 0) {
    const job = queue.shift();
    if (Date.now() - job.createdAt > QUEUE_TIMEOUT_MS) {
      json(job.res, 200, {
        stdout: "",
        stderr: "Execution request timed out while queued.",
        exitCode: null,
      });
      continue;
    }
    inflight.add(job);
    void executeJob(job).finally(() => {
      inflight.delete(job);
      pump();
    });
  }
}

async function handleRun(req, res) {
  let buffer;
  try {
    buffer = await readBody(req, BODY_LIMIT_BYTES);
  } catch (err) {
    json(res, 413, { error: err instanceof Error ? err.message : "Request too large." });
    return;
  }
  let payload;
  try {
    payload = JSON.parse(buffer.toString("utf8"));
  } catch {
    json(res, 400, { error: "Invalid JSON body." });
    return;
  }
  const mapping = LANGUAGE_MAP[payload?.language];
  if (!mapping) {
    json(res, 400, { error: "Unsupported language." });
    return;
  }
  if (typeof payload.code !== "string" || payload.code.length === 0) {
    json(res, 400, { error: "code must be a non-empty string." });
    return;
  }
  if (Buffer.byteLength(payload.code, "utf8") > MAX_CODE_BYTES) {
    json(res, 400, { error: `code exceeds the ${MAX_CODE_BYTES} byte limit.` });
    return;
  }
  const stdin = typeof payload.stdin === "string" ? payload.stdin : "";
  if (Buffer.byteLength(stdin, "utf8") > MAX_STDIN_BYTES) {
    json(res, 400, { error: `stdin exceeds the ${MAX_STDIN_BYTES} byte limit.` });
    return;
  }
  const ip = clientIp(req);
  if (rateLimited(ip, "run", RATE_LIMIT_PER_MIN)) {
    json(res, 429, { error: "Too many executions. Please wait a moment." });
    return;
  }
  queue.push({
    createdAt: Date.now(),
    res,
    payload: { ...mapping, code: payload.code, stdin },
  });
  pump();
}

const DUMMY_HASH =
  "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

function readJsonBody(req, res, limit) {
  return readBody(req, limit)
    .then((buffer) => {
      try {
        return { ok: true, value: JSON.parse(buffer.toString("utf8")) };
      } catch {
        json(res, 400, { error: "Invalid JSON body." });
        return { ok: false, value: null };
      }
    })
    .catch((err) => {
      json(res, 413, { error: err instanceof Error ? err.message : "Request too large." });
      return { ok: false, value: null };
    });
}

function bearerToken(req) {
  const raw = req.headers.authorization;
  if (typeof raw !== "string") return null;
  const match = /^Bearer\s+(.+)$/i.exec(raw.trim());
  if (!match) return null;
  return match[1].trim();
}

async function handleLogin(req, res) {
  if (rateLimited(clientIp(req), "login", LOGIN_RATE_LIMIT_PER_MIN)) {
    json(res, 429, { error: "Too many attempts. Please wait a moment." });
    return;
  }
  if (!isConfigured()) {
    json(res, 503, { error: "Result storage is not configured." });
    return;
  }
  const body = await readJsonBody(req, res, 8 * 1024);
  if (!body.ok) return;
  const teamName = typeof body.value?.teamName === "string" ? body.value.teamName.trim() : "";
  const password = typeof body.value?.password === "string" ? body.value.password : "";
  if (teamName.length === 0 || teamName.length > 120) {
    json(res, 400, { error: "Team name is required." });
    return;
  }
  if (password.length === 0 || password.length > 200) {
    json(res, 400, { error: "Password is required." });
    return;
  }
  let user = null;
  try {
    user = await findUserByTeamName(teamName);
  } catch (err) {
    json(res, 502, { error: err instanceof Error ? err.message : "Storage unavailable." });
    return;
  }
  const stored = user?.hashed_password ?? DUMMY_HASH;
  const matches = verifyPassword(password, stored);
  if (!user || !matches) {
    json(res, 401, { error: "Team name or password is incorrect." });
    return;
  }
  if (user.is_active === false) {
    json(res, 403, { error: "This team has been disabled." });
    return;
  }
  try {
    json(res, 200, { userId: user.user_id, token: issueToken(user.user_id) });
  } catch (err) {
    json(res, 503, { error: err instanceof Error ? err.message : "Auth unavailable." });
  }
}

function normalizeRound1Answers(raw) {
  if (!Array.isArray(raw)) return [];
  const byQNo = new Map();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const qNo = Number(entry.qNo);
    if (!Number.isInteger(qNo) || qNo < 1 || qNo > ROUND1_QUESTION_COUNT) continue;
    const option = typeof entry.option === "string" ? entry.option.trim().toUpperCase() : "";
    if (!/^[ABCD]$/.test(option)) continue;
    byQNo.set(qNo, { q_no: qNo, option });
  }
  return [...byQNo.values()].sort((a, b) => a.q_no - b.q_no);
}

function truncate(value, maxChars) {
  if (typeof value !== "string") return "";
  return value.length > maxChars ? value.slice(0, maxChars) : value;
}

function normalizeRound2Submissions(raw) {
  if (!Array.isArray(raw)) return [];
  const byQNo = new Map();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const qNo = Number(entry.qNo);
    if (!Number.isInteger(qNo) || qNo < 1 || qNo > ROUND2_QUESTION_COUNT) continue;
    if (!LANGUAGE_MAP[entry.language]) continue;
    const exitCodeRaw = entry.exitCode;
    const exitCode =
      exitCodeRaw === null || exitCodeRaw === undefined ? null : Number(exitCodeRaw);
    if (exitCode !== null && !Number.isInteger(exitCode)) continue;
    byQNo.set(qNo, {
      q_no: qNo,
      language: entry.language,
      program: truncate(entry.program, 64 * 1024),
      output: truncate(entry.output, 64 * 1024),
      stderr: truncate(entry.stderr, 16 * 1024),
      exit_code: exitCode === null ? null : Math.max(-1, exitCode),
      is_hint: entry.isHint === true,
    });
  }
  return [...byQNo.values()].sort((a, b) => a.q_no - b.q_no);
}

function normalizeRound3Submissions(raw) {
  if (!Array.isArray(raw)) return [];
  const byQNo = new Map();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const qNo = Number(entry.qNo);
    if (!Number.isInteger(qNo) || qNo < 1 || qNo > ROUND3_QUESTION_COUNT) continue;
    if (!LANGUAGE_MAP[entry.language]) continue;
    const exitCodeRaw = entry.exitCode;
    const exitCode =
      exitCodeRaw === null || exitCodeRaw === undefined ? null : Number(exitCodeRaw);
    if (exitCode !== null && !Number.isInteger(exitCode)) continue;
    byQNo.set(qNo, {
      q_no: qNo,
      language: entry.language,
      program: truncate(entry.program, 64 * 1024),
      output: truncate(entry.output, 64 * 1024),
      stderr: truncate(entry.stderr, 16 * 1024),
      exit_code: exitCode === null ? null : Math.max(-1, exitCode),
      is_hint: entry.isHint === true,
    });
  }
  return [...byQNo.values()].sort((a, b) => a.q_no - b.q_no);
}

async function upsertRound1CrosscheckFromVerdict(userId, det, geminiVerdict, status) {
  await upsertRound1Crosscheck({
    user_id: userId,
    gemini_score: geminiVerdict ? geminiVerdict.score : null,
    gemini_correct: geminiVerdict ? geminiVerdict.qCorrect : null,
    gemini_attended: geminiVerdict ? geminiVerdict.qAttended : null,
    det_score: det.score,
    det_correct: det.qCorrect,
    status,
    checked_at: new Date().toISOString(),
  });
}

async function ingestRound1(userId, answersRaw, finishSecondsRaw) {
  const answers = normalizeRound1Answers(answersRaw);
  const det = scoreRound1(
    answers.map((row) => ({ qNo: row.q_no, option: row.option })),
  );
  const finishSeconds = clampFinishSeconds(finishSecondsRaw, ROUND1_MAX_SECONDS);
  await replaceRound1Answers(
    userId,
    answers.map((row) => ({ user_id: userId, ...row })),
  );

  let geminiVerdict = null;
  let status = "pending";
  if (geminiEnabled()) {
    try {
      geminiVerdict = await evaluateRound1(
        answers.map((row) => ({ qNo: row.q_no, option: row.option })),
      );
      status = "ok";
    } catch (err) {
      console.warn(
        `Round 1 LLM failed for ${userId}: ${err instanceof Error ? err.message : err}`,
      );
      status = err && err.retryable === true ? "retry-later" : "failed";
    }
  } else {
    status = "gemini-disabled";
  }
  const chosen = det;
  await upsertRound1Result({
    user_id: userId,
    q_attended: chosen.qAttended,
    q_correct: chosen.qCorrect,
    score: chosen.score,
    finish_seconds: finishSeconds,
    finished_at: new Date().toISOString(),
  });
  await upsertRound1CrosscheckFromVerdict(userId, det, geminiVerdict, status);
  return answers.length;
}

async function handleRound1Sync(req, res) {
  if (rateLimited(clientIp(req), "sync", SYNC_RATE_LIMIT_PER_MIN)) {
    json(res, 429, { error: "Too many syncs. Please wait a moment." });
    return;
  }
  const session = readToken(bearerToken(req));
  if (!session) {
    json(res, 401, { error: "Session expired. Re-enter your team credentials." });
    return;
  }
  if (!isConfigured()) {
    json(res, 503, { error: "Result storage is not configured." });
    return;
  }
  const body = await readJsonBody(req, res, SYNC_BODY_LIMIT_BYTES);
  if (!body.ok) return;
  const payload = body.value ?? {};
  const existing = await getRound1Result(session.userId);
  if (existing) {
    json(res, 200, { ok: true, accepted: { round1: 0 } });
    return;
  }
  let accepted = 0;
  try {
    accepted = await ingestRound1(session.userId, payload.answers, payload.finishSeconds);
  } catch (err) {
    json(res, 502, { error: err instanceof Error ? err.message : "Storage unavailable." });
    return;
  }
  json(res, 200, { ok: true, accepted: { round1: accepted } });
}

async function handleRound2Confirm(req, res) {
  if (rateLimited(clientIp(req), "confirm", ROUND2_CONFIRM_RATE_LIMIT_PER_MIN)) {
    json(res, 429, { error: "Too many confirmations. Please wait a moment." });
    return;
  }
  const session = readToken(bearerToken(req));
  if (!session) {
    json(res, 401, { error: "Session expired. Re-enter your team credentials." });
    return;
  }
  if (!isConfigured()) {
    json(res, 503, { error: "Result storage is not configured." });
    return;
  }
  const body = await readJsonBody(req, res, SYNC_BODY_LIMIT_BYTES);
  if (!body.ok) return;
  const row = normalizeRound2Submissions([
    {
      qNo: body.value?.qNo,
      language: body.value?.language,
      program: body.value?.program,
      output: body.value?.output,
      stderr: body.value?.stderr,
      exitCode: body.value?.exitCode,
      isHint: body.value?.isHint,
    },
  ])[0];
  if (!row) {
    json(res, 400, { error: "Invalid Round 2 submission." });
    return;
  }
  try {
    await upsertRound2Submissions([{ user_id: session.userId, ...row }]);
  } catch (err) {
    json(res, 502, { error: err instanceof Error ? err.message : "Storage unavailable." });
    return;
  }
  const fresh = await getRound2Submission(session.userId, row.q_no).catch(() => null);
  const sameContent =
    fresh !== null &&
    fresh !== undefined &&
    fresh.program === row.program &&
    fresh.output === row.output &&
    fresh.stderr === row.stderr &&
    fresh.exit_code === row.exit_code &&
    fresh.is_hint === row.is_hint;
  if (!sameContent) {
    await setRound2IsRight(session.userId, row.q_no, null).catch(() => {});
  }
  enqueueRound2Eval(session.userId, row.q_no);
  json(res, 200, { ok: true, accepted: { round2: 1 } });
}

async function handleRound3Confirm(req, res) {
  if (rateLimited(clientIp(req), "round3-confirm", ROUND3_CONFIRM_RATE_LIMIT_PER_MIN)) {
    json(res, 429, { error: "Too many confirmations. Please wait a moment." });
    return;
  }
  const session = readToken(bearerToken(req));
  if (!session) {
    json(res, 401, { error: "Session expired. Re-enter your team credentials." });
    return;
  }
  if (!isConfigured()) {
    json(res, 503, { error: "Result storage is not configured." });
    return;
  }
  const body = await readJsonBody(req, res, SYNC_BODY_LIMIT_BYTES);
  if (!body.ok) return;
  const row = normalizeRound3Submissions([
    {
      qNo: body.value?.qNo,
      language: body.value?.language,
      program: body.value?.program,
      output: body.value?.output,
      stderr: body.value?.stderr,
      exitCode: body.value?.exitCode,
      isHint: body.value?.isHint,
    },
  ])[0];
  if (!row) {
    json(res, 400, { error: "Invalid Round 3 submission." });
    return;
  }
  try {
    await upsertRound3Submissions([{ user_id: session.userId, ...row }]);
  } catch (err) {
    json(res, 502, { error: err instanceof Error ? err.message : "Storage unavailable." });
    return;
  }
  const fresh = await getRound3Submission(session.userId, row.q_no).catch(() => null);
  const sameContent =
    fresh !== null &&
    fresh !== undefined &&
    fresh.program === row.program &&
    fresh.output === row.output &&
    fresh.stderr === row.stderr &&
    fresh.exit_code === row.exit_code &&
    fresh.is_hint === row.is_hint;
  if (!sameContent) {
    await setRound3IsRight(session.userId, row.q_no, null).catch(() => {});
  }
  enqueueRound3Eval(session.userId, row.q_no);
  json(res, 200, { ok: true, accepted: { round3: 1 } });
}

async function handleSync(req, res) {
  if (rateLimited(clientIp(req), "sync", SYNC_RATE_LIMIT_PER_MIN)) {
    json(res, 429, { error: "Too many syncs. Please wait a moment." });
    return;
  }
  const session = readToken(bearerToken(req));
  if (!session) {
    json(res, 401, { error: "Session expired. Re-enter your team credentials." });
    return;
  }
  if (!isConfigured()) {
    json(res, 503, { error: "Result storage is not configured." });
    return;
  }
  const userId = session.userId;
  const body = await readJsonBody(req, res, SYNC_BODY_LIMIT_BYTES);
  if (!body.ok) return;
  const payload = body.value ?? {};

  let round1Accepted = 0;
  let round2Accepted = 0;
  let round3Accepted = 0;
  try {
    if (payload.round1 && typeof payload.round1 === "object") {
      const existing = await getRound1Result(userId);
      if (!existing) {
        round1Accepted = await ingestRound1(
          userId,
          payload.round1.answers,
          payload.round1.finishSeconds,
        );
      }
    }

    if (payload.round2 && typeof payload.round2 === "object") {
      const submissions = normalizeRound2Submissions(payload.round2.submissions);
      const finishSeconds = clampFinishSeconds(
        payload.round2.finishSeconds,
        ROUND2_MAX_SECONDS,
      );
      await upsertRound2Submissions(
        submissions.map((row) => ({ user_id: userId, ...row })),
      );
      await upsertRound2Result({
        user_id: userId,
        q_completed: submissions.length,
        finish_seconds: finishSeconds,
        finished_at: new Date().toISOString(),
      });
      for (const row of submissions) {
        enqueueRound2Eval(userId, row.q_no);
      }
      round2Accepted = submissions.length;
    }

    if (payload.round3 && typeof payload.round3 === "object") {
      const submissions = normalizeRound3Submissions(payload.round3.submissions);
      const finishSeconds = clampFinishSeconds(
        payload.round3.finishSeconds,
        ROUND3_MAX_SECONDS,
      );
      await upsertRound3Submissions(
        submissions.map((row) => ({ user_id: userId, ...row })),
      );
      await upsertRound3Result({
        user_id: userId,
        q_completed: submissions.length,
        finish_seconds: finishSeconds,
        finished_at: new Date().toISOString(),
      });
      for (const row of submissions) {
        enqueueRound3Eval(userId, row.q_no);
      }
      round3Accepted = submissions.length;
    }
  } catch (err) {
    json(res, 502, { error: err instanceof Error ? err.message : "Storage unavailable." });
    return;
  }

  json(res, 200, {
    ok: true,
    accepted: { round1: round1Accepted, round2: round2Accepted, round3: round3Accepted },
  });
}

function jsonError(res, err) {
  json(res, 502, { error: err instanceof Error ? err.message : "Storage unavailable." });
}

async function handleAdminLogin(req, res) {
  if (rateLimited(clientIp(req), "admin-login", ADMIN_LOGIN_RATE_LIMIT_PER_MIN)) {
    json(res, 429, { error: "Too many attempts. Please wait a moment." });
    return;
  }
  if (!adminConfigured()) {
    json(res, 503, { error: "Admin authentication is not configured." });
    return;
  }
  const body = await readJsonBody(req, res, 8 * 1024);
  if (!body.ok) return;
  const username = typeof body.value?.username === "string" ? body.value.username.trim() : "";
  const password = typeof body.value?.password === "string" ? body.value.password : "";
  if (username.length === 0 || username.length > 120 || password.length === 0 || password.length > 200) {
    json(res, 400, { error: "Username and password are required." });
    return;
  }
  if (!verifyAdminLogin(username, password)) {
    json(res, 401, { error: "Username or password is incorrect." });
    return;
  }
  try {
    json(res, 200, { ok: true, role: "admin", token: issueAdminToken(username) });
  } catch (err) {
    json(res, 503, { error: err instanceof Error ? err.message : "Auth unavailable." });
  }
}

function requireAdminApi(req, res, bucket = "admin-data", limit = ADMIN_RATE_LIMIT_PER_MIN) {
  const admin = readAdminToken(bearerToken(req));
  if (!admin) {
    json(res, 401, { error: "Admin session expired or invalid." });
    return null;
  }
  if (rateLimited(clientIp(req), bucket, limit)) {
    json(res, 429, { error: "Too many admin requests. Please wait a moment." });
    return null;
  }
  if (!isConfigured()) {
    json(res, 503, { error: "Result storage is not configured." });
    return null;
  }
  return admin;
}

async function handleAdminOverview(req, res) {
  if (!requireAdminApi(req, res)) return;
  try {
    const [teams, round1Completed, round2Completed, round3Completed, recentRound1, recentRound2, recentRound3, pendingRound2, pendingRound3] =
      await Promise.all([
        listTeams(),
        countRound1Results(),
        countRound2Results(),
        countRound3Results(),
        listRound1ResultsRecent(),
        listRound2ResultsRecent(),
        listRound3ResultsRecent(),
        listPendingRound2Submissions(),
        listPendingRound3Submissions(),
      ]);
    const names = new Map(teams.map((team) => [team.user_id, team.team_name]));
    const tag = (rows) =>
      rows.map((row) => ({
        user_id: row.user_id,
        team_name: names.get(row.user_id) ?? row.user_id,
        finish_seconds: row.finish_seconds,
        finished_at: row.finished_at,
      }));
    json(res, 200, {
      teams: teams.length,
      round1Completed,
      round2Completed,
      round3Completed,
      pendingRound2Evaluations: pendingRound2.length,
      pendingRound3Evaluations: pendingRound3.length,
      recentRound1: tag(recentRound1),
      recentRound2: tag(recentRound2),
      recentRound3: tag(recentRound3),
    });
  } catch (err) {
    jsonError(res, err);
  }
}

async function handleAdminRound1(req, res) {
  if (!requireAdminApi(req, res)) return;
  try {
    const [teams, answers, crosschecks] = await Promise.all([
      listRound1Summary(),
      listRound1Answers(),
      listRound1Crosschecks(),
    ]);
    const crossByUser = new Map(crosschecks.map((row) => [row.user_id, row]));
    const answersByUser = new Map();
    for (const answer of answers) {
      if (!answersByUser.has(answer.user_id)) answersByUser.set(answer.user_id, new Map());
      answersByUser.get(answer.user_id).set(answer.q_no, answer.option);
    }
    const rows = teams.map((team) => {
      const userAnswers = answersByUser.get(team.user_id) ?? new Map();
      const cross = crossByUser.get(team.user_id);
      const questions = [];
      for (let qNo = 1; qNo <= ROUND1_QUESTION_COUNT; qNo++) {
        const selected = userAnswers.get(qNo) ?? null;
        const correct = keyFor(qNo);
        questions.push({
          q_no: qNo,
          selected,
          correct_option: correct,
          status: selected === null ? "not_attended" : selected === correct ? "correct" : "wrong",
        });
      }
      return {
        user_id: team.user_id,
        team_name: team.team_name,
        score: team.score,
        q_attended: team.q_attended,
        q_correct: team.q_correct,
        finish_seconds: team.finish_seconds,
        finished_at: team.finished_at,
        gemini_score: cross?.gemini_score ?? null,
        gemini_correct: cross?.gemini_correct ?? null,
        eval_status: cross?.status ?? "pending",
        questions,
      };
    });
    json(res, 200, { rows });
  } catch (err) {
    jsonError(res, err);
  }
}

async function handleAdminRound2(req, res) {
  if (!requireAdminApi(req, res)) return;
  try {
    const [standings, submissions] = await Promise.all([
      listRound2Standings(),
      listRound2Submissions(),
    ]);
    json(res, 200, { standings, submissions });
  } catch (err) {
    jsonError(res, err);
  }
}

async function handleAdminListTeams(req, res) {
  if (!requireAdminApi(req, res)) return;
  try {
    json(res, 200, { teams: await listTeams() });
  } catch (err) {
    jsonError(res, err);
  }
}

async function handleAdminCreateTeam(req, res) {
  if (!requireAdminApi(req, res)) return;
  const body = await readJsonBody(req, res, 8 * 1024);
  if (!body.ok) return;
  const userId = typeof body.value?.user_id === "string" ? body.value.user_id.trim() : "";
  const teamName = typeof body.value?.team_name === "string" ? body.value.team_name.trim() : "";
  const password = typeof body.value?.password === "string" ? body.value.password : "";
  if (!/^[a-zA-Z0-9._-]{1,64}$/.test(userId)) {
    json(res, 400, { error: "User ID must be 1-64 characters of letters, digits, dot, dash, underscore." });
    return;
  }
  if (teamName.length === 0 || teamName.length > 120) {
    json(res, 400, { error: "Team name is required." });
    return;
  }
  if (password.length < 4 || password.length > 200) {
    json(res, 400, { error: "Password must be 4-200 characters." });
    return;
  }
  try {
    const [byName, byId] = await Promise.all([
      findUserByTeamName(teamName),
      findUserById(userId),
    ]);
    if (byName || byId) {
      json(res, 409, { error: "Team name or user ID already exists." });
      return;
    }
    await createUser({
      user_id: userId,
      team_name: teamName,
      hashed_password: hashPassword(password),
    });
    json(res, 200, { ok: true });
  } catch (err) {
    jsonError(res, err);
  }
}

async function handleAdminUpdateTeam(req, res) {
  if (!requireAdminApi(req, res)) return;
  const body = await readJsonBody(req, res, 8 * 1024);
  if (!body.ok) return;
  const userId = typeof body.value?.user_id === "string" ? body.value.user_id.trim() : "";
  if (userId.length === 0 || userId.length > 64) {
    json(res, 400, { error: "User ID is required." });
    return;
  }
  const patch = {};
  if (body.value?.team_name !== undefined) {
    const teamName = typeof body.value.team_name === "string" ? body.value.team_name.trim() : "";
    if (teamName.length === 0 || teamName.length > 120) {
      json(res, 400, { error: "Team name must be 1-120 characters." });
      return;
    }
    patch.team_name = teamName;
  }
  if (body.value?.password !== undefined && body.value.password !== "") {
    const password = typeof body.value.password === "string" ? body.value.password : "";
    if (password.length < 4 || password.length > 200) {
      json(res, 400, { error: "Password must be 4-200 characters." });
      return;
    }
    patch.hashed_password = hashPassword(password);
  }
  if (body.value?.is_active !== undefined) {
    if (typeof body.value.is_active !== "boolean") {
      json(res, 400, { error: "is_active must be a boolean." });
      return;
    }
    patch.is_active = body.value.is_active;
  }
  if (Object.keys(patch).length === 0) {
    json(res, 400, { error: "Nothing to update." });
    return;
  }
  try {
    await updateUser(userId, patch);
    json(res, 200, { ok: true });
  } catch (err) {
    jsonError(res, err);
  }
}

async function handleAdminDeleteTeam(req, res) {
  if (!requireAdminApi(req, res)) return;
  const body = await readJsonBody(req, res, 8 * 1024);
  if (!body.ok) return;
  const userId = typeof body.value?.user_id === "string" ? body.value.user_id.trim() : "";
  if (userId.length === 0 || userId.length > 64) {
    json(res, 400, { error: "User ID is required." });
    return;
  }
  try {
    await deleteUser(userId);
    json(res, 200, { ok: true });
  } catch (err) {
    jsonError(res, err);
  }
}

async function handleAdminReset(req, res) {
  if (!requireAdminApi(req, res)) return;
  try {
    const cleared = await resetAllResults();
    json(res, 200, { ok: true, cleared });
  } catch (err) {
    jsonError(res, err);
  }
}

async function handleAdminEvalRound1(req, res) {
  if (!requireAdminApi(req, res, "admin-eval", EVAL_RATE_LIMIT_PER_MIN)) return;
  if (!geminiEnabled()) {
    json(res, 200, { evaluated: 0, failed: 0, reason: "Gemini evaluation is not enabled." });
    return;
  }
  try {
    const [teams, answers, crosschecks] = await Promise.all([
      listRound1Summary(),
      listRound1Answers(),
      listRound1Crosschecks(),
    ]);
    const answersByUser = new Map();
    for (const answer of answers) {
      if (!answersByUser.has(answer.user_id)) answersByUser.set(answer.user_id, []);
      answersByUser.get(answer.user_id).push(answer);
    }
    const alreadyOk = new Set(
      crosschecks.filter((row) => row.status === "ok").map((row) => row.user_id),
    );
    const targets = teams.filter((team) => !alreadyOk.has(team.user_id));
    let evaluated = 0;
    let failed = 0;
    for (const team of targets) {
      const list = answersByUser.get(team.user_id) ?? [];
      const mapped = list.map((answer) => ({ qNo: answer.q_no, option: answer.option }));
      const det = scoreRound1(mapped);
      try {
        const geminiVerdict = await evaluateRound1(mapped);
        await upsertRound1CrosscheckFromVerdict(team.user_id, det, geminiVerdict, "ok");
        evaluated += 1;
      } catch (err) {
        await upsertRound1CrosscheckFromVerdict(
          team.user_id,
          det,
          null,
          err && err.retryable === true ? "retry-later" : "failed",
        );
        failed += 1;
      }
    }
    json(res, 200, { evaluated, failed, skipped: targets.length - evaluated - failed });
  } catch (err) {
    jsonError(res, err);
  }
}

async function handleAdminEvalRound2(req, res) {
  if (!requireAdminApi(req, res, "admin-eval", EVAL_RATE_LIMIT_PER_MIN)) return;
  const body = await readJsonBody(req, res, 8 * 1024);
  if (!body.ok) return;
  const userId =
    typeof body.value?.user_id === "string" ? body.value.user_id.trim() : "";
  const qNo = Number(body.value?.q_no);
  try {
    if (userId.length > 0 && Number.isInteger(qNo)) {
      json(res, 200, await evaluateRound2Single(userId, qNo));
      return;
    }
    json(res, 200, await evaluateBatchRound2());
  } catch (err) {
    jsonError(res, err);
  }
}

async function handleAdminRound3(req, res) {
  if (!requireAdminApi(req, res)) return;
  try {
    const [standings, submissions] = await Promise.all([
      listRound3Standings(),
      listRound3Submissions(),
    ]);
    json(res, 200, { standings, submissions });
  } catch (err) {
    jsonError(res, err);
  }
}

async function handleAdminEvalRound3(req, res) {
  if (!requireAdminApi(req, res, "admin-eval", EVAL_RATE_LIMIT_PER_MIN)) return;
  const body = await readJsonBody(req, res, 8 * 1024);
  if (!body.ok) return;
  const userId =
    typeof body.value?.user_id === "string" ? body.value.user_id.trim() : "";
  const qNo = Number(body.value?.q_no);
  try {
    if (userId.length > 0 && Number.isInteger(qNo)) {
      json(res, 200, await evaluateRound3Single(userId, qNo));
      return;
    }
    json(res, 200, await evaluateBatchRound3());
  } catch (err) {
    jsonError(res, err);
  }
}

function csv(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

async function handleAdminExport(req, res) {
  if (!requireAdminApi(req, res)) return;
  try {
    const [teams, summary, standings, crosschecks, round3Standings] = await Promise.all([
      listTeams(),
      listRound1Summary(),
      listRound2Standings(),
      listRound1Crosschecks(),
      listRound3Standings(),
    ]);
    const r1 = new Map(summary.map((row) => [row.user_id, row]));
    const r2 = new Map(standings.map((row) => [row.user_id, row]));
    const r3 = new Map(round3Standings.map((row) => [row.user_id, row]));
    const cc = new Map(crosschecks.map((row) => [row.user_id, row]));
    const headers = [
      "user_id",
      "team_name",
      "is_active",
      "round1_attended",
      "round1_correct",
      "round1_score",
      "round1_finish_seconds",
      "round1_finished_at",
      "round1_gemini_score",
      "round1_gemini_correct",
      "round2_completed",
      "round2_graded",
      "round2_total_score",
      "round2_finish_seconds",
      "round3_completed",
      "round3_graded",
      "round3_total_score",
      "round3_finish_seconds",
    ];
    const lines = [headers.join(",")];
    for (const team of teams) {
      const one = r1.get(team.user_id);
      const two = r2.get(team.user_id);
      const three = r3.get(team.user_id);
      const cross = cc.get(team.user_id);
      lines.push(
        headers
          .map((header) => {
            const values = {
              user_id: team.user_id,
              team_name: team.team_name,
              is_active: team.is_active,
              round1_attended: one?.q_attended ?? 0,
              round1_correct: one?.q_correct ?? 0,
              round1_score: one?.score ?? 0,
              round1_finish_seconds: one?.finish_seconds ?? 2700,
              round1_finished_at: one?.finished_at ?? "",
              round1_gemini_score: cross?.gemini_score ?? "",
              round1_gemini_correct: cross?.gemini_correct ?? "",
              round2_completed: two?.q_completed ?? 0,
              round2_graded: two?.graded_count ?? 0,
              round2_total_score: two?.total_score ?? 0,
              round2_finish_seconds: two?.finish_seconds ?? 3600,
              round3_completed: three?.q_completed ?? 0,
              round3_graded: three?.graded_count ?? 0,
              round3_total_score: three?.total_score ?? 0,
              round3_finish_seconds: three?.finish_seconds ?? 3600,
            };
            return csv(values[header] ?? "");
          })
          .join(","),
      );
    }
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="results.csv"',
    });
    res.end(lines.join("\r\n"));
  } catch (err) {
    jsonError(res, err);
  }
}

async function serveStatic(res, pathname) {
  let relative =
    pathname === "/" ? "index.html" : decodeURIComponent(pathname).replace(/^\/+/, "");
  if (relative === "admin" || relative === "admin/") relative = "admin.html";
  const filePath = normalize(join(DIST_DIR, relative));
  if (!filePath.startsWith(normalize(DIST_DIR))) {
    json(res, 403, { error: "Forbidden." });
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");
    const content = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
    });
    res.end(content);
    return;
  } catch {
    try {
      const fallback = await readFile(join(DIST_DIR, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fallback);
    } catch {
      json(res, 503, {
        error: "Frontend build not found. Run `npm run build` before using the production server.",
      });
    }
  }
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }
  if (req.method === "POST" && pathname === "/api/run") {
    await handleRun(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/auth/login") {
    await handleLogin(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/sync") {
    await handleSync(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/sync/round1") {
    await handleRound1Sync(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/round2/confirm") {
    await handleRound2Confirm(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/round3/confirm") {
    await handleRound3Confirm(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/admin/login") {
    await handleAdminLogin(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/admin/evaluate/round1") {
    await handleAdminEvalRound1(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/admin/evaluate/round2") {
    await handleAdminEvalRound2(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/admin/evaluate/round3") {
    await handleAdminEvalRound3(req, res);
    return;
  }
  if (req.method === "GET" && pathname === "/api/admin/overview") {
    await handleAdminOverview(req, res);
    return;
  }
  if (req.method === "GET" && pathname === "/api/admin/round1") {
    await handleAdminRound1(req, res);
    return;
  }
  if (req.method === "GET" && pathname === "/api/admin/round2") {
    await handleAdminRound2(req, res);
    return;
  }
  if (req.method === "GET" && pathname === "/api/admin/round3") {
    await handleAdminRound3(req, res);
    return;
  }
  if (req.method === "GET" && pathname === "/api/admin/export") {
    await handleAdminExport(req, res);
    return;
  }
  if (req.method === "GET" && pathname === "/api/admin/teams") {
    await handleAdminListTeams(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/admin/teams") {
    await handleAdminCreateTeam(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/reset") {
    await handleAdminReset(req, res);
    return;
  }
  if (req.method === "PATCH" && pathname === "/api/admin/teams") {
    await handleAdminUpdateTeam(req, res);
    return;
  }
  if (req.method === "DELETE" && pathname === "/api/admin/teams") {
    await handleAdminDeleteTeam(req, res);
    return;
  }
  if (req.method === "GET" && pathname === "/api/health") {
    json(res, 200, {
      ok: true,
      piston: PISTON_URL,
      supabase: isConfigured(),
      admin: adminConfigured(),
      gemini: geminiEnabled(),
      llm: llmInfo(),
    });
    return;
  }
  if (req.method === "GET") {
    await serveStatic(res, pathname);
    return;
  }
  json(res, 404, { error: "Not found." });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Codeathon server listening on 0.0.0.0:${PORT}`);
  console.log(`Piston target: ${PISTON_URL}`);
});

startRound2Sweeper();
startRound3Sweeper();