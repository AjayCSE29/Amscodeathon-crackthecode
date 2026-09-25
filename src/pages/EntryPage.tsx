import { useState } from "react";
import { CandidateForm } from "../components/entry/CandidateForm";
import { AssessmentLayout } from "../components/layout/AssessmentLayout";
import { AppHeader } from "../components/layout/AppHeader";
import { requestFullscreen } from "../lib/fullscreen";
import type { Candidate } from "../types/assessment";

interface EntryPageProps {
  onContinue: (candidate: Candidate) => void;
  initialName?: string;
}

export function EntryPage({ onContinue, initialName = "" }: EntryPageProps) {
  const [typedName, setTypedName] = useState(initialName);

  const handleContinue = (candidate: Candidate) => {
    requestFullscreen();
    setTypedName(candidate.teamName);
    onContinue(candidate);
  };

  return (
    <AssessmentLayout
      header={
        <AppHeader
          mode="entry"
          candidateName={typedName || "Team"}
        />
      }
      className="bg-background flex-1 flex items-center justify-center py-10 md:py-16"
    >
      <div className="w-full max-w-xl mx-auto px-margin-mobile md:px-margin">
        <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/30 p-6 sm:p-8 flex flex-col">
          <div className="pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" aria-hidden="true" />
                <span className="font-label-sm text-label-sm font-semibold uppercase text-primary tracking-wider">
                  Team Terminal
                </span>
              </div>
              <span className="font-label-sm text-label-sm bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant font-mono">
                AUTH: REQUIRED
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
              Enter Competition
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Enter your team access details to initialize the proctored
              assessment.
            </p>
          </div>

          <CandidateForm onContinue={handleContinue} initialName={initialName} />
        </div>
      </div>
    </AssessmentLayout>
  );
}