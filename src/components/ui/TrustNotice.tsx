import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export interface TrustNoticeProps {
  children: React.ReactNode;
  tone?: "success" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

/**
 * The tinted band used for "Never pay viewing fees" and the approximate-location
 * disclaimer. Small, quiet, and repeated on nearly every tenant surface.
 */
export function TrustNotice({ children, tone = "success", icon, className }: TrustNoticeProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-space-xs rounded-lg px-space-sm py-space-xs text-body-sm",
        tone === "success" ? "bg-success-bg text-success" : "bg-surface-low text-muted",
        className,
      )}
    >
      <span className="mt-0.5 shrink-0 [&_svg]:size-4" aria-hidden>
        {icon ?? <ShieldCheck />}
      </span>
      <span className="flex-1">{children}</span>
    </div>
  );
}
