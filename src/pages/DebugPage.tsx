import { useCallback, useEffect, useRef, useState } from "react";
import { CodeEditor } from "../components/debug/CodeEditor";
import { DebugControls } from "../components/debug/DebugControls";
import { DebugSubmitModal } from "../components/debug/DebugSubmitModal";
import { LanguageToggle } from "../components/debug/LanguageToggle";
import {
  OutputTerminal,
  type TerminalEntry,
} from "../components/debug/OutputTerminal";
import { ProblemPanel } from "../components/debug/ProblemPanel";
import { AppHeader } from "../components/layout/AppHeader";
import { AssessmentLayout } from "../components/layout/AssessmentLayout";
import { DEBUG_QUESTIONS } from "../data/debugQuestions";
import type { UseAssessmentApi } from "../hooks/useAssessment";
import { useAssessmentTimer } from "../hooks/useAssessmentTimer";
import { plainCode } from "../lib/codeHighlight";
import { formatHMS } from "../lib/utils";
import type { DebugProgramLanguage, DebugQuestion } from "../types/assessment";

const FILE_NAMES: Record<DebugProgramLanguage, string> = {
  "C++": "solution.cpp",
  Python: "solution.py",
  Java: "Main.java",
};

function buildCommand(language: DebugProgramLanguage): string {
  return language === "C++"
    ? "g++ -std=c++17 solution.cpp -o solution && ./solution"
    : language === "Python"
      ? "python3 solution.py"
      : "javac Main.java && java Main";
}

function buildTranscript(
  question: DebugQuestion,
  language: DebugProgramLanguage,
): TerminalEntry[] {
  const entries: TerminalEntry[] = [
    { kind: "command", text: buildCommand(language) },
  ];
  question.sampleCases[language].forEach((sample, i) => {
    if (sample.input) {
      entries.push({ kind: "system", text: `Sample ${i + 1} input` });
      entries.push({ kind: "input", text: sample.input });
    }
    entries.push({ kind: "system", text: `Sample ${i + 1} output` });
    entries.push({ kind: "output", text: sample.output });
  });
  return entries;
}

interface DebugPageProps {
  api: UseAssessmentApi;
}

