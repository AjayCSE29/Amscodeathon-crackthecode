export type Round1QuestionStatus = "not_attended" | "correct" | "wrong";

export interface Round1QuestionRow {
  q_no: number;
  selected: string | null;
  correct_option: string | null;
  status: Round1QuestionStatus;
}

export interface Round1TeamRow {
  user_id: string;
  team_name: string;
  score: number;
  q_attended: number;
  q_correct: number;
  finish_seconds: number;
  finished_at: string | null;
  gemini_score: number | null;
  gemini_correct: number | null;
  eval_status: string;
  questions: Round1QuestionRow[];
}

export interface Round2StandingRow {
  user_id: string;
  team_name: string;
  q_completed: number;
  finish_seconds: number;
  submissions_count: number;
  graded_count: number;
  total_score: number;
}

export interface Round2SubmissionRow {
  user_id: string;
  q_no: number;
  language: string;
  program: string;
  output: string;
  stderr: string;
  exit_code: number | null;
  is_hint: boolean;
  is_right: boolean | null;
  final_score: number | null;
  submitted_at: string | null;
}

export interface Round3StandingRow {
  user_id: string;
  team_name: string;
  q_completed: number;
  finish_seconds: number;
  submissions_count: number;
  graded_count: number;
  total_score: number;
}

export interface Round3SubmissionRow {
  user_id: string;
  q_no: number;
  language: string;
  program: string;
  output: string;
  stderr: string;
  exit_code: number | null;
  is_hint: boolean;
  is_right: boolean | null;
  final_score: number | null;
  submitted_at: string | null;
}

export interface TeamRow {
  user_id: string;
  team_name: string;
  is_active: boolean;
}

export interface RecentRow {
  user_id: string;
  team_name: string;
  finish_seconds: number;
  finished_at: string | null;
}

export interface OverviewData {
  teams: number;
  round1Completed: number;
  round2Completed: number;
  round3Completed: number;
  pendingRound2Evaluations: number;
  pendingRound3Evaluations: number;
  recentRound1: RecentRow[];
  recentRound2: RecentRow[];
  recentRound3: RecentRow[];
}