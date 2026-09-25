import { useEffect, useState } from "react";
import { AppHeader } from "./components/layout/AppHeader";
import { AssessmentLayout } from "./components/layout/AssessmentLayout";
import { FullscreenWarning } from "./components/layout/FullscreenWarning";
import { MobileBlockScreen } from "./components/layout/MobileBlockScreen";
import { TimeOverScreen } from "./components/layout/TimeOverScreen";
import { Icon } from "./components/ui/Icon";
import { useAssessment } from "./hooks/useAssessment";
import { useIsMobile } from "./hooks/useIsMobile";
import {
  FULLSCREEN_GRACE_MS,
  useFullscreenGuard,
} from "./hooks/useFullscreenGuard";
import { requestFullscreen } from "./lib/fullscreen";
import { AssessmentPage } from "./pages/AssessmentPage";
import { DebugPage } from "./pages/DebugPage";
import { EntryPage } from "./pages/EntryPage";
import { SubmissionPage } from "./pages/SubmissionPage";

function RestoreError({ onReset }: { onReset: () => void }) {
  return (
    <AssessmentLayout
      header={<AppHeader mode="entry" candidateName="Team" />}
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
  const isMobile = useIsMobile();
  const [disconnected, setDisconnected] = useState(false);

  const handleBreach = () => {
    api.resetToEntry();
    setDisconnected(true);
  };

  const guard = useFullscreenGuard(
    session?.status === "active" || session?.status === "round2",
    FULLSCREEN_GRACE_MS,
    handleBreach,
  );

  useEffect(() => {
    if (session?.status === "active" && Date.now() >= session.expiresAt) {
      finalizeExpired();
    }
    if (
      session?.status === "round2" &&
      session.round2ExpiresAt != null &&
      Date.now() >= session.round2ExpiresAt
    ) {
      finalizeExpired();
    }
  }, [session?.status, session?.expiresAt, session?.round2ExpiresAt, finalizeExpired]);

  if (isMobile) return <MobileBlockScreen />;

  if (restoreProblem) return <RestoreError onReset={api.resetToEntry} />;

  if (disconnected) {
    return <TimeOverScreen onRestart={() => setDisconnected(false)} />;
  }

  if (session?.status === "round1-submitted") {
    return (
      <SubmissionPage
        session={session}
        totalQuestions={api.totalQuestions}
        stage="round1"
        onProceed={() => {
          requestFullscreen();
          api.proceedToRound2();
        }}
      />
    );
  }

  if (session?.status === "submitted") {
    return (
      <SubmissionPage
        session={session}
        totalQuestions={api.totalQuestions}
        stage="final"
      />
    );
  }

  if (session?.status === "active") {
    return (
      <>
        {guard.warning ? (
          <FullscreenWarning remainingMs={guard.remainingMs} />
        ) : null}
        <AssessmentPage api={api} />
      </>
    );
  }

  if (session?.status === "round2") {
    return (
      <>
        {guard.warning ? (
          <FullscreenWarning remainingMs={guard.remainingMs} />
        ) : null}
        <DebugPage api={api} />
      </>
    );
  }

  return <EntryPage onContinue={api.startAssessment} />;
}