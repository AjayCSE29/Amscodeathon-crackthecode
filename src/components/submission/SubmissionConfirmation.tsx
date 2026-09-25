import { Icon } from "../ui/Icon";
import { formatTimestamp } from "../../lib/utils";
import type { AssessmentSession } from "../../types/assessment";

interface SubmissionConfirmationProps {
  session: AssessmentSession;
  totalQuestions: number;
  stage: "round1" | "final";
  onProceed?: () => void;
}

export function SubmissionConfirmation({
  session,
  totalQuestions,
  stage,
  onProceed,
}: SubmissionConfirmationProps) {
  const answered = Object.values(session.responses).filter((v) => v != null).length;
  const submittedAt = session.submittedAt ?? session.expiresAt;

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex items-center justify-center p-gutter">
      <main className="w-full max-w-md">
        <div className="flex flex-col w-full items-center justify-center py-space-xl">
          <div className="w-full max-w-md flex flex-col items-center">
            <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl p-space-lg flex flex-col items-center relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tertiary-container via-primary-container to-primary"
                aria-hidden="true"
              />
              <div className="relative mb-space-lg flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-md">
                  <div className="w-12 h-12 rounded-full bg-tertiary flex items-center justify-center">
                    <Icon
                      name="done"
                      filled
                      className="text-on-tertiary text-2xl"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center shadow-sm">
                  {stage === "final" ? (
                    <Icon name="lock" className="text-primary text-sm font-bold" />
                  ) : (
                    <Icon name="arrow_forward" className="text-primary text-sm font-bold" />
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-space-xs mb-space-lg">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">
                  {stage === "round1"
                    ? "Round 1 Submitted Successfully"
                    : "Assessment Submitted Successfully"}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
                  {stage === "round1"
                    ? "Your Round 1 responses have been recorded. Proceed to Round 2."
                    : "Your responses have been recorded."}
                </p>
              </div>

              <div className="w-full bg-surface-container-low rounded-lg p-space-md space-y-space-sm mb-space-lg">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Team Name
                  </span>
                  <div className="text-right">
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      {session.candidate.teamName}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-surface-container-high w-full" />
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Responses Recorded
                  </span>
                  <span className="font-label-md text-label-md font-semibold text-tertiary bg-tertiary-fixed px-space-xs py-0.5 rounded">
                    {answered} / {totalQuestions} Questions
                  </span>
                </div>
                <div className="h-px bg-surface-container-high w-full" />
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Timestamp
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface text-right">
                    {formatTimestamp(submittedAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded-lg mb-space-xl w-full">
                <Icon name="info" className="text-primary text-lg shrink-0 mt-0.5" />
                <p className="font-label-sm text-label-sm text-on-surface-variant text-left leading-normal">
                  Official evaluation and institutional results will be declared
                  directly by the competition committee via registered email.
                </p>
              </div>

              <div className="w-full flex flex-col space-y-space-sm">
                {onProceed ? (
                  <button
                    type="button"
                    onClick={onProceed}
                    className="w-full h-10 bg-tertiary hover:bg-primary text-on-tertiary font-label-md text-label-md rounded-lg shadow-sm flex items-center justify-center gap-space-xs transition-colors cursor-pointer"
                  >
                    <span>Start Round 2</span>
                    <Icon name="arrow_forward" className="text-base" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}