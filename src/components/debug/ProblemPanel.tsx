import { richText } from "../../lib/richText";
import { cn } from "../../lib/utils";
import type { DebugProgramLanguage, DebugQuestion } from "../../types/assessment";
import { Icon } from "../ui/Icon";

interface ProblemPanelProps {
  question: DebugQuestion;
  language: DebugProgramLanguage;
  className?: string;
}

const difficultyClass: Record<DebugQuestion["difficulty"], string> = {
  Easy: "bg-tertiary text-on-tertiary",
  Medium: "bg-amber text-white",
  Hard: "bg-error text-on-error",
};

export function ProblemPanel({ question, language, className }: ProblemPanelProps) {
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
            Debug Problem {String(question.index).padStart(2, "0")}
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

      <p className="font-body-md text-body-md text-on-surface leading-relaxed">
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

      <div className="rounded-lg bg-amber-soft border border-amber-border p-space-sm flex gap-2 items-start">
        <Icon
          name="lightbulb"
          className="text-amber-dark text-[18px] shrink-0"
        />
        <p className="font-body-md text-body-md text-amber-dark">
          <span className="font-bold">Debug hint:</span>{" "}
          {question.bugHints[language]}
        </p>
      </div>
    </div>
  );
}