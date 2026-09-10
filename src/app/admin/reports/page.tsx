import Link from "next/link";
import { Clock, Flag, ShieldCheck, TrendingUp } from "lucide-react";

import { ReportsQueue } from "./ReportsQueue";
import type { ReportDetail } from "./ReportDrawer";
import { AdminShell } from "@/components/admin/AdminShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { REPORT_STATUS_LABEL } from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import { formatCount } from "@/lib/format";
import { countReportsByStatus, findReports } from "@/lib/queries/reports";
import { db } from "@/lib/db";
import type { ReportStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reports moderation" };

const TABS: (ReportStatus | "ALL")[] = ["ALL", "OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"];

/** Screen 23. */
export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireRole("ADMIN");
  const requested = (await searchParams).status;
  const active = (TABS.includes(requested as ReportStatus) ? requested : "ALL") as ReportStatus | "ALL";

  const [page, counts, resolvedToday, viewingFeeFlags, closed] = await Promise.all([
    findReports({ status: active === "ALL" ? undefined : active, perPage: 40 }),
    countReportsByStatus(),
    db.report.count({
      where: { resolvedAt: { gte: new Date(Date.now() - 24 * 3600_000) } },
    }),
    db.report.count({
      where: { reason: "Illegal Viewing Fee Demanded", status: { in: ["OPEN", "UNDER_REVIEW"] } },
    }),
    db.report.findMany({
      where: { resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true, status: true },
    }),
  ]);

  // Average time to close, and the share upheld rather than dismissed.
  const hours = closed.length
    ? closed.reduce((sum, r) => sum + (r.resolvedAt!.getTime() - r.createdAt.getTime()) / 3600_000, 0) /
      closed.length
    : 0;
  const upheld = closed.filter((r) => r.status === "RESOLVED").length;
  const upheldRate = closed.length ? Math.round((upheld / closed.length) * 100) : 0;

  const totalListings = await db.listing.count();
  const flagged = await db.listing.count({
    where: { reports: { some: { status: { in: ["OPEN", "UNDER_REVIEW"] } } } },
  });
  const trustScore = totalListings
    ? Math.round((1 - flagged / totalListings) * 1000) / 10
    : 100;

  const reports: ReportDetail[] = page.reports.map((report) => ({
    id: report.id,
    reason: report.reason,
    details: report.details,
    severity: report.severity,
    status: report.status,
    resolution: report.resolution,
    createdAt: report.createdAt,
    reporter: {
      fullName: report.reporter.fullName,
      email: report.reporter.email,
      avatarUrl: report.reporter.avatarUrl,
    },
    listing: {
      id: report.listing.id,
      title: report.listing.title,
      estate: report.listing.estate,
      roadOrLandmark: report.listing.roadOrLandmark,
      rentKes: report.listing.rentKes,
      status: report.listing.status,
      cover: report.listing.images[0]?.url ?? null,
      owner: {
        id: report.listing.owner.id,
        fullName: report.listing.owner.fullName,
        businessName: report.listing.owner.ownerProfile?.businessName ?? report.listing.owner.fullName,
      },
    },
  }));

  const stats = [
    {
      label: "Average time to close",
      value: hours >= 1 ? `${hours.toFixed(1)}h` : `${Math.round(hours * 60)}m`,
      note: "Target SLA under 24h",
      icon: <Clock />,
      tone: "text-ink",
    },
    {
      label: "Viewing fee scams",
      value: formatCount(viewingFeeFlags),
      note: "Open Cap 296 breaches",
      icon: <Flag />,
      tone: viewingFeeFlags > 0 ? "text-danger" : "text-ink",
    },
    {
      label: "Resolved in 24h",
      value: formatCount(resolvedToday),
      note: `${upheldRate}% upheld`,
      icon: <TrendingUp />,
      tone: "text-ink",
    },
    {
      label: "Nairobi trust score",
      value: `${trustScore}%`,
      note: "Listings with no open report",
      icon: <ShieldCheck />,
      tone: "text-success",
    },
  ];

  return (
    <AdminShell user={user} current="reports" title="Reports">
      <div className="space-y-space-lg">
        <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-surface p-space-lg">
              <p className="flex items-center justify-between gap-space-sm">
                <span className="text-caption uppercase tracking-wider text-muted">{stat.label}</span>
                <span className="text-muted [&_svg]:size-4">{stat.icon}</span>
              </p>
              <p className={`mt-space-xs font-display text-[40px] font-bold leading-none ${stat.tone}`}>
                {stat.value}
              </p>
              <p className="mt-space-2xs text-body-sm text-muted">{stat.note}</p>
            </div>
          ))}
        </div>

        <header className="flex flex-wrap items-start justify-between gap-space-md rounded-xl border border-border bg-surface p-space-lg">
          <div className="max-w-2xl">
            <p className="flex flex-wrap items-center gap-space-xs">
              <Pill tone="danger">High priority queue</Pill>
              <span className="text-body-sm text-muted">Nairobi metropolitan region</span>
            </p>
            <h1 className="mt-space-xs text-headline-lg-mobile md:text-headline-lg">
              Reports moderation &amp; tenant safety
            </h1>
            <p className="mt-space-2xs text-body-md text-muted">
              Review flagged listings, viewing-fee extortion, phantom agents, and tenancy compliance
              reports across Nairobi.
            </p>
          </div>
          {counts.OPEN > 0 && (
            <Pill tone="danger" dot>
              {counts.OPEN} awaiting a first decision
            </Pill>
          )}
        </header>

        <div className="flex flex-wrap gap-space-xs">
          {TABS.map((tab) => (
            <Link key={tab} href={tab === "ALL" ? "/admin/reports" : `/admin/reports?status=${tab}`}>
              <Pill tone={tab === active ? "brand" : "neutral"}>
                {tab === "ALL" ? "All" : REPORT_STATUS_LABEL[tab]} (
                {tab === "ALL" ? counts.all : counts[tab]})
              </Pill>
            </Link>
          ))}
        </div>

        {reports.length === 0 ? (
          <EmptyState
            title="Nothing in this queue"
            description="No reports match this filter right now."
          />
        ) : (
          <ReportsQueue reports={reports} />
        )}
      </div>
    </AdminShell>
  );
}
