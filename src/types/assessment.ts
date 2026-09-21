export type AssessmentStatus = "entry" | "active" | "submitted";

export interface Candidate {
  name: string;
  institution: string;
  registrationId: string;
  department: string;
}

export type Difficulty = "Easy" | "Medium" | "Hard";

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
  category: string;
  difficulty: Difficulty;
  marks: number;
  negativeMarks: number;
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