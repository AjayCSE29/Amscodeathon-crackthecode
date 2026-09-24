import { SubmissionConfirmation } from "../components/submission/SubmissionConfirmation";
import type { AssessmentSession } from "../types/assessment";

interface SubmissionPageProps {
  session: AssessmentSession;
  totalQuestions: number;
  stage: "round1" | "final";
  onProceed?: () => void;
}

export function SubmissionPage({
  session,
  totalQuestions,
  stage,
  onProceed,
}: SubmissionPageProps) {
  return (
    <SubmissionConfirmation
      session={session}
      totalQuestions={totalQuestions}
      stage={stage}
      onProceed={onProceed}
    />
  );
}