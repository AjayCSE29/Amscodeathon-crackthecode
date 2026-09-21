import { cn } from "../../lib/utils";
import { Icon } from "../ui/Icon";

interface AssessmentControlsProps {
  hasPrevious: boolean;
  hasNext: boolean;
  markedForReview: boolean;
  hasSelection: boolean;
  disabled?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggleReview: () => void;
  onClear: () => void;
}

export function AssessmentControls({
  hasPrevious,
  hasNext,
  markedForReview,
  hasSelection,
  disabled = false,
  onPrevious,
  onNext,
  onToggleReview,
  onClear,
}: AssessmentControlsProps) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-sm flex-wrap">
        <button
          type="button"
          onClick={onPrevious}
          disabled={disabled || !hasPrevious}
          className="flex items-center gap-1.5 px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Previous Question</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={disabled || !hasSelection}
          className="px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear Selection
        </button>

        <button
          type="button"
          onClick={onToggleReview}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 px-space-md py-2.5 rounded-lg font-label-md text-label-md font-semibold transition-all cursor-pointer",
            markedForReview
              ? "bg-amber text-white shadow-sm"
              : "bg-amber-soft border border-amber-border text-amber-dark hover:bg-amber-hover",
          )}
        >
          <Icon
            name={markedForReview ? "bookmark_added" : "bookmark"}
            className="text-[18px]"
            filled={markedForReview}
          />
          <span>{markedForReview ? "Marked for Review" : "Mark for Review"}</span>
        </button>
      </div>

      <div className="flex items-center gap-space-sm">
        <button
          type="button"
          onClick={onNext}
          disabled={disabled || !hasNext}
          className="flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary px-space-lg py-2.5 rounded-lg font-label-md text-label-md font-bold shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Save &amp; Next</span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}