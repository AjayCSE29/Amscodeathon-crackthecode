import { useCallback, useEffect, useRef, useState } from "react";
import {
  ASSESSMENT_DURATION_MS,
  MOCK_QUESTIONS,
  TOTAL_QUESTIONS,
} from "../data/mockQuestions";
import {
  DEBUG_QUESTIONS,
  ROUND2_DURATION_MS,
  TOTAL_DEBUG_QUESTIONS,
} from "../data/debugQuestions";
import {
  ROUND3_DURATION_MS,
  ROUND3_QUESTIONS,
  TOTAL_ROUND3_QUESTIONS,
} from "../data/round3Questions";
import { plainCode } from "../lib/codeHighlight";
import { storage } from "../lib/storage";
import {
  confirmRound2Submission,
  confirmRound3Submission,
  syncRound1,
  syncSubmission,
} from "../lib/syncClient";
import { sessionIdFromSeed } from "../lib/utils";
import type {
  AssessmentSession,
  AssessmentStatus,
  Candidate,
  DebugProgramLanguage,
  DebugQuestion,
  DebugSubmission,
  OptionId,
  Question,
  QuestionState,
} from "../types/assessment";

export interface AssessmentCounts {
  answered: number;
  marked: number;
  remaining: number;
  visited: number;
}

export interface UseAssessmentApi {
  session: AssessmentSession | null;
  currentQuestion: Question | null;
  currentDebugQuestion: DebugQuestion | null;
  totalQuestions: number;
  counts: AssessmentCounts;
  debugCounts: { edited: number; total: number };
  stateFor: (question: Question) => QuestionState;
  restoreProblem: boolean;
  startAssessment: (candidate: Candidate) => void;
  navigate: (index: number) => void;
  next: () => void;
  previous: () => void;
  selectOption: (questionId: string, optionId: OptionId) => void;
  clearResponse: (questionId: string) => void;
  toggleReview: (questionId: string) => void;
  ensureVisited: (questionId: string) => void;
  proceedToRound2: () => void;
  proceedToRound3: () => void;
  setCode: (questionId: string, code: string) => void;
  resetCode: (questionId: string) => void;
  setDebugLanguage: (language: DebugProgramLanguage) => void;
  navigateDebug: (index: number) => void;
  revealHint: (questionId: string) => void;
  confirmDebugOutput: (submission: DebugSubmission) => void;
  submitAssessment: (round: 1 | 2 | 3) => void;
  finalizeExpired: () => void;
  resetToEntry: () => void;
  confirmedIds: string[];
}

const ROUND3_QUESTION_IDS = new Set(ROUND3_QUESTIONS.map((q) => q.id));

function isDebugStatus(status: AssessmentStatus | undefined): boolean {
  return status === "round2" || status === "round3";
}

function questionsFor(status: AssessmentStatus | undefined): DebugQuestion[] {
  if (status === "round3") return ROUND3_QUESTIONS;
  if (status === "round2") return DEBUG_QUESTIONS;
  return [];
}

function buildSession(candidate: Candidate): AssessmentSession {
  const now = Date.now();
  return {
    sessionId: sessionIdFromSeed(),
    candidate,
    startedAt: now,
    expiresAt: now + ASSESSMENT_DURATION_MS,
    currentQuestion: 1,
    status: "active",
    responses: {},
    reviewFlags: {},
    visited: {},
    submittedAt: null,
    round1FinishSeconds: null,
    round1Synced: false,
    round2ExpiresAt: null,
    round2FinishSeconds: null,
    round3ExpiresAt: null,
    round3FinishSeconds: null,
    currentDebug: 1,
    codeEdits: {},
    debugSubmissions: {},
    debugLanguage: "C++",
    hintReveals: {},
  };
}

function commit(session: AssessmentSession): void {
  storage.saveSession(session);
  storage.saveAnswers(session.responses);
  storage.saveFlags(session.reviewFlags);
  storage.saveVisited(session.visited);
  storage.saveCodeEdits(session.codeEdits);
}

