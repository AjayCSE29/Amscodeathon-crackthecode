import { richText } from "../../lib/richText";
import type { OptionId, Question, QuestionState } from "../../types/assessment";
import { AnswerOption } from "./AnswerOption";
import { CodeBlock } from "./CodeBlock";

interface QuestionCardProps {
  question: Question;
  state: QuestionState;
  onSelect: (optionId: OptionId) => void;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  state,
  onSelect,
  disabled = false,
}: QuestionCardProps) {
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
      <div className="flex items-start gap-space-sm">
        <span className="font-label-md text-label-md font-bold text-primary shrink-0 mt-0.5">
          Q{question.index}.
        </span>
        <p className="font-body-lg text-body-lg text-on-surface font-medium leading-relaxed max-w-[72ch]">
          {richText(question.question)}
        </p>
      </div>

      {question.code ? (
        <CodeBlock code={question.code} className="max-w-[72ch]" />
      ) : null}

      <div className="flex flex-col gap-space-sm pt-space-xs" role="radiogroup" aria-label={`Answers for question ${question.index}`}>
        {question.options.map((option, i) => (
          <AnswerOption
            key={option.id}
            option={option}
            name={`mcq-q${question.id}`}
            selected={state.selectedOption === option.id}
            onSelect={(optionId) => onSelect(optionId)}
            disabled={disabled}
            indexHint={i + 1}
          />
        ))}
      </div>
    </div>
  );
}