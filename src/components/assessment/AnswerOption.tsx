import { richText } from "../../lib/richText";
import { cn } from "../../lib/utils";
import type { QuestionOption } from "../../types/assessment";
import { Icon } from "../ui/Icon";

interface AnswerOptionProps {
  option: QuestionOption;
  name: string;
  selected: boolean;
  onSelect: (optionId: QuestionOption["id"]) => void;
  disabled?: boolean;
  indexHint?: number;
}

export function AnswerOption({
  option,
  name,
  selected,
  onSelect,
  disabled = false,
  indexHint,
}: AnswerOptionProps) {
  return (
    <label
      className={cn(
        "group relative flex items-start gap-space-md p-space-md cursor-pointer transition-all",
        selected ? "bg-primary/10 shadow-md" : "bg-surface-container-low hover:bg-surface-container shadow-sm",
        selected && "ring-1 ring-primary/40",
        disabled && "opacity-60 cursor-not-allowed",
      )}
      data-testid={`answer-option-${option.id}`}
    >
      <input
        type="radio"
        name={name}
        value={option.id}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(option.id)}
        className="peer sr-only"
      />
      <span
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center font-label-md text-label-md font-bold shrink-0 shadow-sm transition-all",
          selected ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant",
        )}
        aria-hidden="true"
      >
        {option.id}
      </span>
      <span className="flex-1 flex flex-col ms-1 basis-0">
        <span className="font-body-md text-body-md text-on-surface leading-normal">
          {richText(option.text)}
        </span>
        {selected ? (
          <span className="font-label-sm text-label-sm text-primary font-bold mt-1 flex items-center gap-1">
            <Icon name="radio_button_checked" className="text-[14px]" />
            Selected
          </span>
        ) : null}
      </span>
      <span
        className="absolute -inset-[1px] rounded-xl ring-2 ring-primary ring-offset-2 opacity-0 peer-focus-visible:opacity-100 pointer-events-none transition-opacity"
        aria-hidden="true"
      />
      {indexHint ? (
        <span className="sr-only">Press {indexHint} to select option {option.id}</span>
      ) : null}
    </label>
  );
}