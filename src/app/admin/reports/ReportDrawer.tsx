"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ExternalLink, EyeOff, Search, ShieldAlert, ThumbsDown, X } from "lucide-react";

import { moderateReport, type ReportAction } from "@/app/admin/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/Toast";
import { Pill } from "@/components/ui/Pill";
import { ReportStatusPill, SeverityPill } from "@/components/ui/StatusPill";
import { formatKes, formatRelative } from "@/lib/format";
import type { ReportSeverity, ReportStatus } from "@prisma/client";

export interface ReportDetail {
  id: string;
  reason: string;
  details: string | null;
  severity: ReportSeverity;
  status: ReportStatus;
  resolution: string | null;
  createdAt: Date;
  reporter: { fullName: string; email: string; avatarUrl: string | null };
  listing: {
    id: string;
    title: string;
    estate: string;
    roadOrLandmark: string;
    rentKes: number;
    status: string;
    cover: string | null;
    owner: { id: string; fullName: string; businessName: string };
  };
}

/**
 * Screen 23's detail drawer and its four moderation actions. Taking a listing
 * down is the one with teeth — it removes the unit from tenant search at once.
 */
export function ReportDrawer({ report, onClose }: { report: ReportDetail; onClose: () => void }) {
  const [resolution, setResolution] = useState(report.resolution ?? "");
  const closed = report.status === "RESOLVED" || report.status === "DISMISSED";

  return (
    <aside className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <header className="flex items-start gap-space-sm bg-ink p-space-md text-white">
        <span
          className={`mt-1 size-2 shrink-0 rounded-full ${
            report.severity === "CRITICAL" ? "bg-danger" : "bg-warning"
          }`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-space-xs">
            <span className="text-label-md text-white">
              Report #{report.id.slice(-6).toUpperCase()}
            </span>
            {report.severity === "CRITICAL" && <Pill tone="danger">High severity</Pill>}
          </p>
          <p className="mt-space-2xs text-body-sm text-white/60">
            Submitted {formatRelative(report.createdAt)} • {report.reason}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-space-2xs text-white/60 transition-colors hover:bg-ink-soft hover:text-white"
          aria-label="Close report details"
        >
          <X className="size-5" aria-hidden />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-space-md overflow-y-auto p-space-md">
        {/* Unit */}
        <section className="rounded-xl border border-border p-space-md">
          <p className="mb-space-sm flex items-center justify-between gap-space-sm">
            <span className="text-caption uppercase tracking-wider text-muted">
              Reported unit information
            </span>
            <Pill className="text-caption">#{report.listing.id.slice(-6).toUpperCase()}</Pill>
          </p>

          <div className="flex items-start gap-space-sm">
            <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-low">
              {report.listing.cover && (
                <Image src={report.listing.cover} alt="" fill sizes="64px" className="object-cover" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-label-md text-ink">{report.listing.title}</p>
              <p className="truncate text-body-sm text-muted">
                {report.listing.roadOrLandmark}, {report.listing.estate}
              </p>
              <p className="mt-space-2xs font-display text-price-listing text-ink">
                {formatKes(report.listing.rentKes)}{" "}
                <span className="text-body-sm font-normal text-muted">/ month</span>
              </p>
            </div>
          </div>

          <div className="mt-space-sm grid grid-cols-2 gap-space-xs">
            <Link href={`/listings/${report.listing.id}`} target="_blank">
              <Button size="sm" variant="secondary" className="w-full">
                <ExternalLink />
                Open listing
              </Button>
            </Link>
            <Link href={`/owners/${report.listing.owner.id}`} target="_blank">
              <Button size="sm" variant="secondary" className="w-full">
                Owner profile
              </Button>
            </Link>
          </div>
        </section>

        {/* Complainant */}
        <section className="rounded-xl border border-border p-space-md">
          <p className="mb-space-sm flex items-center justify-between gap-space-sm">
            <span className="text-caption uppercase tracking-wider text-muted">
              Complainant details
            </span>
            <Pill tone="success" className="text-caption">
              Verified tenant
            </Pill>
          </p>

          <div className="flex items-center gap-space-sm">
            <Avatar name={report.reporter.fullName} src={report.reporter.avatarUrl} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-label-md text-ink">{report.reporter.fullName}</span>
              <span className="block truncate text-body-sm text-muted">{report.reporter.email}</span>
            </span>
          </div>

          {report.details && (
            <blockquote className="mt-space-sm border-l-2 border-danger bg-danger-bg/40 px-space-sm py-space-xs text-body-sm italic text-ink">
              &ldquo;{report.details}&rdquo;
            </blockquote>
          )}
        </section>

        {/* Policy scan */}
        <section className="rounded-xl border border-border p-space-md">
          <p className="mb-space-sm text-caption uppercase tracking-wider text-muted">
            Automated policy scan
          </p>
          {report.severity === "CRITICAL" ? (
            <p className="flex items-start gap-space-sm rounded-lg bg-danger-bg p-space-sm text-body-sm text-danger">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                <strong>Zero-viewing-fee policy breach class.</strong> MoveApp strictly prohibits
                upfront viewing or gate-pass charges under Cap 296. Upholding this report should
                take the unit down.
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-space-sm rounded-lg bg-surface-low p-space-sm text-body-sm text-muted">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
              No automatic policy breach detected. Judge on the complainant&apos;s account and the
              owner&apos;s history.
            </p>
          )}

          <p className="mt-space-sm flex items-center justify-between gap-space-sm text-body-sm">
            <span className="text-muted">Owner</span>
            <span className="truncate text-ink">{report.listing.owner.businessName}</span>
          </p>
          <p className="flex items-center justify-between gap-space-sm text-body-sm">
            <span className="text-muted">Listing status</span>
            <span className="text-ink">{report.listing.status.replace("_", " ").toLowerCase()}</span>
          </p>
        </section>

        {/* Decision */}
        <section>
          <label htmlFor="resolution" className="mb-space-2xs block text-label-md text-ink">
            Resolution note
          </label>
          <textarea
            id="resolution"
            rows={3}
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="What did you find, and what action did you take? The tenant sees this."
            className="w-full rounded-lg border border-border bg-surface-low px-space-sm py-space-xs text-body-md focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
        </section>

        {closed && (
          <p className="flex items-center gap-space-xs rounded-lg bg-surface-low p-space-sm text-body-sm text-muted">
            <ReportStatusPill status={report.status} />
            Already closed — acting again will update the outcome.
          </p>
        )}
      </div>

      <footer className="grid gap-space-xs border-t border-border p-space-md">
        <ModerationButton id={report.id} action="TAKE_DOWN" resolution={resolution} variant="danger" icon={<EyeOff />}>
          Uphold &amp; take the listing down
        </ModerationButton>

        <div className="grid grid-cols-3 gap-space-xs">
          <ModerationButton id={report.id} action="UNDER_REVIEW" resolution={resolution} variant="secondary" icon={<Search />}>
            Investigate
          </ModerationButton>
          <ModerationButton id={report.id} action="RESOLVE" resolution={resolution} variant="whatsapp" icon={<CheckCircle2 />}>
            Resolve
          </ModerationButton>
          <ModerationButton id={report.id} action="DISMISS" resolution={resolution} variant="ghost" icon={<ThumbsDown />}>
            Dismiss
          </ModerationButton>
        </div>

        <p className="pt-space-2xs text-center text-caption text-muted">
          <SeverityPill severity={report.severity} /> severity • decisions are logged to the audit
          record
        </p>
      </footer>
    </aside>
  );
}

const ACTION_COPY: Record<ReportAction, { success: string; confirm?: string }> = {
  TAKE_DOWN: {
    success: "Report upheld. The listing is down and both sides have been notified.",
    confirm: "Take this listing down? It will disappear from tenant search immediately.",
  },
  UNDER_REVIEW: { success: "Escalated to the ops desk." },
  RESOLVE: { success: "Report resolved. The tenant has been told the outcome." },
  DISMISS: { success: "Report dismissed. The tenant has been told why." },
};

function ModerationButton({
  id,
  action,
  resolution,
  variant,
  icon,
  children,
}: {
  id: string;
  action: ReportAction;
  resolution: string;
  variant: "danger" | "secondary" | "whatsapp" | "ghost";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const copy = ACTION_COPY[action];

  return (
    <ActionForm
      action={async () => {
        const data = new FormData();
        data.set("resolution", resolution);
        await moderateReport(id, action, data);
      }}
      success={copy.success}
      confirm={copy.confirm}
    >
      <Button type="submit" size="sm" variant={variant} className="w-full">
        {icon}
        {children}
      </Button>
    </ActionForm>
  );
}
