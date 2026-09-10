import Image from "next/image";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  /** Path under /public/illustrations. */
  illustration?: string;
  title: string;
  description?: string;
  /** One or two buttons — screens 05 and 10 both use two. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Every list view ships its empty state at the same time as the list itself
 * (CLAUDE.md working agreement) — the demo will hit them.
 */
export function EmptyState({ illustration, title, description, actions, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-space-md rounded-xl border border-border bg-surface px-space-lg py-space-3xl text-center",
        className,
      )}
    >
      {illustration && (
        <Image src={illustration} alt="" width={320} height={268} className="h-40 w-auto" aria-hidden />
      )}
      <div className="space-y-space-2xs">
        <h3 className="text-headline-sm">{title}</h3>
        {description && <p className="mx-auto max-w-md text-body-md text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center justify-center gap-space-sm">{actions}</div>}
    </div>
  );
}
