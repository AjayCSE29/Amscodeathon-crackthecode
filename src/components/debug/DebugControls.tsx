import { cn } from "../../lib/utils";
import type { DebugQuestion } from "../../types/assessment";
import { Icon } from "../ui/Icon";

interface DebugControlsProps {
  questions: DebugQuestion[];
  currentIndex: number;
  editedIds: string[];
  confirmedIds: string[];
  onNavigate: (index: number) => void;
  onRun: () => void;
  onReset: () => void;
  onConfirm: () => void;
  canConfirm: boolean;
  confirmed: boolean;
  running?: boolean;
  onSubmit: () => void;
  disabled?: boolean;
  itemLabel?: string;
}

export function DebugControls({
  questions,
  currentIndex,
  editedIds,
  confirmedIds,
  onNavigate,
  onRun,
  onReset,
  onConfirm,
  canConfirm,
  confirmed,
  running = false,
  onSubmit,
  disabled = false,
  itemLabel = "Bug",
}: DebugControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {questions.map((q, i) => {
          const isCurrent = i === currentIndex;
          const edited = editedIds.includes(q.id);
          const isConfirmed = confirmedIds.includes(q.id);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onNavigate(i)}
              disabled={disabled}
              aria-label={`Debug problem ${i + 1}${edited ? " — edited" : ""}${isConfirmed ? " — confirmed" : ""}`}
              className={cn(
                "relative shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-md text-label-md font-bold transition-colors cursor-pointer",
                isCurrent
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high",
              )}
            >
              <span>{itemLabel} {i + 1}</span>
              {isConfirmed ? (
                <Icon name="verified" className="text-[14px]" />
              ) : edited && !isCurrent ? (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-tertiary"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRun}
          disabled={disabled}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-space-md py-2 rounded-lg font-label-md text-label-md font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Icon name="play_arrow" className="text-[18px]" />
          <span>Run</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-2 rounded-lg font-label-md text-label-md font-semibold transition-colors cursor-pointer"
        >
          <Icon name="restart_alt" className="text-[18px]" />
          <span>Reset Code</span>
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled || !canConfirm || running}
          title={
            running
              ? "Waiting for the run to finish"
              : !disabled && !canConfirm
                ? "Run the program first"
                : undefined
          }
          className={cn(
            "flex items-center gap-1.5 px-space-md py-2 rounded-lg font-label-md text-label-md font-bold shadow-sm transition-colors",
            disabled || !canConfirm || running
              ? "bg-surface-container text-on-surface-variant opacity-60 cursor-not-allowed"
              : confirmed
                ? "bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim"
                : "bg-tertiary-container text-on-tertiary-container hover:bg-tertiary",
          )}
        >
          <Icon name={confirmed ? "verified" : "done"} className="text-[18px]" />
          <span>{confirmed ? "Confirmed" : "Confirm output and proceed"}</span>
        </button>
        <span className="flex-1" aria-hidden="true" />
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className="flex items-center gap-1.5 bg-error hover:bg-on-error-container text-on-error px-space-md py-2 rounded-lg font-label-md text-label-md font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Icon name="lock_reset" className="text-[18px]" />
          <span>Finish &amp; Submit</span>
        </button>
      </div>
    </div>
  );
}