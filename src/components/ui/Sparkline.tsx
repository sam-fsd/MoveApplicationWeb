import { cn } from "@/lib/cn";

export interface SparklineProps {
  points: number[];
  className?: string;
  tone?: "success" | "muted";
}

/**
 * Hand-rolled rather than recharts: the stat-card trend lines are decorative,
 * have no axes or tooltips, and appear four to six at a time. recharts arrives
 * in Phase 4 for the charts that actually need interaction.
 */
export function Sparkline({ points, className, tone = "success" }: SparklineProps) {
  if (points.length < 2) return null;

  const width = 100;
  const height = 32;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((value, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((value - min) / span) * (height - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const stroke = tone === "success" ? "text-success" : "text-muted-subtle";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-8 w-full", stroke, className)}
      aria-hidden
    >
      <polyline
        points={`0,${height} ${coords.join(" ")} ${width},${height}`}
        fill="currentColor"
        className="opacity-10"
      />
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
