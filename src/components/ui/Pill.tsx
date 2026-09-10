import * as React from "react";
import { cn } from "@/lib/cn";

export type PillTone = "neutral" | "brand" | "success" | "warning" | "danger" | "ink";

const TONES: Record<PillTone, { chip: string; dot: string }> = {
  neutral: { chip: "bg-surface-low text-muted", dot: "bg-muted-subtle" },
  brand: { chip: "bg-brand-subtle text-ink", dot: "bg-brand" },
  success: { chip: "bg-success-bg text-success", dot: "bg-success" },
  warning: { chip: "bg-warning-bg text-warning", dot: "bg-warning" },
  danger: { chip: "bg-danger-bg text-danger", dot: "bg-danger" },
  ink: { chip: "bg-ink text-white", dot: "bg-brand" },
};

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: PillTone;
  /** Status pills lead with a dot; plain chips and filter tags do not. */
  dot?: boolean;
}

/**
 * The one way status is communicated across the app: a tinted, fully rounded
 * chip — never coloured body text on its own.
 */
export function Pill({ tone = "neutral", dot = false, className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-space-2xs rounded-full px-space-sm py-1 text-label-sm",
        TONES[tone].chip,
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("size-1.5 shrink-0 rounded-full", TONES[tone].dot)} aria-hidden />}
      {children}
    </span>
  );
}
