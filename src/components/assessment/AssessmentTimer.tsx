import { formatHMS } from "../../lib/utils";
import type { TimerState } from "../../types/assessment";
import { cn } from "../../lib/utils";

interface AssessmentTimerProps {
  state: TimerState;
  className?: string;
}

export function AssessmentTimer({ state, className }: AssessmentTimerProps) {
  const critical = state.tier === "critical";
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-1.5 border",
        critical
          ? "bg-error-container border-error-container"
          : "bg-amber-soft border-amber-border",
        className,
      )}
      role="timer"
      aria-label="Time remaining"
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          critical ? "bg-error animate-pulse" : "bg-amber",
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "font-label-md text-label-md font-bold tabular-nums tracking-tight",
          critical ? "text-on-error-container" : "text-amber-dark",
        )}
      >
        {formatHMS(state.remainingMs)}
      </span>
    </div>
  );
}