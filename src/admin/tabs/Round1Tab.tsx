import { useState } from "react";
import { AuthError, apiSend } from "../api";
import { MOCK_QUESTIONS } from "../../data/mockQuestions";
import type { Round1QuestionRow, Round1TeamRow } from "../types";
import {
  ErrorBanner,
  GhostButton,
  Modal,
  Spinner,
  StatusPill,
} from "../ui";
import { useAdminData } from "../useAdminData";
import { cn } from "../../lib/utils";

export function Round1Tab({
  token,
  onUnauthorized,
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const { data, error, loading, reload } = useAdminData<{ rows: Round1TeamRow[] }>(
    token,
    "/api/admin/round1",
    onUnauthorized,
  );
  const [selected, setSelected] = useState<Round1TeamRow | null>(null);
  const [detail, setDetail] = useState<Round1QuestionRow | null>(null);
  const [running, setRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const runCrossCheck = async () => {
    setRunning(true);
    setRunMessage(null);
    try {
      const result = await apiSend<{ evaluated: number; failed: number }>(
        token,
        "POST",
        "/api/admin/evaluate/round1",
        {},
      );
      setRunMessage(`Cross-checked ${result.evaluated} team(s) with Gemini.`);
      reload();
    } catch (err) {
      if (err instanceof AuthError) {
        onUnauthorized();
        return;
      }
      setRunMessage(err instanceof Error ? err.message : "Cross-check failed.");
    } finally {
      setRunning(false);
    }
  };

  const questionCellClass = (row: Round1QuestionRow) => {
    if (row.status === "correct") return "bg-tertiary-fixed-dim/40 text-on-tertiary-fixed";
    if (row.status === "wrong") return "bg-error-container text-on-error-container";
    return "bg-surface-container-high text-on-surface-variant";
  };

  if (loading) return <Spinner label="Loading…" />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
          Round 1 — Answers & Score
        </h2>
        <div className="flex items-center gap-3">
          {runMessage ? (
            <span className="font-body-md text-body-md text-on-surface-variant">{runMessage}</span>
          ) : null}
          <GhostButton onClick={() => void runCrossCheck()} disabled={running}>
            {running ? "Running…" : "Run Gemini cross-check"}
          </GhostButton>
        </div>
      </div>

      <p className="font-body-md text-body-md text-on-surface-variant">
        Scores shown are the authoritative result. The Gemini column is an
        independent cross-check for audit; flag any team where the two differ.
      </p>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/40">
              <th className="text-left px-4 py-2">#</th>
              <th className="text-left px-4 py-2">Team</th>
              <th className="text-left px-4 py-2">Attended</th>
              <th className="text-left px-4 py-2">Correct</th>
              <th className="text-left px-4 py-2">Score</th>
              <th className="text-left px-4 py-2">Time</th>
              <th className="text-left px-4 py-2">Gemini audit</th>
              <th className="text-left px-4 py-2">Answers</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md">
            {data.rows.map((team, index) => {
              const geminiReady = team.gemini_correct !== null;
              const match = geminiReady && team.gemini_correct === team.q_correct;
              return (
                <tr
                  key={team.user_id}
                  className="border-t border-outline-variant/30 cursor-pointer hover:bg-surface-container-low"
                  onClick={() => setSelected(team)}
                >
                  <td className="px-4 py-2 text-on-surface-variant">{index + 1}</td>
                  <td className="px-4 py-2 text-on-surface font-semibold">{team.team_name}</td>
                  <td className="px-4 py-2">{team.q_attended}</td>
                  <td className="px-4 py-2">{team.q_correct}</td>
                  <td className="px-4 py-2 font-mono font-code-body text-code-body font-semibold">
                    {team.score.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 font-mono font-code-body text-code-body text-on-surface-variant">
                    {Math.floor(team.finish_seconds / 60)}m {team.finish_seconds % 60}s
                  </td>
                  <td className="px-4 py-2">
                    {geminiReady ? (
                      match ? (
                        <StatusPill tone="good">match · {team.gemini_correct}</StatusPill>
                      ) : (
                        <StatusPill tone="bad">
                          differs · {team.gemini_correct}
                        </StatusPill>
                      )
                    ) : (
                      <StatusPill tone="neutral">{team.eval_status}</StatusPill>
                    )}
                  </td>
                  <td className="px-4 py-2 text-on-surface-variant">View</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected ? (
        <Modal title={`${selected.team_name} · Round 1`} onClose={() => setSelected(null)} wide>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-6 font-body-md text-body-md text-on-surface">
              <span>
                Score <span className="font-semibold font-mono">{selected.score.toFixed(2)}</span>
              </span>
              <span>
                Attended <span className="font-semibold">{selected.q_attended}/60</span>
              </span>
              <span>
                Correct <span className="font-semibold">{selected.q_correct}</span>
              </span>
              {selected.gemini_correct !== null ? (
                <span>
                  Gemini <span className="font-semibold">{selected.gemini_correct}</span>
                  {selected.gemini_correct === selected.q_correct ? " ✓" : " ✗"}
                </span>
              ) : null}
            </div>

            {detail ? (
              <div className="rounded-lg border border-outline-variant/40 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Question {detail.q_no}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetail(null)}
                    className="font-label-md text-label-md text-primary font-semibold hover:underline"
                  >
                    Close
                  </button>
                </div>
                <p className="font-body-md text-body-md text-on-surface">
                  {MOCK_QUESTIONS[detail.q_no - 1]?.question ?? "(question text unavailable)"}
                </p>
                <ul className="flex flex-col gap-1">
                  {MOCK_QUESTIONS[detail.q_no - 1]?.options.map((option) => {
                    const isSelected = detail.selected === option.id;
                    const isCorrect = detail.correct_option === option.id;
                    return (
                      <li
                        key={option.id}
                        className={cn(
                          "rounded border px-3 py-1.5 font-body-md text-body-md flex items-center gap-2",
                          isCorrect
                            ? "border-tertiary-fixed-dim bg-tertiary-fixed-dim/20 text-on-surface"
                            : isSelected
                              ? "border-error bg-error-container text-on-error-container"
                              : "border-outline-variant/50 text-on-surface-variant",
                        )}
                      >
                        <span className="font-mono font-code-body text-code-body">{option.id}.</span>
                        {option.text}
                        {isSelected ? (
                          <span className="ml-auto font-label-sm text-label-sm uppercase">selected</span>
                        ) : null}
                        {isCorrect ? (
                          <span className="ml-auto font-label-sm text-label-sm text-tertiary uppercase">
                            correct
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="grid grid-cols-10 sm:grid-cols-12 gap-1.5">
                {selected.questions.map((row) => (
                  <button
                    key={row.q_no}
                    type="button"
                    onClick={() => setDetail(row)}
                    className={cn(
                      "rounded p-2 font-mono font-code-body text-code-body text-center",
                      questionCellClass(row),
                    )}
                    title={`Q${row.q_no}: ${row.status}`}
                  >
                    {row.selected ?? "—"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}