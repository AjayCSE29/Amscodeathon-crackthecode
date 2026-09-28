import { useState } from "react";
import { AuthError, apiSend } from "../api";
import { DEBUG_QUESTIONS } from "../../data/debugQuestions";
import type { Round2StandingRow, Round2SubmissionRow } from "../types";
import { Icon } from "../../components/ui/Icon";
import {
  ErrorBanner,
  GhostButton,
  Modal,
  Spinner,
  StatusPill,
} from "../ui";
import { useAdminData } from "../useAdminData";
import { cn } from "../../lib/utils";

interface EvalSummary {
  ok?: boolean;
  isRight?: boolean;
  hardcoded?: boolean;
  reason?: string;
}

export function Round2Tab({
  token,
  onUnauthorized,
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const { data, error, loading, reload } = useAdminData<{
    standings: Round2StandingRow[];
    submissions: Round2SubmissionRow[];
  }>(token, "/api/admin/round2", onUnauthorized);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Round2SubmissionRow | null>(null);
  const [evalSummary, setEvalSummary] = useState<EvalSummary | null>(null);
  const [running, setRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const byTeam = new Map<string, Round2SubmissionRow[]>();
  for (const submission of data?.submissions ?? []) {
    const list = byTeam.get(submission.user_id) ?? [];
    list.push(submission);
    byTeam.set(submission.user_id, list);
  }
  const nameByUser = new Map(
    (data?.standings ?? []).map((standing) => [standing.user_id, standing.team_name]),
  );

  const runPending = async () => {
    setRunning(true);
    setRunMessage(null);
    try {
      const result = await apiSend<{ evaluated: number; failed: number; pending: number }>(
        token,
        "POST",
        "/api/admin/evaluate/round2",
        {},
      );
      setRunMessage(
        `Evaluated ${result.evaluated} pending submission(s); ${result.failed} failed; ${result.pending} still pending.`,
      );
      reload();
    } catch (err) {
      if (err instanceof AuthError) {
        onUnauthorized();
        return;
      }
      setRunMessage(err instanceof Error ? err.message : "Evaluation failed.");
    } finally {
      setRunning(false);
    }
  };

  const reEvaluate = async (submission: Round2SubmissionRow) => {
    setRunning(true);
    setEvalSummary(null);
    try {
      const result = await apiSend<EvalSummary>(
        token,
        "POST",
        "/api/admin/evaluate/round2",
        { user_id: submission.user_id, q_no: submission.q_no },
      );
      setEvalSummary(result);
      reload();
    } catch (err) {
      if (err instanceof AuthError) {
        onUnauthorized();
        return;
      }
      setEvalSummary({ ok: false, reason: err instanceof Error ? err.message : "Re-evaluation failed." });
    } finally {
      setRunning(false);
    }
  };

  const openSubmission = (submission: Round2SubmissionRow) => {
    setEvalSummary(null);
    setSelected(submission);
  };

  if (loading) return <Spinner label="Loading…" />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  if (!data) return null;

  const standings = data.standings;
  const pendingCount = data.submissions.filter((s) => s.is_right === null).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
          Round 2 — Debug Challenge
        </h2>
        <div className="flex items-center gap-3">
          {runMessage ? (
            <span className="font-body-md text-body-md text-on-surface-variant">{runMessage}</span>
          ) : null}
          <GhostButton onClick={() => void runPending()} disabled={running}>
            {running ? "Running…" : `Evaluate pending (${pendingCount})`}
          </GhostButton>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/40">
              <th className="px-4 py-2 w-8"></th>
              <th className="text-left px-4 py-2">#</th>
              <th className="text-left px-4 py-2">Team</th>
              <th className="text-left px-4 py-2">Completed</th>
              <th className="text-left px-4 py-2">Graded</th>
              <th className="text-left px-4 py-2">Score</th>
              <th className="text-left px-4 py-2">Time</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md">
            {standings.map((team, index) => (
              <FragmentRow
                key={team.user_id}
                team={team}
                index={index}
                expanded={expanded === team.user_id}
                submissions={byTeam.get(team.user_id) ?? []}
                onToggle={() => setExpanded(expanded === team.user_id ? null : team.user_id)}
                onOpen={openSubmission}
              />
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <Modal
          title={`Q${selected.q_no} · ${selected.language} · ${nameByUser.get(selected.user_id) ?? selected.user_id}`}
          onClose={() => setSelected(null)}
          wide
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {selected.is_right === null ? (
                <StatusPill tone="neutral">Pending</StatusPill>
              ) : selected.is_right ? (
                <StatusPill tone="good">Correct</StatusPill>
              ) : (
                <StatusPill tone="bad">Incorrect</StatusPill>
              )}
              {selected.is_hint ? <StatusPill tone="warn">Hint used</StatusPill> : null}
              {selected.final_score !== null ? (
                <span className="font-mono font-code-body text-code-body text-on-surface-variant">
                  +{selected.final_score} pts
                </span>
              ) : null}
              <span className="ml-auto font-mono font-code-body text-code-body text-on-surface-variant">
                exit {selected.exit_code ?? "—"}
              </span>
            </div>

            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider mb-1">
                Task
              </p>
              <p className="font-body-md text-body-md text-on-surface">
                {DEBUG_QUESTIONS[selected.q_no - 1]?.statement ?? "(unknown task)"}
              </p>
            </div>

            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider mb-1">
                Submitted program
              </p>
              <pre className="rounded-lg bg-surface-container-high p-3 overflow-x-auto font-mono font-code-body text-code-body text-on-surface whitespace-pre-wrap">
                {selected.program || "(empty)"}
              </pre>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider mb-1">
                  Observed stdout
                </p>
                <pre className="rounded-lg bg-surface-container-high p-3 overflow-x-auto font-mono font-code-body text-code-body text-on-surface whitespace-pre-wrap">
                  {selected.output || "(none)"}
                </pre>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider mb-1">
                  Observed stderr
                </p>
                <pre className="rounded-lg bg-error-container/60 p-3 overflow-x-auto font-mono font-code-body text-code-body text-on-surface whitespace-pre-wrap">
                  {selected.stderr || "(none)"}
                </pre>
              </div>
            </div>

            {evalSummary ? (
              <div className="rounded-lg border border-outline-variant/40 p-3 flex flex-col gap-1">
                <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
                  Gemini re-evaluation
                </p>
                {evalSummary.ok && typeof evalSummary.isRight === "boolean" ? (
                  <>
                    <p className="font-body-md text-body-md text-on-surface">
                      {evalSummary.isRight ? "Correct" : "Incorrect"}
                      {evalSummary.hardcoded ? " — flagged as hardcoded output" : ""}
                    </p>
                    {evalSummary.reason ? (
                      <p className="font-body-md text-body-md text-on-surface-variant">{evalSummary.reason}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {evalSummary.reason ?? "No verdict returned."}
                  </p>
                )}
              </div>
            ) : null}

            <div className="flex justify-end">
              <GhostButton onClick={() => void reEvaluate(selected)} disabled={running}>
                {running ? "Re-evaluating…" : "Re-evaluate with Gemini"}
              </GhostButton>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function FragmentRow({
  team,
  index,
  expanded,
  submissions,
  onToggle,
  onOpen,
}: {
  team: Round2StandingRow;
  index: number;
  expanded: boolean;
  submissions: Round2SubmissionRow[];
  onToggle: () => void;
  onOpen: (submission: Round2SubmissionRow) => void;
}) {
  const cells = Array.from({ length: 20 }, (_, i) => i + 1).flatMap((qNo) =>
    submissions.filter((s) => s.q_no === qNo),
  );
  return (
    <>
      <tr className="border-t border-outline-variant/30 cursor-pointer hover:bg-surface-container-low" onClick={onToggle}>
        <td className="px-4 py-2">
          <Icon
            name="arrow_drop_down"
            className={cn("text-on-surface-variant transition-transform text-xl", expanded ? "rotate-180" : "")}
          />
        </td>
        <td className="px-4 py-2 text-on-surface-variant">{index + 1}</td>
        <td className="px-4 py-2 text-on-surface font-semibold">{team.team_name}</td>
        <td className="px-4 py-2">{team.q_completed}</td>
        <td className="px-4 py-2">{team.graded_count}</td>
        <td className="px-4 py-2 font-mono font-code-body text-code-body font-semibold">
          {team.total_score}
        </td>
        <td className="px-4 py-2 font-mono font-code-body text-code-body text-on-surface-variant">
          {Math.floor(team.finish_seconds / 60)}m {team.finish_seconds % 60}s
        </td>
      </tr>
      {expanded ? (
        <tr className="border-t border-outline-variant/30 bg-surface-container-low/50">
          <td colSpan={7} className="px-6 py-4">
            {cells.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">No confirmed submissions.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cells.map((submission) => (
                  <button
                    key={`${submission.user_id}-${submission.q_no}-${submission.language}`}
                    type="button"
                    onClick={() => onOpen(submission)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 font-mono font-code-body text-code-body text-left",
                      submission.is_right === null
                        ? "border-outline-variant bg-surface-container-high text-on-surface-variant"
                        : submission.is_right
                          ? "border-tertiary-fixed-dim bg-tertiary-fixed-dim/25 text-on-tertiary-fixed"
                          : "border-error bg-error-container text-on-error-container",
                    )}
                    title={`Q${submission.q_no} · ${submission.language}${submission.is_hint ? " · hint" : ""}`}
                  >
                    Q{submission.q_no} · {submission.language}
                    {submission.is_hint ? " · hint" : ""}
                  </button>
                ))}
              </div>
            )}
          </td>
        </tr>
      ) : null}
    </>
  );
}