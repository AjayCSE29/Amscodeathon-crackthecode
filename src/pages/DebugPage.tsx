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
import { composedProgram } from "../data/round3Questions";
import type { UseAssessmentApi } from "../hooks/useAssessment";
import { useAssessmentTimer } from "../hooks/useAssessmentTimer";
import { plainCode } from "../lib/codeHighlight";
import { runCode, type RunResult } from "../lib/runClient";
import { formatHMS } from "../lib/utils";
import type {
  DebugProgramLanguage,
  DebugQuestion,
  DebugSampleResult,
} from "../types/assessment";

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

interface DebugPageProps {
  api: UseAssessmentApi;
  questions: DebugQuestion[];
  roundLabel: string;
  submitRound: 2 | 3;
}

export function DebugPage({ api, questions, roundLabel, submitRound }: DebugPageProps) {
  const {
    session,
    currentDebugQuestion,
    debugCounts,
    navigateDebug,
    setCode,
    resetCode,
    setDebugLanguage,
    revealHint,
    confirmDebugOutput,
    submitAssessment,
    finalizeExpired,
    confirmedIds,
  } = api;

  const [submitOpen, setSubmitOpen] = useState(false);
  const [outputs, setOutputs] = useState<Record<string, TerminalEntry[]>>({});
  const [runResults, setRunResults] = useState<
    Record<string, { code: string; samples: DebugSampleResult[] }>
  >({});
  const [view, setView] = useState<"editor" | "terminal">("editor");
  const [running, setRunning] = useState(false);
  const runVersionRef = useRef(0);

  const language = session?.debugLanguage ?? "C++";
  const questionIds = useRef(new Set(questions.map((q) => q.id))).current;

  const cancelPendingRun = useCallback(() => {
    runVersionRef.current += 1;
    setRunning(false);
  }, []);

  const handleExpire = useCallback(() => {
    finalizeExpired();
  }, [finalizeExpired]);

  const timer = useAssessmentTimer(
    session?.status === "round2"
      ? session.round2ExpiresAt
      : session?.status === "round3"
        ? session.round3ExpiresAt
        : null,
    handleExpire,
  );

  const run = useCallback(async () => {
    if (!currentDebugQuestion) return;
    const question = currentDebugQuestion;
    const currentLanguage = session?.debugLanguage ?? "C++";
    const runId = ++runVersionRef.current;
    setView("terminal");
    setRunning(true);

    const editorCode =
      session?.codeEdits[`${question.id}:${currentLanguage}`] ??
      plainCode(question.starters[currentLanguage]);
    const code = composedProgram(question, currentLanguage, editorCode);
    const runKey = `${question.id}:${currentLanguage}`;
    const entries: TerminalEntry[] = [
      { kind: "command", text: buildCommand(currentLanguage) },
    ];
    const samples: DebugSampleResult[] = [];

    for (const [i, sample] of question.sampleCases[
      currentLanguage
    ].entries()) {
      if (runVersionRef.current !== runId) return;
      const label = `Sample ${i + 1}`;
      if (sample.input) {
        entries.push({ kind: "system", text: `${label} input` });
        entries.push({ kind: "input", text: sample.input });
      }
      entries.push({ kind: "system", text: `${label} output` });

      if (runVersionRef.current !== runId) return;
      const result: RunResult = await runCode({
        language: currentLanguage,
        code,
        stdin: sample.input ?? "",
      });
      if (runVersionRef.current !== runId) return;

      samples.push({
        input: sample.input ?? "",
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      });

      if (result.exitCode != null && result.exitCode !== 0) {
        const diagnostics =
          result.stderr.trim() !== ""
            ? result.stderr.trim()
            : "(program exited with a non-zero status)";
        entries.push({ kind: "system", text: diagnostics });
      } else {
        const stdout = result.stdout.trim();
        entries.push({
          kind: "output",
          text: stdout === "" ? "(no output)" : stdout,
        });
        const stderr = result.stderr.trim();
        if (stderr !== "") entries.push({ kind: "system", text: stderr });
      }
    }

    if (runVersionRef.current !== runId) return;
    setOutputs((prev) => ({
      ...prev,
      [runKey]: entries,
    }));
    setRunResults((prev) => ({
      ...prev,
      [runKey]: { code, samples },
    }));
    setRunning(false);
  }, [currentDebugQuestion, session]);

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

  const handleConfirm = useCallback(() => {
    const question = currentDebugQuestion;
    if (!question) return;
    const captured = runResults[`${question.id}:${language}`];
    if (!captured) return;
    confirmDebugOutput({
      questionId: question.id,
      questionIndex: question.index,
      language,
      code: captured.code,
      samples: captured.samples,
    });
    cancelPendingRun();
    setView("editor");
    navigateDebug(Math.min(questions.length, question.index + 1));
  }, [
    currentDebugQuestion,
    language,
    runResults,
    confirmDebugOutput,
    cancelPendingRun,
    navigateDebug,
    questions.length,
  ]);

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
    ...new Set(
      Object.keys(session.codeEdits)
        .map((key) => key.split(":")[0])
        .filter((id) => questionIds.has(id)),
    ),
  ];
  const editable =
    session.status === "round2" || session.status === "round3";
  const entries = outputs[codeKey] ?? [];
  const canConfirm = Boolean(runResults[codeKey]);
  const confirmed = confirmedIds.includes(question.id);

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
              {roundLabel}
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
            <ProblemPanel
              question={question}
              language={language}
              hintRevealed={Boolean(session.hintReveals[question.id])}
              onRevealHint={() => revealHint(question.id)}
              label={submitRound === 3 ? "Leetcode Problem" : undefined}
              hintPenalty={submitRound === 3 ? "You will lose 5 marks" : undefined}
            />
          </aside>

          <main className="lg:col-span-8 flex flex-col gap-space-md lg:h-[calc(100vh-7rem)] lg:min-h-[620px] min-h-0">
            <DebugControls
              questions={questions}
              currentIndex={question.index - 1}
              editedIds={editedIds}
              confirmedIds={confirmedIds}
              onNavigate={handleNavigate}
              onRun={run}
              onReset={() => resetCode(question.id)}
              onConfirm={handleConfirm}
              canConfirm={canConfirm}
              confirmed={confirmed}
              running={running}
              onSubmit={() => setSubmitOpen(true)}
              disabled={!editable}
              itemLabel={submitRound === 3 ? "Problem" : "Bug"}
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
        round={submitRound}
        onContinue={() => setSubmitOpen(false)}
        onConfirm={() => {
          setSubmitOpen(false);
          submitAssessment(submitRound);
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