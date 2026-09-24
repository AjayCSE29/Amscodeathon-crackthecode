import { useCallback, useEffect, useState } from "react";
import { Icon } from "../components/ui/Icon";
import { AssessmentControls } from "../components/assessment/AssessmentControls";
import { QuestionCard } from "../components/assessment/QuestionCard";
import { QuestionMetadata } from "../components/assessment/QuestionMetadata";
import { QuestionNavigator } from "../components/assessment/QuestionNavigator";
import { SubmitModal } from "../components/assessment/SubmitModal";
import { AssessmentLayout } from "../components/layout/AssessmentLayout";
import { AppHeader } from "../components/layout/AppHeader";
import { MOCK_QUESTIONS, ASSESSMENT_DURATION_MS } from "../data/mockQuestions";
import { useAssessmentTimer } from "../hooks/useAssessmentTimer";
import { formatHMS } from "../lib/utils";
import type { UseAssessmentApi } from "../hooks/useAssessment";

interface AssessmentPageProps {
  api: UseAssessmentApi;
}

export function AssessmentPage({ api }: AssessmentPageProps) {
  const {
    session,
    currentQuestion,
    totalQuestions,
    counts,
    stateFor,
    navigate,
    next,
    previous,
    selectOption,
    clearResponse,
    toggleReview,
    ensureVisited,
    submitAssessment,
    finalizeExpired,
  } = api;

  const [submitOpen, setSubmitOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleExpire = useCallback(() => {
    finalizeExpired();
  }, [finalizeExpired]);

  const timer = useAssessmentTimer(
    session?.status === "active" ? session.expiresAt : null,
    handleExpire,
  );

  useEffect(() => {
    if (currentQuestion && session?.status === "active") {
      ensureVisited(currentQuestion.id);
    }
  }, [currentQuestion, session?.status, ensureVisited]);

  const selectActive = useCallback(
    (optionId: "A" | "B" | "C" | "D") => {
      if (currentQuestion) selectOption(currentQuestion.id, optionId);
    },
    [currentQuestion, selectOption],
  );

  const toggleActiveReview = useCallback(() => {
    if (currentQuestion) toggleReview(currentQuestion.id);
  }, [currentQuestion, toggleReview]);

  useEffect(() => {
    if (session?.status !== "active" || !currentQuestion) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (submitOpen) {
        if (e.key === "Escape") setSubmitOpen(false);
        return;
      }
      switch (e.key) {
        case "1":
          selectActive("A");
          break;
        case "2":
          selectActive("B");
          break;
        case "3":
          selectActive("C");
          break;
        case "4":
          selectActive("D");
          break;
        case "ArrowLeft":
          e.preventDefault();
          previous();
          break;
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
        case "m":
        case "M":
          toggleActiveReview();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    session?.status,
    currentQuestion,
    submitOpen,
    selectActive,
    next,
    previous,
    toggleActiveReview,
  ]);

  const onNavigateFromPalette = (index: number) => {
    navigate(index);
    setPaletteOpen(false);
  };

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Assessment content unavailable.
        </p>
      </div>
    );
  }

  const qstate = stateFor(currentQuestion);
  const answeredCurrent = qstate.selectedOption != null;

  const leftRail = (
    <>
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
            {counts.answered} / {totalQuestions} Done
          </span>
          <span className="font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed font-semibold px-2 py-0.5 rounded">
            Round 01
          </span>
        </div>
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface leading-tight">
          Competitive MCQ Challenge
        </h2>
      </div>

      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-space-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
            Assessment Overview
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Questions</span>
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              {totalQuestions}
            </span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Duration</span>
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              {Math.round(ASSESSMENT_DURATION_MS / 60000)} Min
            </span>
          </div>
        </div>
      </div>
    </>
  );

  const navigator = (
    <QuestionNavigator
      currentIndex={session.currentQuestion - 1}
      counts={counts}
      stateFor={(index: number) => stateFor(MOCK_QUESTIONS[index])}
      onNavigate={onNavigateFromPalette}
      onSubmit={() => setSubmitOpen(true)}
    />
  );

  return (
    <AssessmentLayout
      header={
        <AppHeader
          mode="active"
          candidateName={session.candidate.name}
          statusLabel="In Progress"
          timeLabel={formatHMS(timer.remainingMs)}
          timerTier={timer.expired ? "critical" : timer.tier}
        />
      }
      className="bg-background min-h-[calc(100vh-48px)]"
    >
      <div className="flex flex-col w-full">
        <div className="w-full px-gutter py-space-md max-w-[1720px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
            <aside className="lg:col-span-3 flex flex-col gap-space-md">{leftRail}</aside>

            <main className="lg:col-span-6 flex flex-col gap-space-md">
              <QuestionMetadata
                index={currentQuestion.index}
                total={totalQuestions}
                answered={answeredCurrent}
              />
              <QuestionCard
                question={currentQuestion}
                state={qstate}
                onSelect={selectActive}
                disabled={session.status !== "active"}
              />
              <div className="lg:static sticky bottom-0 z-10 bg-surface/90 backdrop-blur-sm -mx-2 px-2 rounded-xl">
                <AssessmentControls
                  hasPrevious={session.currentQuestion > 1}
                  hasNext={session.currentQuestion < totalQuestions}
                  markedForReview={qstate.markedForReview}
                  hasSelection={answeredCurrent}
                  disabled={session.status !== "active"}
                  onPrevious={previous}
                  onNext={next}
                  onToggleReview={toggleActiveReview}
                  onClear={() => clearResponse(currentQuestion.id)}
                />
              </div>
            </main>

            <aside className="lg:col-span-3 flex flex-col gap-space-md hidden lg:flex">
              {navigator}
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile / tablet palette trigger */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-30 flex items-center gap-2 bg-primary text-on-primary px-4 py-3 rounded-xl font-label-md text-label-md font-bold shadow-lg cursor-pointer"
        aria-label="Open question palette"
      >
        <Icon name="grid_view" className="text-lg" />
        <span>{counts.answered}/{totalQuestions}</span>
      </button>

      {/* Mobile / tablet palette drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity ${
          paletteOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!paletteOpen}
      >
        <button
          type="button"
          aria-label="Close question palette"
          onClick={() => setPaletteOpen(false)}
          className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm cursor-pointer"
        />
        <div
          className={`absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto bg-surface-container-lowest rounded-t-2xl shadow-xl p-space-md transition-transform ${
            paletteOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/40 mb-space-sm">
            <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface">
              Question Palette
            </h3>
            <button
              type="button"
              onClick={() => setPaletteOpen(false)}
              className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant cursor-pointer"
            >
              <Icon name="close" className="text-base" />
              Close
            </button>
          </div>
          {navigator}
        </div>
      </div>

      <SubmitModal
        open={submitOpen}
        counts={counts}
        onContinue={() => setSubmitOpen(false)}
        onConfirm={() => {
          setSubmitOpen(false);
          submitAssessment(1);
        }}
      />

      {timer.expired ? (
        <div
          className="fixed inset-x-0 top-16 z-30 bg-error-container text-on-error-container px-4 py-2 text-center font-label-sm text-label-sm font-semibold"
          role="alert"
        >
          Assessment time has expired. Responses are being finalized locally.
        </div>
      ) : null}
    </AssessmentLayout>
  );
}