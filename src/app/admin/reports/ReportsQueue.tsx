"use client";

import Image from "next/image";
import { useState } from "react";
import { ReportDrawer, type ReportDetail } from "./ReportDrawer";
import { Pill } from "@/components/ui/Pill";
import { ReportStatusPill, SeverityPill } from "@/components/ui/StatusPill";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/cn";

/** The incident queue on screen 23, with the drawer that opens beside it. */
export function ReportsQueue({ reports }: { reports: ReportDetail[] }) {
  const [openId, setOpenId] = useState<string | null>(reports[0]?.id ?? null);
  const open = reports.find((r) => r.id === openId) ?? null;

  return (
    <div className="grid gap-space-lg xl:grid-cols-[1.5fr_1fr]">
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface">
        <header className="flex items-center justify-between gap-space-sm border-b border-border px-space-lg py-space-sm">
          <h2 className="text-headline-sm">Incident queue</h2>
          <Pill>{reports.length} shown</Pill>
        </header>

        <ul className="divide-y divide-border">
          {reports.map((report) => (
            <li key={report.id}>
              <button
                type="button"
                onClick={() => setOpenId(report.id)}
                aria-current={report.id === openId ? "true" : undefined}
                className={cn(
                  "flex w-full items-start gap-space-sm border-l-2 px-space-lg py-space-md text-left transition-colors",
                  report.id === openId
                    ? "border-brand bg-brand-subtle"
                    : "border-transparent hover:bg-surface-low",
                )}
              >
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-low">
                  {report.listing.cover && (
                    <Image src={report.listing.cover} alt="" fill sizes="48px" className="object-cover" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <Pill
                    tone={report.severity === "CRITICAL" ? "danger" : report.severity === "MODERATE" ? "warning" : "neutral"}
                    className="text-caption"
                  >
                    {report.reason}
                  </Pill>
                  <span className="mt-space-2xs block truncate text-label-md text-ink">
                    {report.listing.title}
                  </span>
                  <span className="block truncate text-body-sm text-muted">
                    {report.listing.estate} • reported by {report.reporter.fullName}
                  </span>
                </span>

                <span className="shrink-0 space-y-space-2xs text-right">
                  <span className="block text-body-sm text-muted">
                    {formatRelative(report.createdAt)}
                  </span>
                  <ReportStatusPill status={report.status} />
                  <span className="block">
                    <SeverityPill severity={report.severity} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="xl:sticky xl:top-24 xl:self-start">
        {open ? (
          <ReportDrawer report={open} onClose={() => setOpenId(null)} />
        ) : (
          <p className="rounded-xl border border-dashed border-border px-space-lg py-space-2xl text-center text-body-md text-muted">
            Select a report to see the full incident and act on it.
          </p>
        )}
      </div>
    </div>
  );
}
