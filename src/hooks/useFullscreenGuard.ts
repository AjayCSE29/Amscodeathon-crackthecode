import { useCallback, useEffect, useRef, useState } from "react";
import { isFullscreen } from "../lib/fullscreen";

export const FULLSCREEN_GRACE_MS = 10_000;

interface FullscreenGuardState {
  warning: boolean;
  remainingMs: number;
}

export function useFullscreenGuard(
  enabled: boolean,
  graceMs: number,
  onBreach: () => void,
): FullscreenGuardState {
  const onBreachRef = useRef(onBreach);
  useEffect(() => {
    onBreachRef.current = onBreach;
  }, [onBreach]);

  const [remainingMs, setRemainingMs] = useState(graceMs);
  const [warning, setWarning] = useState(false);

  const breachAtRef = useRef<number | null>(null);
  const leftFullscreenRef = useRef(false);
  const firedRef = useRef(false);
  const warningRef = useRef(false);
  const remainingRef = useRef(graceMs);

  const disarm = useCallback(() => {
    breachAtRef.current = null;
    leftFullscreenRef.current = false;
    firedRef.current = false;
    warningRef.current = false;
    remainingRef.current = graceMs;
    setWarning(false);
    setRemainingMs(graceMs);
  }, [graceMs]);

  const arm = useCallback(
    (leftFullscreen: boolean) => {
      if (breachAtRef.current != null) return;
      leftFullscreenRef.current = leftFullscreen;
      breachAtRef.current = Date.now();
      warningRef.current = true;
      remainingRef.current = graceMs;
      setWarning(true);
      setRemainingMs(graceMs);
    },
    [graceMs],
  );

  const fire = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    breachAtRef.current = null;
    warningRef.current = false;
    setWarning(false);
    onBreachRef.current();
  }, []);

  const present = useCallback((): boolean => {
    if (typeof document === "undefined") return false;
    const fullscreenOk = leftFullscreenRef.current ? isFullscreen() : true;
    return fullscreenOk && !document.hidden && document.hasFocus();
  }, []);

  useEffect(() => {
    if (!enabled) {
      breachAtRef.current = null;
      leftFullscreenRef.current = false;
      firedRef.current = false;
      return;
    }

    const handleState = () => {
      if (breachAtRef.current == null) return;
      if (present()) disarm();
    };

    const onFullscreenChange = () => {
      if (isFullscreen()) handleState();
      else arm(true);
    };

    const onVisibility = () => {
      if (document.hidden) arm(false);
      else handleState();
    };

    const onBlur = () => arm(false);
    const onFocus = handleState;

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    const id = window.setInterval(() => {
      const at = breachAtRef.current;
      if (at == null) {
        if (warningRef.current || remainingRef.current !== graceMs) {
          warningRef.current = false;
          remainingRef.current = graceMs;
          setWarning(false);
          setRemainingMs(graceMs);
        }
        return;
      }
      const next = Math.max(0, graceMs - (Date.now() - at));
      remainingRef.current = next;
      setRemainingMs(next);
      if (next <= 0) fire();
    }, 250);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
      breachAtRef.current = null;
      leftFullscreenRef.current = false;
      firedRef.current = false;
    };
  }, [enabled, graceMs, arm, disarm, fire, present]);

  return { warning, remainingMs };
}