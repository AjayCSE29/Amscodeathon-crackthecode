import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { getUsers } from "../../lib/userStore";
import type { Candidate } from "../../types/assessment";
import { Icon } from "../ui/Icon";
import { ConsentPanel } from "./ConsentPanel";

interface CandidateFormProps {
  onContinue: (candidate: Candidate) => void;
  initialName?: string;
  cameraStatus?: "unknown" | "ready" | "denied" | "unavailable";
  onVerifyCamera?: () => void;
  verifyingCamera?: boolean;
}

interface FieldErrors {
  name?: string;
  institution?: string;
  registrationId?: string;
  consent?: string;
}

interface FieldDef {
  key: keyof FieldErrors;
  name: string;
  label: string;
  icon: string;
  tag: string;
  tagClass: string;
  placeholder: string;
  mono?: boolean;
  type?: string;
}

const FIELDS: FieldDef[] = [
  {
    key: "name",
    name: "userId",
    label: "User ID",
    icon: "person",
    tag: "REQUIRED",
    tagClass: "text-primary font-semibold",
    placeholder: "e.g. USER-1234",
  },
  {
    key: "institution",
    name: "teamName",
    label: "Team Name",
    icon: "groups",
    tag: "REQUIRED",
    tagClass: "text-outline-variant",
    placeholder: "e.g. Code Ninjas",
  },
  {
    key: "registrationId",
    name: "password",
    label: "Password",
    icon: "lock",
    tag: "SECURE",
    tagClass: "text-tertiary",
    placeholder: "Enter password",
    mono: true,
    type: "password",
  },
];

function validate(
  values: { name: string; institution: string; registrationId: string },
  consent: boolean,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "User ID is required.";
  if (!values.institution.trim()) errors.institution = "Team Name is required.";
  if (!values.registrationId.trim()) errors.registrationId = "Password is required.";
  if (!consent) errors.consent = "You must confirm the assessment conditions before continuing.";
  
  if (Object.keys(errors).length === 0 && values.name && values.institution && values.registrationId) {
    const users = getUsers();
    const user = users.find(u => 
      u.userId === values.name.trim() && 
      u.teamName === values.institution.trim() && 
      u.password === values.registrationId.trim()
    );

    if (!user) {
      errors.name = "Invalid credentials.";
      errors.institution = "Invalid credentials.";
      errors.registrationId = "Invalid credentials.";
    } else if (!user.isActive) {
      errors.name = "This account is currently disabled.";
    }
  }
  
  return errors;
}

export function CandidateForm({
  onContinue,
  initialName = "",
  cameraStatus = "unknown",
  onVerifyCamera,
  verifyingCamera = false,
}: CandidateFormProps) {
  const [name, setName] = useState(initialName);
  const [institution, setInstitution] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const hasAnyError = useMemo(
    () => Object.keys(errors).length > 0,
    [errors],
  );

  const runVerify = () => {
    if (!onVerifyCamera || verifying) return;
    setVerifying(true);
    void Promise.resolve(onVerifyCamera()).finally(() => setVerifying(false));
  };

  const handleSubmit = () => {
    setAttempted(true);
    const found = validate(
      { name, institution, registrationId },
      consent,
    );
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onContinue({
      name: name.trim(),
      institution: institution.trim(),
      registrationId: registrationId.trim(),
      department: "N/A",
    });
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
      {FIELDS.map((field) => {
        const value =
          field.key === "name"
            ? name
            : field.key === "institution"
              ? institution
              : registrationId;
        const setValue =
          field.key === "name"
            ? setName
            : field.key === "institution"
              ? setInstitution
              : setRegistrationId;
        const fieldError = touchedError(field.key);
        return (
          <div className="space-y-1.5" key={field.key}>
            <div className="flex justify-between items-center">
              <label
                className="font-label-md text-label-md text-on-surface uppercase tracking-wide"
                htmlFor={field.name}
              >
                {field.label}
              </label>
              <span className={cn("font-label-sm text-label-sm font-mono", field.tagClass)}>
                {field.tag}
              </span>
            </div>
            <div
              className={cn(
                "relative flex items-center",
                fieldError && "focus-within:border-error",
              )}
            >
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">
                {field.icon}
              </span>
              <input
                id={field.name}
                name={field.name}
                type={field.type || "text"}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (errors[field.key]) {
                    setErrors((prev) => ({ ...prev, [field.key]: undefined }));
                  }
                }}
                placeholder={field.placeholder}
                className={cn(
                  "w-full pl-11 pr-4 py-2.5 bg-surface rounded-lg text-on-surface font-body-md text-body-md",
                  "placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors",
                  "shadow-inner border",
                  fieldError
                    ? "border-error/60"
                    : "border-transparent focus:border-outline-variant/60",
                  field.mono && "font-label-md text-label-md tracking-wider",
                )}
              />
            </div>
            {fieldError ? (
              <p className="font-label-sm text-label-sm text-error" role="alert">
                {fieldError}
              </p>
            ) : null}
          </div>
        );
      })}

      <ConsentPanel
        checked={consent}
        onToggle={(checked) => {
          setConsent(checked);
          if (errors.consent && checked) {
            setErrors((prev) => ({ ...prev, consent: undefined }));
          }
        }}
        cameraStatus={cameraStatus}
        onVerifyCamera={runVerify}
        verifying={verifyingCamera || verifying}
        error={touchedError("consent")}
      />

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

      <div className="flex items-start gap-2 pt-2 px-1 text-on-surface-variant">
        <Icon name="info" className="text-sm text-secondary shrink-0 mt-0.5" />
        <p className="font-label-sm text-label-sm leading-relaxed">
          Please verify your details before continuing. Once initialized, the
          secure session token is locked and the 45-minute countdown will start
          immediately.
        </p>
      </div>
    </form>
  );
}