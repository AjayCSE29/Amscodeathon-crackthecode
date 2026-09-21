import { MOCK_QUESTIONS } from "../../data/mockQuestions";
import { cn } from "../../lib/utils";
import type { AssessmentCounts } from "../../hooks/useAssessment";
import type { QuestionState } from "../../types/assessment";
import { Icon } from "../ui/Icon";

interface QuestionNavigatorProps {
  currentIndex: number;
  counts: AssessmentCounts;
  stateFor: (index: number) => QuestionState;
  onNavigate: (index: number) => void;
  onSubmit: () => void;
}

export function QuestionNavigator({
  currentIndex,
  counts,
  stateFor,
  onNavigate,
  onSubmit,
}: QuestionNavigatorProps) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="grid_view" className="text-primary text-[20px]" />
          <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface">
            Question Palette
          </h3>
        </div>
        <span className="font-label-sm text-label-sm bg-surface-container text-on-surface font-bold px-2 py-0.5 rounded">
          {MOCK_QUESTIONS.length} Total
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-on-surface-variant font-label-sm text-label-sm pb-space-sm">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-tertiary" aria-hidden="true" />
          <span>Answered ({counts.answered})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-amber" aria-hidden="true" />
          <span>Marked ({counts.marked})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-primary" aria-hidden="true" />
          <span>Current (1)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-surface-container-high" aria-hidden="true" />
          <span>Not Answered ({counts.remaining})</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {MOCK_QUESTIONS.map((q, i) => {
          const st = stateFor(i);
          const isCurrent = i === currentIndex;
          const answered = st.selectedOption != null;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onNavigate(i)}
              aria-label={
                `Question ${i + 1}` +
                (isCurrent ? " — current" : "") +
                (answered ? " — answered" : "") +
                (st.markedForReview ? " — marked for review" : "")
              }
              className={cn(
                "relative h-9 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center transition-all cursor-pointer",
                isCurrent
                  ? "ring-2 ring-primary"
                  : "border border-transparent",
                answered && st.markedForReview
                  ? "bg-tertiary text-on-tertiary"
                  : st.markedForReview
                    ? "bg-amber text-white"
                    : answered
                      ? "bg-tertiary text-on-tertiary"
                      : st.visited
                        ? "bg-surface-container text-on-surface"
                        : "bg-surface-container-low text-on-surface hover:bg-surface-container",
              )}
            >
              {i + 1}
              {answered && st.markedForReview ? (
                <span
                  className="absolute bottom-0 inset-x-0 h-[3px] rounded-b-lg bg-amber"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="pt-space-sm flex flex-col gap-space-sm border-t border-outline-variant/40">
        <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm px-1">
          <span className="">
            Total Answered:{" "}
            <strong className="text-on-surface font-bold">
              {counts.answered} / {MOCK_QUESTIONS.length}
            </strong>
          </span>
          <span className="">
            Remaining:{" "}
            <strong className="text-on-surface font-bold">{counts.remaining}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          className="w-full mt-2 bg-error hover:bg-error-container text-on-error hover:text-on-error-container py-3 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Icon name="lock_reset" className="text-[20px]" />
          <span>Submit Assessment</span>
        </button>
      </div>
    </div>
  );
}