import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import type { Candidate } from "../../types/assessment";
import { Icon } from "../ui/Icon";

interface CandidateFormProps {
  onContinue: (candidate: Candidate) => void;
  initialName?: string;
}

interface FieldErrors {
  teamName?: string;
  password?: string;
}

function validate(values: {
  teamName: string;
  password: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.teamName.trim()) errors.teamName = "Team name is required.";
  if (!values.password) errors.password = "Password is required.";
  return errors;
}

export function CandidateForm({
  onContinue,
  initialName = "",
}: CandidateFormProps) {
  const [teamName, setTeamName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);

  const hasAnyError = useMemo(
    () => Object.keys(errors).length > 0,
    [errors],
  );

  const handleSubmit = () => {
    setAttempted(true);
    const found = validate({ teamName, password });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onContinue({ teamName: teamName.trim(), password });
  };

  const touchedError = (key: keyof FieldErrors) =>
    attempted ? errors[key] : undefined;

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      noValidate
    >
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label
            className="font-label-md text-label-md text-on-surface uppercase tracking-wide"
            htmlFor="teamName"
          >
            Team Name
          </label>
          <span className="font-label-sm text-label-sm font-mono text-primary font-semibold">
            TEAM_ACCESS
          </span>
        </div>
        <div
          className={cn(
            "relative flex items-center",
            touchedError("teamName") && "focus-within:border-error",
          )}
        >
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">
            badge
          </span>
          <input
            id="teamName"
            name="teamName"
            type="text"
            value={teamName}
            autoComplete="off"
            onChange={(e) => {
              setTeamName(e.target.value);
              if (errors.teamName) {
                setErrors((prev) => ({ ...prev, teamName: undefined }));
              }
            }}
            placeholder="e.g. Team Phoenix"
            className={cn(
              "w-full pl-11 pr-4 py-2.5 bg-surface rounded-lg text-on-surface font-body-md text-body-md",
              "placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors",
              "shadow-inner border",
              touchedError("teamName")
                ? "border-error/60"
                : "border-transparent focus:border-outline-variant/60",
            )}
          />
        </div>
        {touchedError("teamName") ? (
          <p className="font-label-sm text-label-sm text-error" role="alert">
            {touchedError("teamName")}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label
            className="font-label-md text-label-md text-on-surface uppercase tracking-wide"
            htmlFor="password"
          >
            Password
          </label>
          <span className="font-label-sm text-label-sm font-mono text-outline-variant">
            REQUIRED
          </span>
        </div>
        <div
          className={cn(
            "relative flex items-center",
            touchedError("password") && "focus-within:border-error",
          )}
        >
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">
            lock
          </span>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            autoComplete="off"
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            placeholder="••••••••"
            className={cn(
              "w-full pl-11 pr-4 py-2.5 bg-surface rounded-lg text-on-surface font-body-md text-body-md",
              "placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors",
              "shadow-inner border",
              touchedError("password")
                ? "border-error/60"
                : "border-transparent focus:border-outline-variant/60",
            )}
          />
        </div>
        {touchedError("password") ? (
          <p className="font-label-sm text-label-sm text-error" role="alert">
            {touchedError("password")}
          </p>
        ) : null}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className={cn(
            "w-full py-3.5 px-6 rounded-lg font-label-md text-label-md tracking-wider uppercase font-semibold",
            "flex items-center justify-center gap-3 transition-all duration-150 transform active:scale-[0.99] cursor-pointer",
            "bg-primary-container hover:bg-primary shadow-md hover:shadow-lg text-on-primary",
            !hasAnyError && attempted && "ring-2 ring-primary/40",
          )}
        >
          <span>Continue to Assessment</span>
          <Icon name="arrow_forward" className="text-lg" />
        </button>
      </div>
    </form>
  );
}