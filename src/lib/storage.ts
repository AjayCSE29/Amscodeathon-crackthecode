import type {
  AssessmentSession,
  OptionId,
  SubmissionSnapshot,
} from "../types/assessment";

const SESSION_KEY = "codeathon_session";
const ANSWERS_KEY = "codeathon_answers";
const FLAGS_KEY = "codeathon_flags";
const VISITED_KEY = "codeathon_visited";
const CODE_EDITS_KEY = "codeathon_code_edits";
const SUBMISSIONS_KEY = "codeathon_submissions";

export interface StorageFailure {
  ok: false;
  reason: "missing" | "corrupt";
}

function readRaw(key: string): unknown {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function writeRaw(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable / quota exceeded — state survives in memory only.
  }
}

function removeRaw(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function isSessionLike(value: unknown): value is AssessmentSession {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  if (typeof s.candidate !== "object" || s.candidate === null) return false;
  const candidate = s.candidate as Record<string, unknown>;
  return (
    typeof s.sessionId === "string" &&
    typeof s.startedAt === "number" &&
    typeof s.expiresAt === "number" &&
    typeof s.currentQuestion === "number" &&
    (s.status === "entry" ||
      s.status === "active" ||
      s.status === "round1-submitted" ||
      s.status === "round2" ||
      s.status === "round2-submitted" ||
      s.status === "round3" ||
      s.status === "submitted") &&
    typeof candidate.teamName === "string" &&
    typeof candidate.userId === "string" &&
    typeof candidate.token === "string" &&
    typeof s.responses === "object" &&
    s.responses !== null &&
    typeof s.reviewFlags === "object" &&
    s.reviewFlags !== null &&
    typeof s.visited === "object" &&
    s.visited !== null &&
    (s.round1FinishSeconds === undefined ||
      s.round1FinishSeconds === null ||
      typeof s.round1FinishSeconds === "number") &&
    (s.round1Synced === undefined || typeof s.round1Synced === "boolean") &&
    (s.round2ExpiresAt === undefined ||
      s.round2ExpiresAt === null ||
      typeof s.round2ExpiresAt === "number") &&
    (s.round2FinishSeconds === undefined ||
      s.round2FinishSeconds === null ||
      typeof s.round2FinishSeconds === "number") &&
    (s.round3ExpiresAt === undefined ||
      s.round3ExpiresAt === null ||
      typeof s.round3ExpiresAt === "number") &&
    (s.round3FinishSeconds === undefined ||
      s.round3FinishSeconds === null ||
      typeof s.round3FinishSeconds === "number") &&
    (s.currentDebug === undefined || typeof s.currentDebug === "number") &&
    (s.codeEdits === undefined ||
      (typeof s.codeEdits === "object" && s.codeEdits !== null)) &&
    (s.debugSubmissions === undefined ||
      (typeof s.debugSubmissions === "object" && s.debugSubmissions !== null)) &&
    (s.debugLanguage === undefined ||
      s.debugLanguage === "C++" ||
      s.debugLanguage === "Python" ||
      s.debugLanguage === "Java") &&
    (s.hintReveals === undefined ||
      (typeof s.hintReveals === "object" && s.hintReveals !== null))
  );
}

function identityOrder(length: number): number[] {
  return Array.from({ length }, (_, i) => i);
}

function withDefaults(value: AssessmentSession): AssessmentSession {
  const rawEdits = value.codeEdits ?? {};
  const codeEdits: Record<string, string> = {};
  for (const [key, text] of Object.entries(rawEdits)) {
    codeEdits[key.includes(":") ? key : `${key}:C++`] = text;
  }
  return {
    ...value,
    round1Order: Array.isArray(value.round1Order) ? value.round1Order : identityOrder(60),
    round2Order: Array.isArray(value.round2Order) ? value.round2Order : identityOrder(13),
    round1FinishSeconds: value.round1FinishSeconds ?? null,
    round1Synced: value.round1Synced ?? false,
    round2ExpiresAt: value.round2ExpiresAt ?? null,
    round2FinishSeconds: value.round2FinishSeconds ?? null,
    round3ExpiresAt: value.round3ExpiresAt ?? null,
    round3FinishSeconds: value.round3FinishSeconds ?? null,
    currentDebug: value.currentDebug ?? 1,
    codeEdits,
    debugSubmissions: value.debugSubmissions ?? {},
    debugLanguage: value.debugLanguage ?? "C++",
    hintReveals: value.hintReveals ?? {},
  };
}

export type LoadResult<T> = { ok: true; data: T } | StorageFailure;

/** Single storage abstraction for the local assessment session. */
export const storage = {
  loadSession(): LoadResult<AssessmentSession> {
    const data = readRaw(SESSION_KEY);
    if (data === null) return { ok: false, reason: "missing" };
    if (data === undefined || !isSessionLike(data)) {
      storage.clearSession();
      return { ok: false, reason: "corrupt" };
    }
    return { ok: true, data: withDefaults(data) };
  },

  saveSession(session: AssessmentSession): void {
    writeRaw(SESSION_KEY, session);
  },

  saveAnswers(responses: Record<string, OptionId | null>): void {
    writeRaw(ANSWERS_KEY, responses);
  },

  saveFlags(reviewFlags: Record<string, boolean>): void {
    writeRaw(FLAGS_KEY, reviewFlags);
  },

  saveVisited(visited: Record<string, boolean>): void {
    writeRaw(VISITED_KEY, visited);
  },

  saveCodeEdits(codeEdits: Record<string, string>): void {
    writeRaw(CODE_EDITS_KEY, codeEdits);
  },

  saveSubmissionSnapshot(snapshot: SubmissionSnapshot): void {
    writeRaw(SUBMISSIONS_KEY, snapshot);
  },

  loadSubmissionSnapshot(): SubmissionSnapshot | null {
    const data = readRaw(SUBMISSIONS_KEY);
    if (data === null || data === undefined) return null;
    if (typeof data !== "object" || Array.isArray(data)) return null;
    return data as SubmissionSnapshot;
  },

  clearSession(): void {
    removeRaw(SESSION_KEY);
    removeRaw(ANSWERS_KEY);
    removeRaw(FLAGS_KEY);
    removeRaw(VISITED_KEY);
    removeRaw(CODE_EDITS_KEY);
    removeRaw(SUBMISSIONS_KEY);
  },
};