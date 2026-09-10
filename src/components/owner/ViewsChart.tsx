"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface ViewPoint {
  date: string;
  views: number;
}

const RANGES = [7, 30, 90] as const;

/**
 * Screen 19's Listing Views Performance chart. recharts earns its place here —
 * this one has axes, a tooltip, and a range toggle, unlike the decorative
 * sparklines on the stat cards.
 */
export function ViewsChart({ points, title = "Listing views performance" }: { points: ViewPoint[]; title?: string }) {
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);

  const data = useMemo(() => points.slice(-range), [points, range]);
  const average = data.length
    ? Math.round(data.reduce((sum, p) => sum + p.views, 0) / data.length)
    : 0;

  return (
    <section className="rounded-xl border border-border bg-surface p-space-lg">
      <div className="mb-space-md flex flex-wrap items-start justify-between gap-space-md">
        <div>
          <h2 className="text-headline-sm">{title}</h2>
          <p className="text-body-sm text-muted">
            Daily average: <strong className="text-ink">{formatCount(average)} views</strong>
          </p>
        </div>

        <div className="flex gap-space-2xs rounded-lg bg-surface-low p-space-2xs">
          {RANGES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              aria-pressed={range === option}
              className={cn(
                "rounded-md px-space-sm py-space-2xs text-label-sm transition-colors",
                range === option ? "bg-brand text-ink" : "text-muted hover:text-ink",
              )}
            >
              {option} Days
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="views-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFC93C" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#FFC93C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E6E3DC" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#5A6472", fontSize: 11 }}
              minTickGap={28}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#5A6472", fontSize: 11 }}
              width={44}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: "#12151C", strokeOpacity: 0.15 }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E6E3DC",
                boxShadow: "0 4px 16px rgba(18,21,28,0.08)",
                fontSize: 12,
              }}
              formatter={(value: number) => [`${formatCount(value)} views`, ""]}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#12151C"
              strokeWidth={2}
              fill="url(#views-fill)"
              dot={false}
              activeDot={{ r: 4, fill: "#12151C" }}
              // The mount animation leaves the path empty in any environment
              // that does not run animation frames, and it adds nothing here.
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
