import { cn } from "../../lib/utils";
import type { DebugProgramLanguage } from "../../types/assessment";

interface LanguageToggleProps {
  value: DebugProgramLanguage;
  onChange: (language: DebugProgramLanguage) => void;
  className?: string;
}

export function LanguageToggle({
  value,
  onChange,
  className,
}: LanguageToggleProps) {
  const languages: DebugProgramLanguage[] = ["C++", "Python", "Java"];
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 bg-surface-container border border-outline-variant/60 rounded-lg p-0.5",
        className,
      )}
      role="group"
      aria-label="Editor language"
    >
      {languages.map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => onChange(language)}
          aria-pressed={value === language}
          className={cn(
            "px-2.5 py-1 rounded-md font-label-sm text-label-sm font-bold transition-colors cursor-pointer",
            value === language
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          {language}
        </button>
      ))}
    </div>
  );
}