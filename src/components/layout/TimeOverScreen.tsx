import { AssessmentLayout } from "./AssessmentLayout";
import { AppHeader } from "./AppHeader";
import { Icon } from "../ui/Icon";

interface TimeOverScreenProps {
  onRestart: () => void;
}

export function TimeOverScreen({ onRestart }: TimeOverScreenProps) {
  return (
    <AssessmentLayout
      header={<AppHeader mode="entry" candidateName="Team" />}
      className="bg-background flex-1 flex items-center justify-center py-10"
    >
      <div className="w-full max-w-md mx-auto px-margin-mobile md:px-margin">
        <div className="bg-surface-container-lowest rounded-xl shadow-md border border-error/30 p-6 sm:p-8 flex flex-col items-center text-center gap-space-md">
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
            <Icon name="report" className="text-on-error-container text-2xl" filled />
          </div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface uppercase">
            Time over, restart again
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            You left the exam, so your session has ended and all progress has
            been wiped.
          </p>
          <button
            type="button"
            onClick={onRestart}
            className="mt-2 flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary px-space-lg py-2.5 rounded-lg font-label-md text-label-md font-bold shadow-md transition-all cursor-pointer"
          >
            <Icon name="refresh" className="text-lg" />
            Restart from Entry
          </button>
        </div>
      </div>
    </AssessmentLayout>
  );
}