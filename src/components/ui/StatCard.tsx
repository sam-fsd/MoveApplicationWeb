import { cn } from "@/lib/cn";
import { Sparkline } from "./Sparkline";

export interface StatCardProps {
  label: string;
  value: string;
  /** Small pill beside the number: "12 unread", "Needs Action", "Escalated". */
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  /** Bold first line of the footer caption — usually a delta like "+18.4%". */
  trend?: string;
  trendTone?: "success" | "warning" | "danger" | "muted";
  /** Second line of the footer caption: "vs last month", "WhatsApp & in-app". */
  caption?: string;
  sparkline?: number[];
  /** Yellow underline on the active card, as on screen 15. */
  active?: boolean;
  className?: string;
}

const TREND_TONE = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  muted: "text-muted",
} as const;

export function StatCard({
  label,
  value,
  badge,
  icon,
  trend,
  trendTone = "success",
  caption,
  sparkline,
  active,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-space-sm overflow-hidden rounded-xl border border-border bg-surface p-space-lg shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-space-sm">
        <span className="text-caption uppercase tracking-wider text-muted">{label}</span>
        {icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-low text-ink [&_svg]:size-4">
            {icon}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-space-xs">
        <span className="font-display text-[40px] font-bold leading-none tracking-tight text-ink">{value}</span>
        {badge}
      </div>

      <div className="flex items-end justify-between gap-space-md">
        <div className="min-w-0">
          {trend && <p className={cn("text-label-sm", TREND_TONE[trendTone])}>{trend}</p>}
          {caption && <p className="text-body-sm text-muted">{caption}</p>}
        </div>
        {sparkline && (
          <div className="w-24 shrink-0">
            <Sparkline points={sparkline} tone={trendTone === "success" ? "success" : "muted"} />
          </div>
        )}
      </div>

      {active && <span className="absolute inset-x-0 bottom-0 h-1 bg-brand" aria-hidden />}
    </div>
  );
}