export function DebugPage({ api }: DebugPageProps) {
  const {
    session,
    currentDebugQuestion,
    debugCounts,
    navigateDebug,
    setCode,
    resetCode,
    setDebugLanguage,
    submitAssessment,
    finalizeExpired,
  } = api;

  const [submitOpen, setSubmitOpen] = useState(false);
  const [outputs, setOutputs] = useState<Record<string, TerminalEntry[]>>({});
  const [view, setView] = useState<"editor" | "terminal">("editor");
  const [running, setRunning] = useState(false);
  const runTimerRef = useRef<number | null>(null);

  const language = session?.debugLanguage ?? "C++";

  const cancelPendingRun = useCallback(() => {
    if (runTimerRef.current !== null) {
      window.clearTimeout(runTimerRef.current);
      runTimerRef.current = null;
    }
    setRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (runTimerRef.current !== null) {
        window.clearTimeout(runTimerRef.current);
      }
    };
  }, []);

  const handleExpire = useCallback(() => {
    finalizeExpired();
  }, [finalizeExpired]);

  const timer = useAssessmentTimer(
    session?.status === "round2" ? session.round2ExpiresAt : null,
    handleExpire,
  );

  const run = useCallback(() => {
    if (!currentDebugQuestion) return;
    const currentLanguage = session?.debugLanguage ?? "C++";
    const question = currentDebugQuestion;
    cancelPendingRun();
    setView("terminal");
    setRunning(true);
    runTimerRef.current = window.setTimeout(() => {
      runTimerRef.current = null;
      setOutputs((prev) => ({
        ...prev,
        [`${question.id}:${currentLanguage}`]: buildTranscript(
          question,
          currentLanguage,
        ),
      }));
      setRunning(false);
    }, 700);
  }, [currentDebugQuestion, session?.debugLanguage, cancelPendingRun]);

  const goEditor = useCallback(() => {
    cancelPendingRun();
    setView("editor");
  }, [cancelPendingRun]);

  const handleNavigate = useCallback(
    (index: number) => {
      cancelPendingRun();
      setView("editor");
      navigateDebug(index + 1);
    },
    [cancelPendingRun, navigateDebug],
  );

  const handleLanguageChange = useCallback(
    (next: DebugProgramLanguage) => {
      if (next !== language) {
        cancelPendingRun();
        setView("editor");
      }
      setDebugLanguage(next);
    },
    [language, cancelPendingRun, setDebugLanguage],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (submitOpen) {
        if (e.key === "Escape") setSubmitOpen(false);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        run();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submitOpen, run]);

  if (!session || !currentDebugQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Debugging content unavailable.
        </p>
      </div>
    );
  }

  const question = currentDebugQuestion;
  const codeKey = `${question.id}:${language}`;
  const codeValue = session.codeEdits[codeKey] ?? plainCode(question.starters[language]);
  const editedIds = [
    ...new Set(Object.keys(session.codeEdits).map((key) => key.split(":")[0])),
  ];
  const editable = session.status === "round2";
  const entries = outputs[`${question.id}:${language}`] ?? [];

  return (
    <AssessmentLayout
      header={
        <AppHeader
          mode="active"
          candidateName={session.candidate.teamName}
          timeLabel={formatHMS(timer.remainingMs)}
          timerTier={timer.expired ? "critical" : timer.tier}
          actions={
            <LanguageToggle value={language} onChange={handleLanguageChange} />
          }
        />
      }
      className="bg-background min-h-[calc(100vh-48px)]"
    >
      <div className="w-full px-gutter py-space-md max-w-[1500px] mx-auto">
        <div className="flex items-center justify-between gap-3 bg-surface-container-lowest rounded-xl px-space-md py-2 mb-space-md shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed font-semibold px-2 py-0.5 rounded shrink-0">
              Round 02
            </span>
            <span className="font-label-md text-label-md uppercase tracking-widest text-primary font-bold truncate">
              {debugCounts.edited} / {debugCounts.total} Programs Edited
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:flex font-label-sm text-label-sm text-on-surface-variant">
              Ctrl + Enter to Run
            </span>
            <LanguageToggle
              value={language}
              onChange={handleLanguageChange}
              className="md:hidden"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
          <aside className="lg:col-span-4 flex flex-col gap-space-md">
            <ProblemPanel question={question} language={language} />
          </aside>

          <main className="lg:col-span-8 flex flex-col gap-space-md lg:h-[calc(100vh-7rem)] lg:min-h-[620px] min-h-0">
            <DebugControls
              questions={DEBUG_QUESTIONS}
              currentIndex={question.index - 1}
              editedIds={editedIds}
              onNavigate={handleNavigate}
              onRun={run}
              onReset={() => resetCode(question.id)}
              onSubmit={() => setSubmitOpen(true)}
              disabled={!editable}
            />
            {view === "terminal" ? (
              <OutputTerminal
                entries={entries}
                onBack={goEditor}
                running={running}
                runningCommand={buildCommand(language)}
                className="flex-1 min-h-[360px]"
              />
            ) : (
              <CodeEditor
                fileName={FILE_NAMES[language]}
                value={codeValue}
                onChange={(code) => setCode(question.id, code)}
                readOnly={!editable}
                className="flex-1 min-h-[360px]"
              />
            )}
          </main>
        </div>
      </div>

      <DebugSubmitModal
        open={submitOpen}
        edited={debugCounts.edited}
        total={debugCounts.total}
        onContinue={() => setSubmitOpen(false)}
        onConfirm={() => {
          setSubmitOpen(false);
          submitAssessment(2);
        }}
      />

      {timer.expired ? (
        <div
          className="fixed inset-x-0 top-16 z-30 bg-error-container text-on-error-container px-4 py-2 text-center font-label-sm text-label-sm font-semibold"
          role="alert"
        >
          Debugging time has expired. Your work is being finalized locally.
        </div>
      ) : null}
    </AssessmentLayout>
  );
}