import { cn } from "../../lib/utils";
import { Icon } from "../ui/Icon";

export interface TerminalEntry {
  kind: "command" | "input" | "output" | "system" | "error";
  text: string;
}

interface OutputTerminalProps {
  entries: TerminalEntry[];
  emptyText?: string;
  className?: string;
  onBack?: () => void;
  running?: boolean;
  runningCommand?: string;
}

export function OutputTerminal({
  entries,
  emptyText = "Press Run to execute your program.",
  className,
  onBack,
  running = false,
  runningCommand = "",
}: OutputTerminalProps) {
  return (
    <div
      className={cn(
        "flex flex-col min-h-0 overflow-hidden rounded-xl bg-terminal shadow-md",
        className,
      )}
    >
      <div className="flex items-center gap-2 bg-on-surface/90 px-space-md py-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 font-label-sm text-label-sm text-inverse-on-surface hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back</span>
          </button>
        ) : null}
        <span className="w-3 h-3 rounded-full bg-error" aria-hidden="true" />
        <span className="w-3 h-3 rounded-full bg-amber-dark" aria-hidden="true" />
        <span className="w-3 h-3 rounded-full bg-tertiary" aria-hidden="true" />
        <span className="ml-2 font-label-sm text-label-sm text-inverse-on-surface font-semibold -tracking-tight">
          Terminal
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-space-md py-space-sm font-code-body text-code-body leading-6 scrollbar-hide">
        {running ? (
          <div className="flex flex-col gap-1">
            <div className="whitespace-pre-wrap break-words text-inverse-primary">
              <span className="text-tertiary-fixed select-none">$ </span>
              {runningCommand}
            </div>
            <div className="text-terminal-muted flex items-center gap-1">
              <span>Running</span>
              <span
                className="inline-block h-3.5 w-2 bg-terminal-muted animate-pulse"
                aria-hidden="true"
              />
            </div>
          </div>
        ) : entries.length === 0 ? (
          <p className="text-terminal-muted">{emptyText}</p>
        ) : (
          <div className="flex flex-col gap-1">
            {entries.map((entry, i) => (
              <div
                key={i}
                className={cn(
                  "whitespace-pre-wrap break-words",
                  entry.kind === "command" && "text-inverse-primary",
                  entry.kind === "input" && "text-terminal-muted",
                  entry.kind === "output" && "text-inverse-on-surface",
                  entry.kind === "system" && "text-terminal-muted",
                  entry.kind === "error" && "text-red-300",
                )}
              >
                {entry.kind === "command" ? (
                  <>
                    <span className="text-tertiary-fixed select-none">$ </span>
                    {entry.text}
                  </>
                ) : entry.kind === "input" ? (
                  <>
                    <span className="text-tertiary-fixed select-none">› </span>
                    {entry.text}
                  </>
                ) : (
                  entry.text
                )}
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-terminal-muted text-code-inline leading-4">
          Executed through the local execution sandbox — no verdict is shown.
        </p>
      </div>
    </div>
  );
}