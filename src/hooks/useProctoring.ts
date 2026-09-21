import { useCallback, useEffect, useState } from "react";
import { storage } from "../lib/storage";
import type { CameraStatus, ProctorEvent, ProctorEventType } from "../types/assessment";

export interface ProctoringState {
  /** Local session status — NEVER implies server-side monitoring. */
  active: boolean;
  cameraStatus: CameraStatus;
  events: ProctorEvent[];
  requestCameraVerification: () => Promise<CameraStatus>;
  statusPing: ("ready" | "degraded") | null;
}

function probeCamera(): Promise<CameraStatus> {
  return new Promise((resolve) => {
    try {
      if (
        typeof navigator === "undefined" ||
        !("mediaDevices" in navigator) ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        resolve("unavailable");
        return;
      }
      const perms = navigator.permissions;
      if (perms && typeof perms.query === "function") {
        void perms
          .query({ name: "camera" as PermissionName })
          .then((status) => {
            if (status.state === "granted") resolve("ready");
            else if (status.state === "denied") resolve("denied");
            else resolve("unknown");
          })
          .catch(() => resolve("unknown"));
      } else {
        resolve("unknown");
      }
    } catch {
      resolve("unavailable");
    }
  });
}

/**
 * FRONTEND-ONLY proctoring simulation.
 *
 * Watches `visibilitychange`, window focus/blur and fullscreen exits and
 * stores a local event log. Events are NOT transmitted anywhere; the
 * abstraction is shaped so a backend can consume the same events later.
 */
export function useProctoring(enabled: boolean): ProctoringState {
  const [events, setEvents] = useState<ProctorEvent[]>(() =>
    storage.loadProctorEvents(),
  );
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("unknown");
  const [statusPing, setStatusPing] = useState<
    ProctoringState["statusPing"]
  >(null);

  const pushEvent = useCallback((type: ProctorEventType) => {
    const event: ProctorEvent = { type, timestamp: Date.now() };
    setEvents((prev) => {
      const next = [...prev, event];
      storage.saveProctorEvents(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const run = async () => {
      const camera = await probeCamera();
      if (cancelled) return;
      setCameraStatus(camera);
      setStatusPing(camera === "unknown" || camera === "ready" ? "ready" : "degraded");
    };
    void run();

    const onVisibility = () =>
      pushEvent(document.hidden ? "TAB_HIDDEN" : "TAB_VISIBLE");
    const onBlur = () => pushEvent("WINDOW_BLUR");
    const onFocus = () => pushEvent("WINDOW_FOCUS");
    const onFullscreen = () => {
      if (!document.fullscreenElement) pushEvent("FULLSCREEN_EXIT");
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFullscreen);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [enabled, pushEvent]);

  const requestCameraVerification = useCallback((): Promise<CameraStatus> => {
    return new Promise((resolve) => {
      try {
        if (
          !("mediaDevices" in navigator) ||
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
          setCameraStatus("unavailable");
          setStatusPing("degraded");
          resolve("unavailable");
          return;
        }
        void navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            stream.getTracks().forEach((t) => t.stop());
            setCameraStatus("ready");
            setStatusPing("ready");
            pushEvent("CAMERA_GRANTED");
            resolve("ready");
          })
          .catch((err: unknown) => {
            const name =
              typeof err === "object" && err !== null && "name" in err
                ? String((err as { name?: unknown }).name ?? "")
                : "";
            if (name === "NotAllowedError" || name === "PermissionDeniedError") {
              setCameraStatus("denied");
              pushEvent("CAMERA_DENIED");
              setStatusPing("degraded");
              resolve("denied");
            } else {
              setCameraStatus("unavailable");
              setStatusPing("degraded");
              resolve("unavailable");
            }
          });
      } catch {
        setCameraStatus("unavailable");
        setStatusPing("degraded");
        resolve("unavailable");
      }
    });
  }, [pushEvent]);

  return {
    active: enabled,
    cameraStatus,
    events,
    requestCameraVerification,
    statusPing,
  };
}