import { isFullscreen, requestFullscreen } from "../../lib/fullscreen";
import { Icon } from "../ui/Icon";

interface FullscreenWarningProps {
  remainingMs: number;
}

export function FullscreenWarning({ remainingMs }: FullscreenWarningProps) {
  const seconds = Math.max(1, Math.ceil(remainingMs / 1000));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/85 backdrop-blur-sm px-margin-mobile md:px-margin">
      <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-xl shadow-lg border border-error/30 p-6 sm:p-8 flex flex-col items-center text-center gap-space-md">
        <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center">
          <Icon
            name="warning"
            className="text-on-error-container text-3xl"
            filled
          />
        </div>
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
          Return to the exam
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          You switched windows or left fullscreen. If you stay away, your
          session will end and all progress will be lost.
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-code-body text-[56px] leading-none font-bold text-error">
            {seconds}
          </span>
          <span className="font-label-md text-label-md text-on-surface-variant">
            sec
          </span>
        </div>
        {!isFullscreen() ? (
          <button
            type="button"
            onClick={requestFullscreen}
            className="mt-2 flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary px-space-lg py-2.5 rounded-lg font-label-md text-label-md font-bold shadow-md transition-all cursor-pointer"
          >
            Re-enter fullscreen
          </button>
        ) : null}
      </div>
    </div>
  );
}