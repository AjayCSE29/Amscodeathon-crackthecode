import { richText } from "../../lib/richText";
import { cn } from "../../lib/utils";
import type { DebugProgramLanguage, DebugQuestion } from "../../types/assessment";
import { EyeOffIcon } from "../ui/EyeOffIcon";
import { Icon } from "../ui/Icon";

interface ProblemPanelProps {
  question: DebugQuestion;
  language: DebugProgramLanguage;
  hintRevealed: boolean;
  onRevealHint: () => void;
  className?: string;
  label?: string;
  hintPenalty?: string;
}

const difficultyClass: Record<DebugQuestion["difficulty"], string> = {
  Easy: "bg-tertiary text-on-tertiary",
  Medium: "bg-amber text-white",
  Hard: "bg-error text-on-error",
};

export function ProblemPanel({
  question,
  language,
  hintRevealed,
  onRevealHint,
  className,
  label = "Debug Problem",
  hintPenalty = "You will lose 2 points",
}: ProblemPanelProps) {
  const sampleCases = question.sampleCases[language];
  return (
    <div
      className={cn(
        "bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
            {label} {String(question.index).padStart(2, "0")}
          </span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface leading-tight">
            {question.title}
          </h2>
        </div>
        <div className="shrink-0">
          <span
            className={cn(
              "font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded",
              difficultyClass[question.difficulty],
            )}
          >
            {question.difficulty}
          </span>
        </div>
      </div>

      <p className="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-line">
        {richText(question.statement)}
      </p>

      <div className="flex flex-col divide-y divide-outline-variant/50">
        {sampleCases.map((sample, i) => (
          <div
            key={i}
            className="flex flex-col gap-1 py-space-sm first:pt-0 last:pb-0"
          >
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Sample {i + 1}
            </span>
            <div className="flex flex-col sm:flex-row gap-space-sm">
              {sample.input ? (
                <div className="flex-1 min-w-0">
                  <span className="font-code-inline text-code-inline uppercase tracking-wider text-terminal-muted">
                    Input
                  </span>
                  <pre className="mt-1 rounded-md bg-terminal p-2 font-code-body text-code-body text-inverse-on-surface leading-5 whitespace-pre-wrap break-words">
                    {sample.input}
                  </pre>
                </div>
              ) : null}
              <div className="flex-1 min-w-0">
                <span className="font-code-inline text-code-inline uppercase tracking-wider text-terminal-muted">
                  Output
                </span>
                <pre className="mt-1 rounded-md bg-terminal p-2 font-code-body text-code-body text-inverse-on-surface leading-5 whitespace-pre-wrap break-words">
                  {sample.output}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative rounded-lg bg-amber-soft border border-amber-border p-space-sm flex gap-2 items-start">
        <Icon
          name="lightbulb"
          className="text-amber-dark text-[18px] shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-body-md text-body-md text-amber-dark",
              !hintRevealed && "blur-lg select-none pointer-events-none",
            )}
          >
            <span className="font-bold">Debug hint:</span>{" "}
            {question.bugHints[language]}
          </p>
        </div>

        {!hintRevealed ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 p-space-sm">
            <button
              type="button"
              onClick={onRevealHint}
              aria-label="Reveal the debug hint for this problem"
              className="pointer-events-auto flex items-center gap-1.5 bg-amber-dark hover:bg-amber text-white px-space-md py-1.5 rounded-lg font-label-md text-label-md font-bold transition-colors cursor-pointer"
            >
              <EyeOffIcon className="text-[16px]" />
              <span>Show Hint</span>
            </button>
            <span className="bg-amber-soft px-2 py-0.5 rounded font-label-sm text-label-sm text-amber-dark/80">
              {hintPenalty}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}