import { cn } from "../../lib/utils";
import type { CameraStatus } from "../../types/assessment";
import { Icon } from "../ui/Icon";

interface SystemCheckProps {
  cameraStatus: CameraStatus;
  onVerifyCamera?: () => void;
  verifying?: boolean;
}

/**
 * Local browser-capability readiness indicator. This reflects what the
 * browser itself can provide — it does NOT claim server-side monitoring.
 */
export function SystemCheck({ cameraStatus, onVerifyCamera, verifying }: SystemCheckProps) {
  const degraded = cameraStatus === "unavailable" || cameraStatus === "denied";

  return (
    <div className="pl-7 flex flex-col gap-1.5">
      <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
        <Icon
          name={degraded ? "error" : "check_circle"}
          className={cn("text-sm", degraded ? "text-amber-dark" : "text-tertiary")}
          filled={!degraded}
        />
        <span>
          {degraded
            ? cameraStatus === "denied"
              ? "Camera permission denied — tab focus monitoring is active locally."
              : "Camera feed unavailable — tab focus monitoring is active locally."
            : "Camera feed & tab focus monitoring ready"}
        </span>
      </div>

      {onVerifyCamera ? (
        <button
          type="button"
          onClick={onVerifyCamera}
          disabled={verifying || cameraStatus === "ready"}
          className={cn(
            "ml-5 inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold transition-colors cursor-pointer",
            cameraStatus === "ready"
              ? "text-tertiary"
              : "text-primary hover:text-on-primary-fixed-variant",
          )}
        >
          <Icon name={cameraStatus === "ready" ? "verified" : "videocam"} className="text-sm" />
          <span>
            {verifying
              ? "Checking camera…"
              : cameraStatus === "ready"
                ? "Camera verified"
                : "Verify camera access (optional)"}
          </span>
        </button>
      ) : null}
    </div>
  );
}