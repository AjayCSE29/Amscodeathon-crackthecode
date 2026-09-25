export type AssessmentStatus =
  | "entry"
  | "active"
  | "round1-submitted"
  | "round2"
  | "submitted";

export type DebugProgramLanguage = "C++" | "Python" | "Java";

export type DebugDifficulty = "Easy" | "Medium" | "Hard";

export interface DebugCase {
  input?: string;
  output: string;
}

export interface DebugQuestion {
  id: string;
  index: number;
  title: string;
  difficulty: DebugDifficulty;
  statement: string;
  starters: Record<DebugProgramLanguage, string[]>;
  sampleCases: Record<DebugProgramLanguage, DebugCase[]>;
  bugHint?: string;
}

export interface Candidate {
  name: string;
  institution: string;
  registrationId: string;
  department: string;
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
  /** Reserved for future backend integration. NEVER rendered in the participant UI. */
  correctOptionId?: OptionId;
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
  round2ExpiresAt: number | null;
  currentDebug: number;
  codeEdits: Record<string, string>;
  debugLanguage: DebugProgramLanguage;
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

export type ProctorEventType =
  | "TAB_HIDDEN"
  | "TAB_VISIBLE"
  | "WINDOW_BLUR"
  | "WINDOW_FOCUS"
  | "FULLSCREEN_EXIT"
  | "CAMERA_DENIED"
  | "CAMERA_GRANTED";

export interface ProctorEvent {
  type: ProctorEventType;
  timestamp: number;
}

export type CameraStatus = "unknown" | "ready" | "denied" | "unavailable";

export type InputField =
  | "name"
  | "institution"
  | "registrationId"
  | "department"
  | "consent";