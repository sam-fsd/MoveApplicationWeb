import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ChecklistItem {
  label: string;
  sublabel?: string;
  done: boolean;
}

/**
 * Verification is a checklist, not a boolean (CLAUDE.md rule 3). Screens 16 and
 * 22 render the five stored checks as separate rows; screen 15 collapses ID and
 * KRA PIN into one line for display, which is a caller's decision, not this
 * component's.
 */
export function VerificationChecklist({
  items,
  className,
}: {
  items: ChecklistItem[];
  className?: string;
}) {
  return (
    <ul className={cn("space-y-space-sm", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-space-xs">
          {item.done ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          ) : (
            <Circle className="mt-0.5 size-4 shrink-0 text-muted-subtle" aria-hidden />
          )}
          <span className="min-w-0 flex-1">
            <span className={cn("block text-body-md", item.done ? "text-ink" : "text-muted")}>{item.label}</span>
            {item.sublabel && <span className="block text-body-sm text-muted">{item.sublabel}</span>}
          </span>
          <span className="sr-only">{item.done ? "Verified" : "Pending"}</span>
        </li>
      ))}
    </ul>
  );
}
