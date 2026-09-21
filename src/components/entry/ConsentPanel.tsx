import type { CameraStatus } from "../../types/assessment";
import { SystemCheck } from "./SystemCheck";

interface ConsentPanelProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  cameraStatus: CameraStatus;
  onVerifyCamera?: () => void;
  verifying?: boolean;
  error?: string | null;
}

export function ConsentPanel({
  checked,
  onToggle,
  cameraStatus,
  onVerifyCamera,
  verifying,
  error,
}: ConsentPanelProps) {
  return (
    <div className="p-4 rounded-lg bg-surface-container-low space-y-3 border border-outline-variant/30">
      <div className="flex items-start gap-3">
        <input
          id="proctorConsent"
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1 h-4 w-4 rounded accent-primary cursor-pointer text-primary shrink-0"
        />
        <label
          htmlFor="proctorConsent"
          className="font-body-md text-body-md text-on-surface leading-snug cursor-pointer select-none"
        >
          I confirm that I will not switch tabs, minimize the examination
          browser, or utilize unauthorized secondary devices during this
          45-minute evaluation window.
        </label>
      </div>

      <SystemCheck
        cameraStatus={cameraStatus}
        onVerifyCamera={onVerifyCamera}
        verifying={verifying}
      />

      {error ? (
        <p className="pl-7 font-label-sm text-label-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}