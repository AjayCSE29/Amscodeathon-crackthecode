import { useState } from "react";
import { plainCode, TOKEN_CLASS } from "../../lib/codeHighlight";
import { cn } from "../../lib/utils";
import type { CodeSnippet } from "../../types/assessment";
import { Icon } from "../ui/Icon";

interface CodeBlockProps {
  code: CodeSnippet;
  className?: string;
}

export function CodeBlock({ code, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plainCode(code.lines.map((l) => l.text)));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  return (
    <div
      className={cn("rounded-xl overflow-hidden bg-inverse-surface shadow-md", className)}
      data-testid="code-block"
    >
      <div className="flex items-center justify-between bg-on-surface/90 px-space-md py-2 text-inverse-on-surface">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="code" className="text-[16px] text-primary-fixed" />
          <span className="font-label-sm text-label-sm text-inverse-on-surface font-semibold truncate">
            {code.fileName}
          </span>
          <span className="font-label-sm text-label-sm bg-surface-container-highest/20 text-inverse-primary px-1.5 py-0.5 rounded">
            {code.language}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 font-label-sm text-label-sm text-inverse-on-surface hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <Icon name={copied ? "check" : "content_copy"} className="text-[16px]" filled={copied} />
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-space-md font-code-body text-code-body text-inverse-on-surface overflow-x-auto leading-6 scrollbar-hide">
        <code>
          {code.lines.map((line) => (
            <span key={line.lineNumber} className="block whitespace-pre">
              <span className="text-outline select-none pr-4 inline-block w-8 text-right mr-2">
                {line.lineNumber}
              </span>
              {line.tokens.map((token, i) => (
                <span key={i} className={TOKEN_CLASS[token.type]}>
                  {token.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}