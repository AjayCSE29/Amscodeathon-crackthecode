import type { AssessmentSession, OptionId, ProctorEvent } from "../types/assessment";

const SESSION_KEY = "codeathon_session";
const ANSWERS_KEY = "codeathon_answers";
const FLAGS_KEY = "codeathon_flags";
const VISITED_KEY = "codeathon_visited";
const PROCTOR_KEY = "codeathon_proctor_events";

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
  return (
    typeof s.sessionId === "string" &&
    typeof s.startedAt === "number" &&
    typeof s.expiresAt === "number" &&
    typeof s.currentQuestion === "number" &&
    (s.status === "entry" || s.status === "active" || s.status === "submitted") &&
    typeof s.candidate === "object" &&
    s.candidate !== null &&
    typeof s.responses === "object" &&
    s.responses !== null &&
    typeof s.reviewFlags === "object" &&
    s.reviewFlags !== null &&
    typeof s.visited === "object" &&
    s.visited !== null
  );
}

export type LoadResult<T> = { ok: true; data: T } | StorageFailure;

export function isValidOptionId(value: unknown): value is OptionId {
  return value === "A" || value === "B" || value === "C" || value === "D";
}

/** Single storage abstraction for the local assessment session. */
export const storage = {
  loadSession(): LoadResult<AssessmentSession> {
    const data = readRaw(SESSION_KEY);
    if (data === null) return { ok: false, reason: "missing" };
    if (data === undefined || !isSessionLike(data)) {
      return { ok: false, reason: "corrupt" };
    }
    return { ok: true, data };
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

  clearSession(): void {
    removeRaw(SESSION_KEY);
    removeRaw(ANSWERS_KEY);
    removeRaw(FLAGS_KEY);
    removeRaw(VISITED_KEY);
    removeRaw(PROCTOR_KEY);
  },

  loadProctorEvents(): ProctorEvent[] {
    const data = readRaw(PROCTOR_KEY);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (e): e is ProctorEvent =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as ProctorEvent).type === "string" &&
        typeof (e as ProctorEvent).timestamp === "number",
    );
  },

  saveProctorEvents(events: ProctorEvent[]): void {
    writeRaw(PROCTOR_KEY, events.slice(-200));
  },

  clearProctorEvents(): void {
    removeRaw(PROCTOR_KEY);
  },
};