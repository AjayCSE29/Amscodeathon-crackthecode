import type { ReactNode } from "react";

/**
 * Renders a question/option string, treating backtick spans as inline code
 * chips styled like the finalized prototypes (`#f1f5f9` fill, mono type).
 */
export function richText(text: string): ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      const code = part.slice(1, -1);
      return (
        <code
          key={i}
          className="font-code-inline text-code-inline bg-surface-container px-1.5 py-0.5 rounded font-semibold text-on-surface"
        >
          {code}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}