function writeSnapshot(session: AssessmentSession): void {
  storage.saveSubmissionSnapshot({
    sessionId: session.sessionId,
    teamName: session.candidate.teamName,
    submittedAt: new Date(session.submittedAt ?? Date.now()).toISOString(),
    submissions: Object.values(session.debugSubmissions).sort(
      (a, b) => a.questionIndex - b.questionIndex,
    ),
  });
}

function round1RemainingSeconds(prev: AssessmentSession): number {
  const remaining = Math.ceil((prev.expiresAt - Date.now()) / 1000);
  return Math.min(ASSESSMENT_DURATION_MS / 1000, Math.max(0, remaining));
}

async function pushSync(session: AssessmentSession): Promise<void> {
  try {
    await syncSubmission(session, storage.loadSubmissionSnapshot());
  } catch (err) {
    console.warn(
      "Result sync failed; local results are still saved.",
      err instanceof Error ? err.message : err,
    );
  }
}

function applyRound2(prev: AssessmentSession): AssessmentSession {
  return {
    ...prev,
    status: "round2",
    round2ExpiresAt: Date.now() + ROUND2_DURATION_MS,
    currentDebug: Math.min(1, TOTAL_DEBUG_QUESTIONS),
    codeEdits: { ...prev.codeEdits },
    debugSubmissions: { ...prev.debugSubmissions },
  };
}

function applyRound3(prev: AssessmentSession): AssessmentSession {
  return {
    ...prev,
    status: "round3",
    round3ExpiresAt: Date.now() + ROUND3_DURATION_MS,
    currentDebug: Math.min(1, TOTAL_ROUND3_QUESTIONS),
    codeEdits: { ...prev.codeEdits },
    debugSubmissions: { ...prev.debugSubmissions },
  };
}

