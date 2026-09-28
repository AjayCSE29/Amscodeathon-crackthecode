import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md">
      <span
        className="inline-block h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"
        aria-hidden="true"
      />
      {label ? <span>{label}</span> : null}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-error-container text-on-error-container rounded-lg border border-error/30 px-4 py-3 flex items-center justify-between gap-4">
      <p className="font-body-md text-body-md">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="font-label-md text-label-md text-on-error-container font-semibold hover:underline"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "good" | "bad" | "neutral" | "warn";
  children: ReactNode;
}) {
  const classes =
    tone === "good"
      ? "bg-tertiary-fixed-dim/30 text-on-tertiary-fixed"
      : tone === "bad"
        ? "bg-error-container text-on-error-container"
        : tone === "warn"
          ? "bg-amber-soft text-amber-dark border border-amber-border"
          : "bg-surface-container-high text-on-surface-variant";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 font-label-sm text-label-sm font-semibold",
        classes,
      )}
    >
      {children}
    </span>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/60 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/40 w-full max-h-[85vh] flex flex-col",
          wide ? "max-w-4xl" : "max-w-lg",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/40 shrink-0">
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface rounded p-1"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider mb-1">
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40";

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-primary text-on-primary px-3 py-2 font-label-md text-label-md font-semibold hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled = false,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-label-md text-label-md text-on-surface font-semibold hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      {children}
    </button>
  );
}