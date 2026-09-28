import { useState } from "react";
import { AuthError, apiSend } from "../api";
import type { TeamRow } from "../types";
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
} from "../icons";
import {
  ErrorBanner,
  FieldLabel,
  GhostButton,
  Modal,
  PrimaryButton,
  Spinner,
  StatusPill,
  inputClass,
} from "../ui";
import { useAdminData } from "../useAdminData";

export function UsersTab({
  token,
  onUnauthorized,
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const { data, error, loading, reload } = useAdminData<{ teams: TeamRow[] }>(
    token,
    "/api/admin/teams",
    onUnauthorized,
  );
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TeamRow | null>(null);
  const [deleting, setDeleting] = useState<TeamRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [newUserId, setNewUserId] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editTeamName, setEditTeamName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editActive, setEditActive] = useState(true);

  const guard = (err: unknown, message: (text: string) => void) => {
    if (err instanceof AuthError) {
      onUnauthorized();
      return true;
    }
    message(err instanceof Error ? err.message : "Request failed.");
    return false;
  };

  const openCreate = () => {
    setFormError(null);
    setNewUserId("");
    setNewTeamName("");
    setNewPassword("");
    setCreating(true);
  };

  const submitCreate = async () => {
    setFormError(null);
    try {
      await apiSend(token, "POST", "/api/admin/teams", {
        user_id: newUserId.trim(),
        team_name: newTeamName.trim(),
        password: newPassword,
      });
      setCreating(false);
      reload();
    } catch (err) {
      guard(err, setFormError);
    }
  };

  const openEdit = (team: TeamRow) => {
    setFormError(null);
    setEditing(team);
    setEditTeamName(team.team_name);
    setEditPassword("");
    setEditActive(team.is_active);
  };

  const submitEdit = async () => {
    if (!editing) return;
    setFormError(null);
    try {
      await apiSend(token, "PATCH", "/api/admin/teams", {
        user_id: editing.user_id,
        team_name: editTeamName.trim(),
        password: editPassword,
        is_active: editActive,
      });
      setEditing(null);
      reload();
    } catch (err) {
      guard(err, setFormError);
    }
  };

  const toggleActive = async (team: TeamRow) => {
    try {
      await apiSend(token, "PATCH", "/api/admin/teams", {
        user_id: team.user_id,
        is_active: !team.is_active,
      });
      reload();
    } catch (err) {
      guard(err, (text) => window.alert(text));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setFormError(null);
    setBusy(true);
    try {
      await apiSend(token, "DELETE", "/api/admin/teams", {
        user_id: deleting.user_id,
      });
      setDeleting(null);
      reload();
    } catch (err) {
      guard(err, setFormError);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading…" />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
          User Management
        </h2>
        <PrimaryButton onClick={openCreate}>
          <AddIcon className="h-4 w-4" />
          Add team
        </PrimaryButton>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/40">
              <th className="text-left px-4 py-2">User ID</th>
              <th className="text-left px-4 py-2">Team</th>
              <th className="text-left px-4 py-2">Access</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md">
            {data.teams.map((team) => (
              <tr key={team.user_id} className="border-t border-outline-variant/30">
                <td className="px-4 py-2 font-mono font-code-body text-code-body text-on-surface-variant">
                  {team.user_id}
                </td>
                <td className="px-4 py-2 text-on-surface font-semibold">{team.team_name}</td>
                <td className="px-4 py-2">
                  {team.is_active ? (
                    <StatusPill tone="good">Active</StatusPill>
                  ) : (
                    <StatusPill tone="bad">Disabled</StatusPill>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => void toggleActive(team)}
                      className="rounded-lg px-2 py-1 text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md"
                      title={team.is_active ? "Disable access" : "Enable access"}
                    >
                      {team.is_active ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(team)}
                      className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high"
                      aria-label={`Edit ${team.team_name}`}
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleting(team);
                        setFormError(null);
                      }}
                      className="rounded-lg p-1.5 text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                      aria-label={`Delete ${team.team_name}`}
                    >
                      <DeleteIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating ? (
        <Modal title="Add team" onClose={() => setCreating(false)}>
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>User ID</FieldLabel>
              <input
                className={inputClass}
                value={newUserId}
                onChange={(event) => setNewUserId(event.target.value)}
                placeholder="e.g. 110101220"
                autoFocus
              />
            </div>
            <div>
              <FieldLabel>Team name</FieldLabel>
              <input
                className={inputClass}
                value={newTeamName}
                onChange={(event) => setNewTeamName(event.target.value)}
                placeholder="e.g. NovaStack"
              />
            </div>
            <div>
              <FieldLabel>Password</FieldLabel>
              <input
                type="password"
                className={inputClass}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            {formError ? <ErrorBanner message={formError} /> : null}
            <div className="flex justify-end gap-2">
              <GhostButton onClick={() => setCreating(false)}>Cancel</GhostButton>
              <PrimaryButton onClick={() => void submitCreate()}>Create</PrimaryButton>
            </div>
          </div>
        </Modal>
      ) : null}

      {editing ? (
        <Modal title={`Edit ${editing.user_id}`} onClose={() => setEditing(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>User ID (read-only)</FieldLabel>
              <p className="font-mono font-code-body text-code-body text-on-surface-variant">
                {editing.user_id}
              </p>
            </div>
            <div>
              <FieldLabel>Team name</FieldLabel>
              <input
                className={inputClass}
                value={editTeamName}
                onChange={(event) => setEditTeamName(event.target.value)}
              />
            </div>
            <div>
              <FieldLabel>New password (leave blank to keep)</FieldLabel>
              <input
                type="password"
                className={inputClass}
                value={editPassword}
                onChange={(event) => setEditPassword(event.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(event) => setEditActive(event.target.checked)}
              />
              Access enabled
            </label>
            {formError ? <ErrorBanner message={formError} /> : null}
            <div className="flex justify-end gap-2">
              <GhostButton onClick={() => setEditing(null)}>Cancel</GhostButton>
              <PrimaryButton onClick={() => void submitEdit()}>Save</PrimaryButton>
            </div>
          </div>
        </Modal>
      ) : null}

      {deleting ? (
        <Modal title="Delete team" onClose={() => setDeleting(null)}>
          <p className="font-body-md text-body-md text-on-surface">
            Delete <span className="font-semibold">{deleting.team_name}</span> (
            {deleting.user_id})? All of its answers and results are removed permanently.
          </p>
          {formError ? <div className="mt-3"><ErrorBanner message={formError} /></div> : null}
          <div className="flex justify-end gap-2 mt-4">
            <GhostButton onClick={() => setDeleting(null)} disabled={busy}>Cancel</GhostButton>
            <PrimaryButton
              onClick={() => void confirmDelete()}
              disabled={busy}
              className="bg-error hover:bg-error-container"
            >
              {busy ? "Deleting…" : "Delete"}
            </PrimaryButton>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}