import { cn } from "../../lib/utils";

interface EyeOffIconProps {
  className?: string;
}

export function EyeOffIcon({ className }: EyeOffIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-[1em] shrink-0", className)}
    >
      <path d="M2.5 12c2.2-4 5.6-6 9.5-6s7.3 2 9.5 6c-2.2 4-5.6 6-9.5 6s-7.3-2-9.5-6Z" />
      <circle cx="12" cy="12" r="2.75" />
      <path d="M4.5 19.5 19.5 4.5" />
    </svg>
  );
}
