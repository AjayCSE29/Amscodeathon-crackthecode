import type {
  AssessmentSession,
  DebugSubmission,
  OptionId,
  SubmissionSnapshot,
} from "../types/assessment";
import { MOCK_QUESTIONS } from "../data/mockQuestions";
import { ROUND3_QUESTIONS } from "../data/round3Questions";

export interface LoginResult {
  userId: string;
  token: string;
}

export class AuthError extends Error {}

const INDEX_BY_QUESTION_ID = new Map(MOCK_QUESTIONS.map((q) => [q.id, q.index]));
const ROUND3_QUESTION_IDS = new Set(ROUND3_QUESTIONS.map((q) => q.id));

function buildRound1Answers(session: AssessmentSession) {
  const answers: { qNo: number; option: OptionId }[] = [];
  for (const [questionId, option] of Object.entries(session.responses)) {
    if (option == null) continue;
    const qNo = INDEX_BY_QUESTION_ID.get(questionId);
    if (qNo === undefined) continue;
    answers.push({ qNo, option });
  }
  return answers.sort((a, b) => a.qNo - b.qNo);
}

function round2Row(session: AssessmentSession, submission: DebugSubmission) {
  const stdouts = submission.samples.map((sample) => sample.stdout);
  const stderrs = submission.samples
    .map((sample) => sample.stderr)
    .filter((text) => text.length > 0);
  const failed = submission.samples.find(
    (sample) => typeof sample.exitCode === "number" && sample.exitCode !== 0,
  );
  const exitCode = failed
    ? failed.exitCode
    : submission.samples.length > 0
      ? 0
      : null;
  return {
    qNo: submission.questionIndex,
    language: submission.language,
    program: submission.code,
    output: stdouts.join("\n"),
    stderr: stderrs.join("\n"),
    exitCode,
    isHint: session.hintReveals[submission.questionId] === true,
  };
}

function buildRound2Submissions(
  session: AssessmentSession,
  snapshot: SubmissionSnapshot | null,
) {
  if (!snapshot) return [];
  return snapshot.submissions.map((submission) => round2Row(session, submission));
}

function round3Row(session: AssessmentSession, submission: DebugSubmission) {
  return round2Row(session, submission);
}

function buildRound3Submissions(
  session: AssessmentSession,
  snapshot: SubmissionSnapshot | null,
) {
  if (!snapshot) return [];
  return snapshot.submissions
    .filter((submission) => ROUND3_QUESTION_IDS.has(submission.questionId))
    .map((submission) => round3Row(session, submission));
}

function remainingSeconds(expiresAt: number | null, fallback: number) {
  if (expiresAt == null || !Number.isFinite(expiresAt)) return fallback;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

export async function login(teamName: string, password: string): Promise<LoginResult> {
  let response: Response;
  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName, password }),
    });
  } catch {
    throw new AuthError("Cannot reach the server. Check your connection.");
  }
  let payload: { userId?: string; token?: string; error?: string } = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  if (!response.ok) {
    throw new AuthError(payload.error ?? "Sign-in failed.");
  }
  if (typeof payload.userId !== "string" || typeof payload.token !== "string") {
    throw new AuthError("Sign-in failed.");
  }
  return { userId: payload.userId, token: payload.token };
}

export async function syncSubmission(
  session: AssessmentSession,
  snapshot: SubmissionSnapshot | null,
): Promise<void> {
  const round2FinishSeconds =
    session.round2FinishSeconds ?? remainingSeconds(session.round2ExpiresAt, 0);
  const round3FinishSeconds =
    session.round3FinishSeconds ?? remainingSeconds(session.round3ExpiresAt, 0);
  const response = await fetch("/api/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.candidate.token}`,
    },
    body: JSON.stringify({
      round1: {
        answers: buildRound1Answers(session),
        finishSeconds: session.round1FinishSeconds ?? 45 * 60,
      },
      round2: {
        submissions: buildRound2Submissions(session, snapshot),
        finishSeconds: round2FinishSeconds,
      },
      round3: {
        submissions: buildRound3Submissions(session, snapshot),
        finishSeconds: round3FinishSeconds,
      },
    }),
  });
  if (response.status === 401) {
    throw new AuthError("Your session expired. Ask an invigilator to re-enter your team.");
  }
  if (!response.ok) {
    let message = `Sync failed (HTTP ${response.status}).`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (typeof payload.error === "string") message = payload.error;
    } catch {
      /* keep the generic message */
    }
    throw new Error(message);
  }
}

export async function syncRound1(session: AssessmentSession): Promise<void> {
  const response = await fetch("/api/sync/round1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.candidate.token}`,
    },
    body: JSON.stringify({
      answers: buildRound1Answers(session),
      finishSeconds: session.round1FinishSeconds ?? 45 * 60,
    }),
  });
  if (response.status === 401) {
    throw new AuthError("Your session expired. Ask an invigilator to re-enter your team.");
  }
  if (!response.ok) {
    let message = `Round 1 sync failed (HTTP ${response.status}).`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (typeof payload.error === "string") message = payload.error;
    } catch {
      /* keep the generic message */
    }
    throw new Error(message);
  }
}

export async function confirmRound2Submission(
  session: AssessmentSession,
  submission: DebugSubmission,
): Promise<void> {
  const response = await fetch("/api/round2/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.candidate.token}`,
    },
    body: JSON.stringify(round2Row(session, submission)),
  });
  if (response.status === 401) {
    throw new AuthError("Your session expired. Ask an invigilator to re-enter your team.");
  }
  if (!response.ok) {
    let message = `Round 2 sync failed (HTTP ${response.status}).`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (typeof payload.error === "string") message = payload.error;
    } catch {
      /* keep the generic message */
    }
    throw new Error(message);
  }
}

export async function confirmRound3Submission(
  session: AssessmentSession,
  submission: DebugSubmission,
): Promise<void> {
  const response = await fetch("/api/round3/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.candidate.token}`,
    },
    body: JSON.stringify(round2Row(session, submission)),
  });
  if (response.status === 401) {
    throw new AuthError("Your session expired. Ask an invigilator to re-enter your team.");
  }
  if (!response.ok) {
    let message = `Round 3 sync failed (HTTP ${response.status}).`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (typeof payload.error === "string") message = payload.error;
    } catch {
      /* keep the generic message */
    }
    throw new Error(message);
  }
}
