import { useEffect, useRef, useState } from "react";
import type { TimerState } from "../types/assessment";

const LOW_MS = 10 * 60 * 1000;
const CRITICAL_MS = 5 * 60 * 1000;

export const TIMER_TIER = {
  LOW: LOW_MS,
  CRITICAL: CRITICAL_MS,
} as const;

/**
 * Frontend-only countdown derived from a persisted expiration timestamp.
 * The authoritative time source is `Date.now()` against `expiresAt`, so a
 * refresh cannot reset the clock. A later backend can replace `expiresAt`
 * with a server-authoritative deadline.
 */
export function useAssessmentTimer(
  expiresAt: number | null,
  onExpire?: () => void,
): TimerState {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  const remainingMs = expiresAt == null ? 0 : Math.max(0, expiresAt - now);
  const expired = expiresAt != null && now >= expiresAt;

  const tier = (() => {
    if (expiresAt == null) return "normal" as const;
    if (remainingMs <= CRITICAL_MS) return "critical" as const;
    if (remainingMs <= LOW_MS) return "low" as const;
    return "normal" as const;
  })();

  const expireRef = useRef(onExpire);
  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (expired) expireRef.current?.();
  }, [expired]);

  return { remainingMs, tier, expired };
}