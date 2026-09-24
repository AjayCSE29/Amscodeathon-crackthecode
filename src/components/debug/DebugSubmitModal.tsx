import { useEffect } from "react";
import { Icon } from "../ui/Icon";

interface DebugSubmitModalProps {
  open: boolean;
  edited: number;
  total: number;
  onContinue: () => void;
  onConfirm: () => void;
}

export function DebugSubmitModal({
  open,
  edited,
  total,
  onContinue,
  onConfirm,
}: DebugSubmitModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onContinue();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onContinue]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-50 flex items-center justify-center p-gutter"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onContinue();
      }}
    >
      <div
        className="bg-surface-container-lowest max-w-md w-full rounded-xl shadow-xl p-space-lg flex flex-col gap-space-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="debug-submit-modal-title"
      >
        <div className="flex items-center gap-3 text-error">
          <Icon name="warning" className="text-[28px]" />
          <h3
            id="debug-submit-modal-title"
            className="font-headline-md text-headline-md font-bold text-on-surface"
          >
            Submit Debug Round?
          </h3>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          You are about to finish Round 2. Your code edits will be recorded and
          the assessment will be locked for submission.
        </p>
        <div className="bg-surface-container-low p-space-sm rounded-lg font-label-sm text-label-sm text-on-surface-variant flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Programs edited:</span>
            <span className="font-bold text-tertiary">
              {edited} / {total}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Unedited:</span>
            <span className="font-bold text-error">{total - edited}</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-space-sm mt-space-xs">
          <button
            type="button"
            onClick={onContinue}
            className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors cursor-pointer"
          >
            Keep Debugging
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-space-md py-2 rounded-lg bg-error hover:bg-on-error-container text-on-error font-label-md text-label-md font-bold transition-colors cursor-pointer"
          >
            Submit Round 2
          </button>
        </div>
      </div>
    </div>
  );
}