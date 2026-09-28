import { useState } from "react";
import { AuthError, downloadExport } from "../api";
import type { OverviewData } from "../types";
import { ErrorBanner, GhostButton, Spinner } from "../ui";
import { useAdminData } from "../useAdminData";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 px-5 py-4">
      <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p className="font-headline-lg text-headline-lg text-on-surface font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}

function RecentTable({
  title,
  rows,
}: {
  title: string;
  rows: { team_name: string; finish_seconds: number; finished_at: string | null }[];
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
      <div className="px-4 py-3 border-b border-outline-variant/40">
        <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 font-body-md text-body-md text-on-surface-variant">No results yet.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              <th className="text-left px-4 py-2">Team</th>
              <th className="text-left px-4 py-2">Time</th>
              <th className="text-left px-4 py-2">Finished</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md">
            {rows.map((row) => (
              <tr key={row.team_name} className="border-t border-outline-variant/30">
                <td className="px-4 py-2 text-on-surface">{row.team_name}</td>
                <td className="px-4 py-2 font-mono font-code-body text-code-body">
                  {Math.floor(row.finish_seconds / 60)}m {row.finish_seconds % 60}s
                </td>
                <td className="px-4 py-2 text-on-surface-variant">
                  {row.finished_at ? new Date(row.finished_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function OverviewTab({
  token,
  onUnauthorized,
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const { data, error, loading, reload } = useAdminData<OverviewData>(
    token,
    "/api/admin/overview",
    onUnauthorized,
  );
  const [exporting, setExporting] = useState(false);

  const exportResults = async () => {
    setExporting(true);
    try {
      const csv = await downloadExport(token);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "codeathon-results.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof AuthError) {
        onUnauthorized();
        return;
      }
      window.alert(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Spinner label="Loading…" />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
          Overview
        </h2>
        <GhostButton onClick={() => void exportResults()} disabled={exporting}>
          {exporting ? "Exporting…" : "Export results (CSV)"}
        </GhostButton>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Teams" value={data.teams} />
        <StatCard label="Round 1 completed" value={data.round1Completed} />
        <StatCard label="Round 2 completed" value={data.round2Completed} />
        <StatCard label="Round 3 completed" value={data.round3Completed} />
        <StatCard label="Round 2 pending eval" value={data.pendingRound2Evaluations} />
        <StatCard label="Round 3 pending eval" value={data.pendingRound3Evaluations} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <RecentTable title="Round 1 finishers" rows={data.recentRound1} />
        <RecentTable title="Round 2 finishers" rows={data.recentRound2} />
        <RecentTable title="Round 3 finishers" rows={data.recentRound3} />
      </div>
    </div>
  );
}