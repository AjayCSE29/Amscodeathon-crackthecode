import { cn } from "../../lib/utils";
import type { DebugQuestion } from "../../types/assessment";
import { Icon } from "../ui/Icon";

interface DebugControlsProps {
  questions: DebugQuestion[];
  currentIndex: number;
  editedIds: string[];
  onNavigate: (index: number) => void;
  onRun: () => void;
  onReset: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function DebugControls({
  questions,
  currentIndex,
  editedIds,
  onNavigate,
  onRun,
  onReset,
  onSubmit,
  disabled = false,
}: DebugControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {questions.map((q, i) => {
          const isCurrent = i === currentIndex;
          const edited = editedIds.includes(q.id);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onNavigate(i)}
              disabled={disabled}
              aria-label={`Debug problem ${i + 1}${edited ? " — edited" : ""}`}
              className={cn(
                "relative shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-md text-label-md font-bold transition-colors cursor-pointer",
                isCurrent
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high",
              )}
            >
              <span>Bug {i + 1}</span>
              {edited && !isCurrent ? (
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