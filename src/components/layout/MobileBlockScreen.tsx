import { AssessmentLayout } from "./AssessmentLayout";
import { AppHeader } from "./AppHeader";
import { Icon } from "../ui/Icon";

export function MobileBlockScreen() {
  return (
    <AssessmentLayout
      header={<AppHeader mode="entry" candidateName="Team" />}
      className="bg-background flex-1 flex items-center justify-center py-10"
    >
      <div className="w-full max-w-md mx-auto px-margin-mobile md:px-margin">
        <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/30 p-6 sm:p-8 flex flex-col items-center text-center gap-space-md">
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
            <Icon name="warning" className="text-on-error-container text-2xl" filled />
          </div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Desktop or Laptop Required
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            This assessment can only be taken on a desktop or laptop computer.
            Please switch to a computer to continue.
          </p>
        </div>
      </div>
    </AssessmentLayout>
  );
}