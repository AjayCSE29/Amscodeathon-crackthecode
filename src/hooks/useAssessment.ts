import { useCallback, useState } from "react";
import {
  ASSESSMENT_DURATION_MS,
  MOCK_QUESTIONS,
  TOTAL_QUESTIONS,
} from "../data/mockQuestions";
import { storage } from "../lib/storage";
import { sessionIdFromSeed } from "../lib/utils";
import type {
  AssessmentSession,
  Candidate,
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
  totalQuestions: number;
  counts: AssessmentCounts;
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
  submitAssessment: () => void;
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
  };
}

function commit(session: AssessmentSession): void {
  storage.saveSession(session);
  storage.saveAnswers(session.responses);
  storage.saveFlags(session.reviewFlags);
  storage.saveVisited(session.visited);
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

  const submitAssessment = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        status: "submitted" as const,
        submittedAt: Date.now(),
      };
      commit(next);
      return next;
    });
  }, []);

  const finalizeExpired = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.status !== "active") return prev;
      const next = {
        ...prev,
        status: "submitted" as const,
        submittedAt: prev.expiresAt,
      };
      commit(next);
      return next;
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
    totalQuestions: TOTAL_QUESTIONS,
    counts,
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
    submitAssessment,
    finalizeExpired,
    resetToEntry,
  };
}