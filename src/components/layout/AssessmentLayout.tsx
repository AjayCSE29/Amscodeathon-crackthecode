import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface AssessmentLayoutProps {
  header: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Page shell: fixed header + scrollable main canvas. */
export function AssessmentLayout({ header, children, className }: AssessmentLayoutProps) {
  return (
    <div id="top" className="min-h-screen flex flex-col">
      {header}
      <main className={cn("w-full pt-16", className)}>{children}</main>
    </div>
  );
}