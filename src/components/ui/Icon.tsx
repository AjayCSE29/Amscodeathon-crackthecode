import type { CSSProperties } from "react";
import { cn } from "../../lib/utils";

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

export function Icon({ name, className, filled = false }: IconProps) {
  const style: CSSProperties = {
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
  };
  return (
    <span className={cn("material-symbols-outlined", className)} style={style} aria-hidden="true">
      {name}
    </span>
  );
}