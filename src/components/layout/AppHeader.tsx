import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { TimerTier } from "../../types/assessment";
import { Icon } from "../ui/Icon";

export const CODEATHON_LOGO_SRC = "/codeathon-logo.png";

interface AppHeaderProps {
  mode: "entry" | "active";
  candidateName?: string;
  timeLabel?: string;
  timerTier?: TimerTier;
  statusLabel?: string;
  actions?: ReactNode;
}

export function AppHeader({
  mode,
  candidateName,
  timeLabel,
  timerTier = "normal",
  statusLabel,
  actions,
}: AppHeaderProps) {
  const active = mode === "active";
  return (
    <header className="fixed top-0 w-full z-40 bg-surface-container-lowest border-b border-outline-variant/50 shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
      <div className="h-16 w-full px-gutter flex items-center justify-between gap-4">
        <div className="flex items-center gap-space-md shrink-0">
          <a href="#top" aria-label="Codeathon" className="flex items-center gap-2">
            <img
              alt="Codeathon Logo"
              className="h-8 w-auto object-contain"
              src={CODEATHON_LOGO_SRC}
            />
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="font-label-md text-label-md font-bold uppercase tracking-widest text-on-surface">
                Codeathon
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Competitive MCQ Challenge
              </span>
            </span>
          </a>
        </div>

        <div className="flex items-center gap-space-md shrink-0">
          {actions ? (
            <div className="hidden md:flex items-center">{actions}</div>
          ) : null}

          <div className="hidden md:flex flex-col items-end text-right">
            <span className="font-body-md text-body-md font-semibold text-on-surface leading-tight">
              {candidateName || "Candidate"}
            </span>
          </div>

          {active && statusLabel ? (
            <div className="hidden sm:flex items-center gap-1.5 bg-tertiary-fixed/40 border border-tertiary-fixed text-on-tertiary-fixed-variant px-space-sm py-1 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary" aria-hidden="true" />
              <span className="font-label-sm text-label-sm font-semibold">
                {statusLabel}
              </span>
            </div>
          ) : null}

          {active && timeLabel ? (
            <div
              className={cn(
                "flex items-center gap-1.5 border px-space-md py-1.5 rounded",
                timerTier === "critical"
                  ? "bg-error-container border-error-container text-on-error-container"
                  : timerTier === "low"
                    ? "bg-amber-soft border-amber-border text-amber-dark"
                    : "bg-surface-container-high/60 border-outline-variant/60",
              )}
              role="timer"
              aria-live="off"
            >
              {timerTier === "critical" ? (
                <span className="h-1.5 w-1.5 rounded-full bg-error animate-pulse" aria-hidden="true" />
              ) : (
                <Icon name="timer" className="text-[18px] text-primary" />
              )}
              <span
                className={cn(
                  "font-label-md text-label-md font-bold tracking-tight tabular-nums",
                  timerTier === "critical"
                    ? "text-on-error-container"
                    : timerTier === "low"
                      ? "text-amber-dark"
                      : "text-on-surface",
                )}
              >
                {timeLabel}
              </span>
            </div>
          ) : null}

          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </div>
    </header>
  );
}