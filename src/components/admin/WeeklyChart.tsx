"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCount } from "@/lib/format";

export interface WeekPoint {
  week: string;
  published: number;
  inReview: number;
  rejected: number;
}

/**
 * Screen 20's Weekly New Listings & Approvals chart. Fed from PlatformWeekly,
 * which is seeded rather than derived — the design's ~186 listings a week is
 * platform-scale history the demo seed cannot produce.
 */
export function WeeklyChart({ data }: { data: WeekPoint[] }) {
  const totals = data.map((d) => d.published + d.inReview + d.rejected);
  const average = totals.length ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
  const peak = data[totals.indexOf(Math.max(...totals))];
  const passRate = (() => {
    const published = data.reduce((sum, d) => sum + d.published, 0);
    const all = totals.reduce((a, b) => a + b, 0);
    return all ? Math.round((published / all) * 1000) / 10 : 0;
  })();

  return (
    <section className="rounded-xl border border-border bg-surface p-space-lg">
      <div className="mb-space-md flex flex-wrap items-start justify-between gap-space-md">
        <div>
          <h2 className="text-headline-sm">Weekly new listings &amp; approvals</h2>
          <p className="text-body-sm text-muted">
            Intake trends and vetting throughput over the preceding 12 operational cycles.
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="#E6E3DC" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "#5A6472", fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#5A6472", fontSize: 11 }} width={44} />
            <Tooltip
              cursor={{ fill: "rgba(18,21,28,0.04)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E6E3DC",
                boxShadow: "0 4px 16px rgba(18,21,28,0.08)",
                fontSize: 12,
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingBottom: 12 }}
            />
            {/* Stacked, so each bar's height is that week's total intake. */}
            <Bar dataKey="published" stackId="w" name="Published" fill="#12151C" isAnimationActive={false} />
            <Bar dataKey="inReview" stackId="w" name="Pending / review" fill="#FFC93C" isAnimationActive={false} />
            <Bar
              dataKey="rejected"
              stackId="w"
              name="Rejected"
              fill="#F1A0A0"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <dl className="mt-space-md grid gap-space-md border-t border-border pt-space-md sm:grid-cols-3">
        {[
          ["Weekly intake average", `${formatCount(average)} listings / week`],
          ["Peak volume", peak ? `${peak.week} (${formatCount(peak.published + peak.inReview + peak.rejected)} listings)` : "—"],
          ["Verification pass rate", `${passRate}% direct approval`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-caption uppercase tracking-wider text-muted">{label}</dt>
            <dd className="text-label-md text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
