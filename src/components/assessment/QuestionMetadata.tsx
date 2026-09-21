import type { Difficulty } from "../../types/assessment";
import { cn } from "../../lib/utils";
import { Icon } from "../ui/Icon";

interface QuestionMetadataProps {
  index: number;
  total: number;
  category: string;
  difficulty: Difficulty;
  marks: number;
  negativeMarks: number;
  answered: boolean;
}

export function QuestionMetadata({
  index,
  total,
  category,
  difficulty,
  marks,
  negativeMarks,
  answered,
}: QuestionMetadataProps) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="font-label-md text-label-md font-bold text-primary bg-primary-fixed px-space-sm py-1 rounded">
          QUESTION {index} OF {total}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-secondary bg-secondary-fixed px-2 py-1 rounded">
          <Icon name="category" className="text-sm" />
          {category}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "font-label-sm text-label-sm font-semibold px-2 py-1 rounded",
            difficulty === "Hard"
              ? "bg-error-container text-on-error-container"
              : difficulty === "Medium"
                ? "bg-amber-soft text-amber-dark border border-amber-border"
                : "bg-tertiary-fixed/50 text-on-tertiary-fixed-variant",
          )}
        >
          {difficulty.toUpperCase()}
        </span>
        <span className="font-label-sm text-label-sm font-bold text-tertiary bg-tertiary-fixed px-2 py-1 rounded">
          +{marks} PTS
        </span>
        <span className="font-label-sm text-label-sm font-bold text-on-error-container bg-error-container px-2 py-1 rounded">
          -{negativeMarks} NEGATIVE
        </span>
        {answered ? (
          <span className="inline-flex items-center gap-1 font-label-sm text-label-sm font-bold text-tertiary">
            <Icon name="check_circle" className="text-sm" filled />
            Answer saved
          </span>
        ) : null}
      </div>
    </div>
  );
}