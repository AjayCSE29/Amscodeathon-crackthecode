import { useEffect } from "react";
import { AppHeader } from "./components/layout/AppHeader";
import { AssessmentLayout } from "./components/layout/AssessmentLayout";
import { Icon } from "./components/ui/Icon";
import { useAssessment } from "./hooks/useAssessment";
import { AssessmentPage } from "./pages/AssessmentPage";
import { EntryPage } from "./pages/EntryPage";
import { SubmissionPage } from "./pages/SubmissionPage";

function RestoreError({ onReset }: { onReset: () => void }) {
  return (
    <AssessmentLayout
      header={<AppHeader mode="entry" candidateName="Candidate" />}
      className="bg-background flex-1 flex items-center justify-center py-10"
    >
      <div className="w-full max-w-md mx-auto px-margin-mobile md:px-margin">
        <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/30 p-6 sm:p-8 flex flex-col items-center text-center gap-space-md">
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
            <Icon name="report" className="text-on-error-container text-2xl" filled />
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            Assessment session could not be restored.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            The locally stored session is invalid or corrupted. You can restart
            from the entry screen to begin a fresh assessment.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="mt-2 flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary px-space-lg py-2.5 rounded-lg font-label-md text-label-md font-bold shadow-md transition-all cursor-pointer"
          >
            <Icon name="refresh" className="text-lg" />
            Restart from Entry
          </button>
        </div>
      </div>
    </AssessmentLayout>
  );
}

export default function App() {
  const api = useAssessment();
  const { session, restoreProblem, finalizeExpired } = api;

  useEffect(() => {
    if (session?.status === "active" && Date.now() >= session.expiresAt) {
      finalizeExpired();
    }
  }, [session?.status, session?.expiresAt, finalizeExpired]);

  if (restoreProblem) return <RestoreError onReset={api.resetToEntry} />;

  if (session?.status === "submitted") {
    return (
      <SubmissionPage session={session} totalQuestions={api.totalQuestions} />
    );
  }

  if (session?.status === "active") {
    return <AssessmentPage api={api} />;
  }

  return <EntryPage onContinue={api.startAssessment} />;
}