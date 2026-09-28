import { useState } from "react";
import { adminLogin } from "../api";
import { Icon } from "../../components/ui/Icon";
import { ErrorBanner, GhostButton, inputClass } from "../ui";

export function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    if (username.trim().length === 0 || password.length === 0) {
      setError("Enter the admin username and password.");
      return;
    }
    setBusy(true);
    try {
      const token = await adminLogin(username.trim(), password);
      onLogin(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/30 p-6 sm:p-8">
        <div className="pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="badge" className="text-primary" />
            <span className="font-label-sm text-label-sm font-semibold uppercase text-primary tracking-wider">
              Staff Console
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
            Admin Access
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Restricted to competition organizers.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider mb-1" htmlFor="admin-username">
              Username
            </label>
            <input
              id="admin-username"
              className={inputClass}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider mb-1" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              onKeyDown={(event) => {
                if (event.key === "Enter") void submit();
              }}
            />
          </div>

          {error ? <ErrorBanner message={error} /> : null}

          <GhostButton onClick={() => void submit()} disabled={busy} className="justify-center w-full bg-primary text-on-primary border-none">
            {busy ? "Signing in…" : "Sign in"}
          </GhostButton>
        </div>
      </div>
    </div>
  );
}