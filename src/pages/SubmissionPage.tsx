import { SubmissionConfirmation } from "../components/submission/SubmissionConfirmation";
import type { AssessmentSession } from "../types/assessment";

interface SubmissionPageProps {
  session: AssessmentSession;
  totalQuestions: number;
}

export function SubmissionPage({ session, totalQuestions }: SubmissionPageProps) {
  return (
    <SubmissionConfirmation session={session} totalQuestions={totalQuestions} />
  );
}