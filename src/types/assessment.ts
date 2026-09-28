export type AssessmentStatus =
  | "entry"
  | "active"
  | "round1-submitted"
  | "round2"
  | "round2-submitted"
  | "round3"
  | "submitted";

export type DebugProgramLanguage = "C++" | "Python" | "Java";

export type DebugDifficulty = "Easy" | "Medium" | "Hard";

export interface DebugCase {
  input?: string;
  output: string;
}

export interface DebugDriver {
  before?: string[];
  after?: string[];
}

export interface DebugQuestion {
  id: string;
  index: number;
  title: string;
  difficulty: DebugDifficulty;
  statement: string;
  starters: Record<DebugProgramLanguage, string[]>;
  sampleCases: Record<DebugProgramLanguage, DebugCase[]>;
  bugHints: Record<DebugProgramLanguage, string>;
  driver?: Record<DebugProgramLanguage, DebugDriver>;
}

export interface DebugSampleResult {
  input: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export interface DebugSubmission {
  questionId: string;
  questionIndex: number;
  language: DebugProgramLanguage;
  code: string;
  samples: DebugSampleResult[];
}

export interface SubmissionSnapshot {
  sessionId: string;
  teamName: string;
  submittedAt: string;
  submissions: DebugSubmission[];
}

export interface Candidate {
  teamName: string;
  userId: string;
  token: string;
}

export type CodeTokenType =
  | "plain"
  | "comment"
  | "keyword"
  | "type"
  | "function"
  | "number"
  | "string";

export interface CodeToken {
  type: CodeTokenType;
  text: string;
}

export interface CodeLine {
  lineNumber: number;
  text: string;
  tokens: CodeToken[];
}

export interface CodeSnippet {
  fileName: string;
  language: string;
  lines: CodeLine[];
}

export type OptionId = "A" | "B" | "C" | "D";

export interface QuestionOption {
  id: OptionId;
  text: string;
}

export interface Question {
  id: string;
  index: number;
  question: string;
  options: QuestionOption[];
  code?: CodeSnippet;
}

export interface AssessmentSession {
  sessionId: string;
  candidate: Candidate;
  startedAt: number;
  expiresAt: number;
  currentQuestion: number;
  status: AssessmentStatus;
  responses: Record<string, OptionId | null>;
  reviewFlags: Record<string, boolean>;
  visited: Record<string, boolean>;
  submittedAt: number | null;
  round1FinishSeconds: number | null;
  round1Synced: boolean;
  round2ExpiresAt: number | null;
  round2FinishSeconds: number | null;
  round3ExpiresAt: number | null;
  round3FinishSeconds: number | null;
  currentDebug: number;
  codeEdits: Record<string, string>;
  debugSubmissions: Record<string, DebugSubmission>;
  debugLanguage: DebugProgramLanguage;
  hintReveals: Record<string, boolean>;
}

export interface QuestionState {
  selectedOption: OptionId | null;
  visited: boolean;
  markedForReview: boolean;
}

export type TimerTier = "normal" | "low" | "critical";

export interface TimerState {
  remainingMs: number;
  tier: TimerTier;
  expired: boolean;
}