function remainingSeconds(expiresAt: number, maxSeconds: number): number {
  return Math.min(maxSeconds, Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
}

function getCounts(session: AssessmentSession | null, total: number): AssessmentCounts {
  if (!session) {
    return { answered: 0, marked: 0, remaining: total, visited: 0 };
  }
  const answered = Object.values(session.responses).filter(
    (v) => v != null,
  ).length;
  const marked = Object.values(session.reviewFlags).filter(Boolean).length;
  const visited = Object.values(session.visited).filter(Boolean).length;
  return {
    answered,
    marked,
    remaining: Math.max(0, total - answered),
    visited,
  };
}

export function useAssessment(): UseAssessmentApi {
  const [initial] = useState(() => {
    const loaded = storage.loadSession();
    if (loaded.ok) return { session: loaded.data, restoreProblem: false };
    return {
      session: null,
      restoreProblem: !loaded.ok && loaded.reason === "corrupt",
    };
  });

  const [session, setSession] = useState<AssessmentSession | null>(initial.session);
  const [restoreProblem, setRestoreProblem] = useState(initial.restoreProblem);
  const syncedSessionRef = useRef<string | null>(null);
  const round1SyncStartedRef = useRef<string | null>(null);
  const lastConfirmedRef = useRef(new Map<string, string>());

  useEffect(() => {
    if (!session || session.status !== "submitted") return;
    if (syncedSessionRef.current === session.sessionId) return;
    syncedSessionRef.current = session.sessionId;
    void pushSync(session);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const ready =
      session.status === "round1-submitted" ||
      session.status === "round2" ||
      session.status === "round2-submitted" ||
      session.status === "round3";
    if (!ready || session.round1Synced) return;
    if (round1SyncStartedRef.current === session.sessionId) return;
    round1SyncStartedRef.current = session.sessionId;
    void (async () => {
      try {
        await syncRound1(session);
        setSession((prev) => {
          if (
            !prev ||
            prev.sessionId !== session.sessionId ||
            prev.round1Synced
          ) {
            return prev;
          }
          const next = { ...prev, round1Synced: true };
          commit(next);
          return next;
        });
      } catch (err) {
        console.warn(
          "Round 1 sync failed; results stay local.",
          err instanceof Error ? err.message : err,
        );
      }
    })();
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== "round2") return;
    for (const submission of Object.values(session.debugSubmissions)) {
      const key = `${submission.questionId}:${submission.language}`;
      const digest = JSON.stringify({
        code: submission.code,
        samples: submission.samples,
      });
      if (lastConfirmedRef.current.get(key) === digest) continue;
      lastConfirmedRef.current.set(key, digest);
      void confirmRound2Submission(session, submission).catch((err) => {
        console.warn(
          "Round 2 sync failed; submission stays local.",
          err instanceof Error ? err.message : err,
        );
        lastConfirmedRef.current.delete(key);
      });
    }
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== "round3") return;
    for (const submission of Object.values(session.debugSubmissions)) {
      if (!ROUND3_QUESTION_IDS.has(submission.questionId)) continue;
      const key = `${submission.questionId}:${submission.language}`;
      const digest = JSON.stringify({
        code: submission.code,
        samples: submission.samples,
      });
      if (lastConfirmedRef.current.get(key) === digest) continue;
      lastConfirmedRef.current.set(key, digest);
      void confirmRound3Submission(session, submission).catch((err) => {
        console.warn(
          "Round 3 sync failed; submission stays local.",
          err instanceof Error ? err.message : err,
        );
        lastConfirmedRef.current.delete(key);
      });
    }
  }, [session]);

  const updateSession = useCallback((next: AssessmentSession) => {
    setSession(next);
    commit(next);
  }, []);

  const startAssessment = useCallback(
    (candidate: Candidate) => {
      const next = buildSession(candidate);
      setRestoreProblem(false);
      updateSession(next);
    },
    [updateSession],
  );

  const setCurrentIndex = useCallback(
    (sessionState: AssessmentSession, index: number) => {
      const idx = Math.min(TOTAL_QUESTIONS, Math.max(1, index));
      const target = MOCK_QUESTIONS[idx - 1];
      const visited: Record<string, boolean> =
        idx === sessionState.currentQuestion
          ? sessionState.visited
          : { ...sessionState.visited, [target.id]: true };
      return {
        ...sessionState,
        currentQuestion: idx,
        visited,
      };
    },
    [],
  );

  const navigate = useCallback(
    (index: number) => {
      setSession((prev) => {
        if (!prev || prev.status !== "active") return prev;
        const next = setCurrentIndex(prev, index);
        commit(next);
        return next;
      });
    },
    [setCurrentIndex],
  );

  const next = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.status !== "active") return prev;
      const next = setCurrentIndex(
        prev,
        Math.min(TOTAL_QUESTIONS, prev.currentQuestion + 1),
      );
      commit(next);
      return next;
    });
  }, [setCurrentIndex]);

  const previous = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.status !== "active") return prev;
      const next = setCurrentIndex(
        prev,
        Math.max(1, prev.currentQuestion - 1),
      );
      commit(next);
      return next;
    });
  }, [setCurrentIndex]);

  const selectOption = useCallback((questionId: string, optionId: OptionId) => {
    setSession((prev) => {
      if (!prev || prev.status !== "active") return prev;
      const next = {
        ...prev,
        responses: { ...prev.responses, [questionId]: optionId },
        visited: { ...prev.visited, [questionId]: true },
      };
      commit(next);
      return next;
    });
  }, []);

  const clearResponse = useCallback((questionId: string) => {
    setSession((prev) => {
      if (!prev || prev.status !== "active") return prev;
      const next = {
        ...prev,
        responses: { ...prev.responses, [questionId]: null },
      };
      commit(next);
      return next;
    });
  }, []);

  const toggleReview = useCallback((questionId: string) => {
    setSession((prev) => {
      if (!prev || prev.status !== "active") return prev;
      const next = {
        ...prev,
        reviewFlags: {
          ...prev.reviewFlags,
          [questionId]: !prev.reviewFlags[questionId],
        },
        visited: { ...prev.visited, [questionId]: true },
      };
      commit(next);
      return next;
    });
  }, []);

  const ensureVisited = useCallback((questionId: string) => {
    setSession((prev) => {
      if (!prev || prev.status !== "active" || prev.visited[questionId]) {
        return prev;
      }
      const next = {
        ...prev,
        visited: { ...prev.visited, [questionId]: true },
      };
      commit(next);
      return next;
    });
  }, []);

  const proceedToRound2 = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.status !== "round1-submitted") return prev;
      const next = applyRound2(prev);
      commit(next);
      return next;
    });
  }, []);

  const proceedToRound3 = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.status !== "round2-submitted") return prev;
      const next = applyRound3(prev);
      commit(next);
      return next;
    });
  }, []);

  const confirmDebugOutput = useCallback((submission: DebugSubmission) => {
    setSession((prev) => {
      if (!prev || !isDebugStatus(prev.status)) return prev;
      const next = {
        ...prev,
        debugSubmissions: {
          ...prev.debugSubmissions,
          [submission.questionId]: submission,
        },
      };
      commit(next);
      return next;
    });
  }, []);

  const submitAssessment = useCallback((round: 1 | 2 | 3) => {
    if (round === 1) {
      setSession((prev) => {
        if (!prev || prev.status !== "active") return prev;
        const next = {
          ...prev,
          status: "round1-submitted" as const,
          round1FinishSeconds: round1RemainingSeconds(prev),
          submittedAt: Date.now(),
        };
        commit(next);
        return next;
      });
      return;
    }
    if (round === 2) {
      setSession((prev) => {
        if (!prev || prev.status !== "round2") return prev;
        const next = {
          ...prev,
          status: "round2-submitted" as const,
          round2FinishSeconds: remainingSeconds(
            prev.round2ExpiresAt ?? Date.now(),
            ROUND2_DURATION_MS / 1000,
          ),
          submittedAt: Date.now(),
        };
        commit(next);
        return next;
      });
      return;
    }
    setSession((prev) => {
      if (!prev || prev.status !== "round3") return prev;
      const next = {
        ...prev,
        status: "submitted" as const,
        round3FinishSeconds: remainingSeconds(
          prev.round3ExpiresAt ?? Date.now(),
          ROUND3_DURATION_MS / 1000,
        ),
        submittedAt: Date.now(),
      };
      writeSnapshot(next);
      commit(next);
      return next;
    });
  }, []);

  const setCode = useCallback((questionId: string, code: string) => {
    setSession((prev) => {
      if (!prev || !isDebugStatus(prev.status)) return prev;
      const key = `${questionId}:${prev.debugLanguage}`;
      const next = {
        ...prev,
        codeEdits: { ...prev.codeEdits, [key]: code },
      };
      commit(next);
      return next;
    });
  }, []);

  const resetCode = useCallback((questionId: string) => {
    setSession((prev) => {
      if (!prev || !isDebugStatus(prev.status)) return prev;
      const target =
        DEBUG_QUESTIONS.find((q) => q.id === questionId) ??
        ROUND3_QUESTIONS.find((q) => q.id === questionId);
      if (!target) return prev;
      const key = `${questionId}:${prev.debugLanguage}`;
      const next = {
        ...prev,
        codeEdits: {
          ...prev.codeEdits,
          [key]: plainCode(target.starters[prev.debugLanguage]),
        },
      };
      commit(next);
      return next;
    });
  }, []);

  const setDebugLanguage = useCallback(
    (language: DebugProgramLanguage) => {
      setSession((prev) => {
        if (!prev || !isDebugStatus(prev.status) || prev.debugLanguage === language) {
          return prev;
        }
        const next = { ...prev, debugLanguage: language };
        commit(next);
        return next;
      });
    },
    [],
  );

  const navigateDebug = useCallback((index: number) => {
    setSession((prev) => {
      if (!prev || !isDebugStatus(prev.status)) return prev;
      const total =
        prev.status === "round3" ? TOTAL_ROUND3_QUESTIONS : TOTAL_DEBUG_QUESTIONS;
      const idx = Math.min(total, Math.max(1, index));
      const next = { ...prev, currentDebug: idx };
      commit(next);
      return next;
    });
  }, []);

  const revealHint = useCallback((questionId: string) => {
    setSession((prev) => {
      if (!prev || !isDebugStatus(prev.status) || prev.hintReveals[questionId]) {
        return prev;
      }
      const next = {
        ...prev,
        hintReveals: { ...prev.hintReveals, [questionId]: true },
      };
      commit(next);
      return next;
    });
  }, []);

  const finalizeExpired = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.status === "active") {
        const next = {
          ...applyRound2(prev),
          round1FinishSeconds: 0,
        };
        commit(next);
        return next;
      }
      if (prev.status === "round2") {
        const next = {
          ...applyRound3(prev),
          round2FinishSeconds: 0,
        };
        commit(next);
        return next;
      }
      if (prev.status === "round3") {
        const next = {
          ...prev,
          status: "submitted" as const,
          round3FinishSeconds: 0,
          submittedAt: prev.round3ExpiresAt ?? Date.now(),
        };
        writeSnapshot(next);
        commit(next);
        return next;
      }
      return prev;
    });
  }, []);

  const resetToEntry = useCallback(() => {
    storage.clearSession();
    setSession(null);
    setRestoreProblem(false);
  }, []);

  const currentQuestion: Question | null = session
    ? MOCK_QUESTIONS[session.currentQuestion - 1] ?? null
    : null;

  const currentDebugQuestion: DebugQuestion | null =
    session && isDebugStatus(session.status)
      ? questionsFor(session.status)[session.currentDebug - 1] ?? null
      : null;

  const activeQuestions = questionsFor(session?.status);
  const activeQuestionIds = new Set(activeQuestions.map((q) => q.id));
  const currentRoundActive = isDebugStatus(session?.status);

  const debugCounts = {
    edited: currentRoundActive
      ? new Set(
          Object.keys(session?.codeEdits ?? {})
            .map((key) => key.split(":")[0])
            .filter((id) => activeQuestionIds.has(id)),
        ).size
      : 0,
    total: activeQuestions.length,
  };

  const stateFor = useCallback(
    (q: Question): QuestionState => {
      if (!session) {
        return { selectedOption: null, visited: false, markedForReview: false };
      }
      return {
        selectedOption: session.responses[q.id] ?? null,
        visited: Boolean(session.visited[q.id]),
        markedForReview: Boolean(session.reviewFlags[q.id]),
      };
    },
    [session],
  );

  const counts = getCounts(session, TOTAL_QUESTIONS);

  const confirmedIds = currentRoundActive
    ? Object.keys(session?.debugSubmissions ?? {}).filter((id) =>
        activeQuestionIds.has(id),
      )
    : [];

  return {
    session,
    currentQuestion,
    currentDebugQuestion,
    totalQuestions: TOTAL_QUESTIONS,
    counts,
    debugCounts,
    stateFor,
    restoreProblem,
    startAssessment,
    navigate,
    next,
    previous,
    selectOption,
    clearResponse,
    toggleReview,
    ensureVisited,
    proceedToRound2,
    proceedToRound3,
    setCode,
    resetCode,
    setDebugLanguage,
    navigateDebug,
    revealHint,
    confirmDebugOutput,
    submitAssessment,
    finalizeExpired,
    resetToEntry,
    confirmedIds,
  };
}