import { useCallback, useState } from "react";
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
import { plainCode } from "../lib/codeHighlight";
import { storage } from "../lib/storage";
import { sessionIdFromSeed } from "../lib/utils";
import type {
  AssessmentSession,
  Candidate,
  DebugProgramLanguage,
  DebugQuestion,
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
  setCode: (questionId: string, code: string) => void;
  resetCode: (questionId: string) => void;
  setDebugLanguage: (language: DebugProgramLanguage) => void;
  navigateDebug: (index: number) => void;
  submitAssessment: (round: 1 | 2) => void;
  finalizeExpired: () => void;
  resetToEntry: () => void;
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
    round2ExpiresAt: null,
    currentDebug: 1,
    codeEdits: {},
    debugLanguage: "C++",
  };
}

function commit(session: AssessmentSession): void {
  storage.saveSession(session);
  storage.saveAnswers(session.responses);
  storage.saveFlags(session.reviewFlags);
  storage.saveVisited(session.visited);
  storage.saveCodeEdits(session.codeEdits);
}

function applyRound2(prev: AssessmentSession): AssessmentSession {
  return {
    ...prev,
    status: "round2",
    round2ExpiresAt: Date.now() + ROUND2_DURATION_MS,
    currentDebug: Math.min(1, TOTAL_DEBUG_QUESTIONS),
    codeEdits: { ...prev.codeEdits },
  };
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

  const submitAssessment = useCallback((round: 1 | 2) => {
    if (round === 1) {
      setSession((prev) => {
        if (!prev || prev.status !== "active") return prev;
        const next = {
          ...prev,
          status: "round1-submitted" as const,
          submittedAt: Date.now(),
        };
        commit(next);
        return next;
      });
      return;
    }
    setSession((prev) => {
      if (!prev || prev.status !== "round2") return prev;
      const next = {
        ...prev,
        status: "submitted" as const,
        submittedAt: Date.now(),
      };
      commit(next);
      return next;
    });
  }, []);

  const setCode = useCallback((questionId: string, code: string) => {
    setSession((prev) => {
      if (!prev || prev.status !== "round2") return prev;
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
      if (!prev || prev.status !== "round2") return prev;
      const target = DEBUG_QUESTIONS.find((q) => q.id === questionId);
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
        if (!prev || prev.status !== "round2" || prev.debugLanguage === language) {
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
      if (!prev || prev.status !== "round2") return prev;
      const idx = Math.min(TOTAL_DEBUG_QUESTIONS, Math.max(1, index));
      const next = { ...prev, currentDebug: idx };
      commit(next);
      return next;
    });
  }, []);

  const finalizeExpired = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.status === "active") {
        const next = applyRound2(prev);
        commit(next);
        return next;
      }
      if (prev.status === "round2") {
        const next = {
          ...prev,
          status: "submitted" as const,
          submittedAt: prev.round2ExpiresAt ?? Date.now(),
        };
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
    session && session.status === "round2"
      ? DEBUG_QUESTIONS[session.currentDebug - 1] ?? null
      : null;

  const debugCounts = {
    edited:
      session?.status === "round2"
        ? new Set(
            Object.keys(session.codeEdits).map((key) => key.split(":")[0]),
          ).size
        : 0,
    total: TOTAL_DEBUG_QUESTIONS,
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
    setCode,
    resetCode,
    setDebugLanguage,
    navigateDebug,
    submitAssessment,
    finalizeExpired,
    resetToEntry,
  };
}