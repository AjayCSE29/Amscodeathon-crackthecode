import { Icon } from "../ui/Icon";

interface QuestionMetadataProps {
  index: number;
  total: number;
  answered: boolean;
}

export function QuestionMetadata({ index, total, answered }: QuestionMetadataProps) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3">
      <span className="font-label-md text-label-md font-bold text-primary bg-primary-fixed px-space-sm py-1 rounded">
        QUESTION {index} OF {total}
      </span>
      {answered ? (
        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm font-bold text-tertiary">
          <Icon name="check_circle" className="text-sm" filled />
          Answer saved
        </span>
      ) : null}
    </div>
  );
}