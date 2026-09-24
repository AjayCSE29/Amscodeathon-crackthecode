import { useRef, useState } from "react";
import { TOKEN_CLASS, tokenizeLine } from "../../lib/codeHighlight";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";
import { Icon } from "../ui/Icon";

interface CodeEditorProps {
  fileName: string;
  value: string;
  onChange?: (next: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function CodeEditor({
  fileName,
  value,
  onChange,
  readOnly = false,
  className,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);

  const editable = !readOnly && typeof onChange === "function";

  const lines = value.split("\n");

  const syncScroll = () => {
    if (preRef.current && taRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const ta = e.currentTarget;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (e.shiftKey) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const before = value.slice(lineStart, start);
      const remove = Math.min(2, before.length - before.replace(/^ +/, "").length);
      if (remove > 0) {
        onChange?.(
          value.slice(0, lineStart) + value.slice(lineStart + remove),
        );
        requestAnimationFrame(() => {
          ta.selectionStart = start - remove;
          ta.selectionEnd = end - remove;
        });
      }
      return;
    }
    const before = value.slice(0, start);
    const after = value.slice(end);
    onChange?.(before + "  " + after);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + 2;
    });
  };

  const renderLine = (line: string, i: number): ReactNode => (
    <div key={i} className="flex">
      <span className="w-8 mr-2 inline-block text-right text-terminal-muted select-none shrink-0">
        {i + 1}
      </span>
      <span className="whitespace-pre">
        {tokenizeLine(line).map((token, j) => (
          <span key={j} className={TOKEN_CLASS[token.type]}>
            {token.text}
          </span>
        ))}
      </span>
    </div>
  );

  return (
    <div
      className={cn("flex flex-col min-h-0 overflow-hidden rounded-xl bg-inverse-surface shadow-md", className)}
    >
      <div className="flex items-center justify-between bg-on-surface/90 px-space-md py-2 text-inverse-on-surface">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="code" className="text-[16px] text-primary-fixed" />
          <span className="font-label-sm text-label-sm text-inverse-on-surface font-semibold truncate">
            {fileName}
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

      <div className="relative flex-1 min-h-0">
        <pre
          ref={preRef}
          aria-hidden="true"
          className="absolute inset-0 m-0 overflow-auto scrollbar-hide pt-4 pr-4 pb-4 pl-14 font-code-body text-code-body leading-6 whitespace-pre select-none pointer-events-none"
        >
          {lines.map(renderLine)}
        </pre>
        <textarea
          ref={taRef}
          value={value}
          readOnly={!editable}
          onChange={(e) => onChange?.(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          wrap="off"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label={`${fileName} editor`}
          className="absolute inset-0 w-full h-full resize-none overflow-auto pt-4 pr-4 pb-4 pl-14 font-code-body text-code-body leading-6 whitespace-pre text-transparent caret-primary-fixed bg-transparent outline-none selection:bg-primary/40 scrollbar-hide"
        />
      </div>
    </div>
  );
}