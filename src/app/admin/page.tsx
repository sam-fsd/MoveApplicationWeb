import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Building2, Clock, Flag, Hourglass, TrendingUp, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { WeeklyChart } from "@/components/admin/WeeklyChart";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { StatCard } from "@/components/ui/StatCard";
import { SeverityPill } from "@/components/ui/StatusPill";
import { requireRole } from "@/lib/auth";
import { formatCount, formatRelative, formatSubmittedAt } from "@/lib/format";
import { findPendingVerifications, getAdminStats, getPlatformWeekly } from "@/lib/queries/owners";
import { findReports } from "@/lib/queries/reports";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Operations overview" };

/** Screen 20. */
export default async function AdminOverviewPage() {
  const user = await requireRole("ADMIN");

  const [stats, pending, reports, weekly, turnaround] = await Promise.all([
    getAdminStats(),
    findPendingVerifications(4),
    findReports({ perPage: 4 }),
    getPlatformWeekly(12),
    db.verification.findMany({
      where: { state: "APPROVED", submittedAt: { not: null }, reviewedAt: { not: null } },
      select: { submittedAt: true, reviewedAt: true },
    }),
  ]);

  // Average verification turnaround, derived rather than asserted.
  const hours = turnaround.length
    ? turnaround.reduce(
        (sum, v) => sum + (v.reviewedAt!.getTime() - v.submittedAt!.getTime()) / 3600_000,
        0,
      ) / turnaround.length
    : 0;
  const withinSla = turnaround.filter(
    (v) => (v.reviewedAt!.getTime() - v.submittedAt!.getTime()) / 3600_000 <= 24,
  ).length;
  const slaRate = turnaround.length ? Math.round((withinSla / turnaround.length) * 1000) / 10 : 100;

  const chartData = weekly.map((week, index) => ({
    week: `W${index + 1}`,
    published: week.published,
    inReview: week.inReview,
    rejected: week.rejected,
  }));

  return (
    <AdminShell user={user} current="overview" title="Overview">
      <div className="space-y-space-lg">
        <header className="flex flex-wrap items-start justify-between gap-space-md">
          <div>
            <h1 className="flex flex-wrap items-center gap-space-sm text-headline-xl-mobile md:text-headline-xl">
              Operations overview
              <Pill tone="success" dot>
                System live • Nairobi vetting desk active
              </Pill>
            </h1>
            <p className="mt-space-2xs max-w-2xl text-body-md text-muted">
              Real-time tenancy compliance, landlord credentials audit, listing verification, and
              tenant fraud protection across Nairobi metro.
            </p>
          </div>
        </header>

        <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard label="Total Tenants" value={formatCount(stats.tenants)} icon={<Users />} trend="Registered renters" caption="Across Nairobi metro" />
          <StatCard
            label="Total Owners"
            value={formatCount(stats.owners)}
            icon={<Building2 />}
            trend={`${stats.verifiedOwners} verified`}
            caption={`${Math.round((stats.verifiedOwners / Math.max(stats.owners, 1)) * 100)}% of accounts`}
          />
          <StatCard
            label="Pending Audit"
            value={formatCount(stats.pendingAudit)}
            badge={stats.pendingAudit > 0 ? <Pill tone="warning">Needs action</Pill> : undefined}
            icon={<Hourglass />}
            trend={stats.pendingAudit > 0 ? "Awaiting a decision" : "Queue clear"}
            trendTone={stats.pendingAudit > 0 ? "warning" : "success"}
            caption="24h target SLA"
            active
          />
          <StatCard
            label="Active Listings"
            value={formatCount(stats.activeListings)}
            icon={<BadgeCheck />}
            trend="Published & live"
            caption="Zero viewing-fee policy"
          />
          <StatCard
            label="Open Reports"
            value={formatCount(stats.openReports)}
            badge={stats.criticalReports > 0 ? <Pill tone="danger">Escalated</Pill> : undefined}
            icon={<Flag />}
            trend={`${stats.criticalReports} critical`}
            trendTone={stats.criticalReports > 0 ? "danger" : "success"}
            caption="High-severity priority"
          />
          <StatCard
            label="New This Week"
            value={formatCount(stats.newThisWeek)}
            icon={<TrendingUp />}
            trend="Listings submitted"
            caption="Last 7 days"
          />
        </div>

        <div className="grid gap-space-lg xl:grid-cols-2">
          {/* Pending verifications */}
          <section className="flex flex-col rounded-xl border border-border bg-surface">
            <header className="flex flex-wrap items-center justify-between gap-space-sm p-space-lg pb-space-sm">
              <h2 className="flex items-center gap-space-xs text-headline-sm">
                Pending owner verifications
                {stats.pendingAudit > 0 && <Pill tone="warning">{stats.pendingAudit} pending</Pill>}
              </h2>
              <Link
                href="/admin/verifications"
                className="flex items-center gap-space-2xs text-label-md text-ink hover:text-brand-strong"
              >
                View all
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </header>

            {pending.length === 0 ? (
              <p className="px-space-lg pb-space-xl text-body-md text-muted">
                Queue is clear — every owner has a decision on file.
              </p>
            ) : (
              <ul className="flex-1 divide-y divide-border">
                {pending.map((verification) => (
                  <li
                    key={verification.id}
                    className="flex flex-wrap items-start gap-space-sm px-space-lg py-space-md"
                  >
                    <Avatar
                      name={verification.ownerProfile.user.fullName}
                      src={verification.ownerProfile.user.avatarUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-space-xs">
                        <span className="text-label-md text-ink">
                          {verification.ownerProfile.user.fullName}
                        </span>
                        <Pill>{verification.ownerProfile.kind === "AGENT" ? "Agency" : "Landlord"}</Pill>
                      </p>
                      <p className="mt-space-2xs text-body-sm text-muted">
                        {verification.ownerProfile.businessName} •{" "}
                        {verification.ownerProfile.primaryEstate} •{" "}
                        {verification.submittedAt && formatSubmittedAt(verification.submittedAt)}
                      </p>
                      <p className="mt-space-xs flex flex-wrap gap-space-2xs">
                        {verification.documents.map((doc) => (
                          <Pill key={doc.label} className="text-caption">
                            {doc.label}
                          </Pill>
                        ))}
                      </p>
                    </div>
                    <Link href={`/admin/verifications/${verification.id}`}>
                      <Button size="sm">Review</Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-space-sm border-t border-border px-space-lg py-space-sm text-body-sm text-muted">
              <span className="flex items-center gap-space-2xs">
                <Clock className="size-4" aria-hidden />
                Average turnaround: <strong className="text-ink">{hours.toFixed(1)} hours</strong>{" "}
                (target SLA 24h)
              </span>
              <span className="text-success">{slaRate}% in SLA</span>
            </footer>
          </section>

          {/* Recent reports */}
          <section className="flex flex-col rounded-xl border border-border bg-surface">
            <header className="flex flex-wrap items-center justify-between gap-space-sm p-space-lg pb-space-sm">
              <h2 className="flex items-center gap-space-xs text-headline-sm">
                Recent reports
                {stats.openReports > 0 && (
                  <span className="size-2 rounded-full bg-danger" aria-hidden />
                )}
              </h2>
              <Link
                href="/admin/reports"
                className="flex items-center gap-space-2xs text-label-md text-ink hover:text-brand-strong"
              >
                Reports queue
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </header>

            <ul className="flex-1 divide-y divide-border">
              {reports.reports.map((report) => (
                <li key={report.id} className="flex items-start gap-space-sm px-space-lg py-space-md">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-low">
                    {report.listing.images[0] && (
                      <Image src={report.listing.images[0].url} alt="" fill sizes="48px" className="object-cover" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Pill tone={report.severity === "CRITICAL" ? "danger" : "warning"} className="text-caption">
                      {report.reason}
                    </Pill>
                    <p className="mt-space-2xs truncate text-label-md text-ink">{report.listing.title}</p>
                    <p className="text-body-sm text-muted">Reported by {report.reporter.fullName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-body-sm text-muted">{formatRelative(report.createdAt)}</p>
                    <SeverityPill severity={report.severity} />
                  </div>
                </li>
              ))}
            </ul>

            <footer className="flex flex-wrap items-center justify-between gap-space-sm border-t border-border px-space-lg py-space-sm text-body-sm text-muted">
              <span>
                Critical open reports:{" "}
                <strong className={stats.criticalReports > 0 ? "text-danger" : "text-ink"}>
                  {stats.criticalReports}
                </strong>
              </span>
              <Link href="/admin/reports?status=OPEN" className="text-ink hover:underline">
                Manage queue
              </Link>
            </footer>
          </section>
        </div>

        <WeeklyChart data={chartData} />
      </div>
    </AdminShell>
  );
}
