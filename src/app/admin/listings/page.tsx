import Link from "next/link";
import { AlertTriangle, BadgeCheck, Building2, EyeOff, Hourglass, Scale } from "lucide-react";

import { ListingsTable, type AdminListingRow } from "./ListingsTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { LISTING_STATUS_LABEL } from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import { formatCount } from "@/lib/format";
import { db } from "@/lib/db";
import type { ListingStatus, ReportStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Listings moderation" };

/** A report still needing attention. Shared by the filter and the counts. */
const OPEN_STATES: ReportStatus[] = ["OPEN", "UNDER_REVIEW"];

const TABS: (ListingStatus | "ALL" | "REPORTED")[] = [
  "ALL",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REPORTED",
  "RENTED_OUT",
  "REJECTED",
];

/** Screen 21. */
export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await requireRole("ADMIN");
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const active = (TABS.includes(params.status as ListingStatus) ? params.status : "ALL") as
    | ListingStatus
    | "ALL"
    | "REPORTED";

  const where = {
    ...(active === "ALL" || active === "REPORTED" ? {} : { status: active }),
    ...(active === "REPORTED"
      ? { reports: { some: { status: { in: OPEN_STATES } } } }
      : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { estate: { contains: query } },
            { roadOrLandmark: { contains: query } },
          ],
        }
      : {}),
  };

  const [rows, counts, reportedCount, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 40,
      select: {
        id: true,
        title: true,
        rentKes: true,
        depositMonths: true,
        estate: true,
        roadOrLandmark: true,
        bedrooms: true,
        bathrooms: true,
        status: true,
        images: { where: { isCover: true }, take: 1, select: { url: true } },
        owner: {
          select: {
            id: true,
            fullName: true,
            ownerProfile: {
              select: { businessName: true, verification: { select: { state: true } } },
            },
          },
        },
        _count: { select: { reports: true } },
        reports: {
          where: { status: { in: OPEN_STATES } },
          select: { id: true },
        },
      },
    }),
    db.listing.groupBy({ by: ["status"], _count: { _all: true } }),
    db.listing.count({ where: { reports: { some: { status: { in: OPEN_STATES } } } } }),
    db.listing.count(),
  ]);

  const countBy = new Map(counts.map((c) => [c.status, c._count._all]));
  const published = countBy.get("PUBLISHED") ?? 0;
  const underReview = countBy.get("PENDING_REVIEW") ?? 0;
  const suspended = countBy.get("REJECTED") ?? 0;

  const listings: AdminListingRow[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    rentKes: row.rentKes,
    depositMonths: row.depositMonths,
    estate: row.estate,
    roadOrLandmark: row.roadOrLandmark,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    status: row.status,
    openReports: row.reports.length,
    cover: row.images[0]?.url ?? null,
    owner: {
      id: row.owner.id,
      fullName: row.owner.fullName,
      businessName: row.owner.ownerProfile?.businessName ?? "—",
      verified: row.owner.ownerProfile?.verification?.state === "APPROVED",
    },
  }));

  const summary = [
    { label: "Total inventory", value: total, tone: "ink", icon: <Building2 />, of: total },
    { label: "Published & live", value: published, tone: "success", icon: <BadgeCheck />, of: total },
    { label: "Under review", value: underReview, tone: "warning", icon: <Hourglass />, of: total },
    { label: "Suspended / flagged", value: suspended, tone: "danger", icon: <EyeOff />, of: total },
  ] as const;

  return (
    <AdminShell user={user} current="listings" title="Listings Management">
      <div className="space-y-space-lg">
        <header>
          <p className="flex items-center gap-space-2xs text-label-sm uppercase tracking-wider text-success">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            Metropolitan real-time ledger
          </p>
          <h1 className="mt-space-2xs text-headline-lg-mobile md:text-headline-lg">
            Listings directory &amp; moderation
          </h1>
          <p className="mt-space-2xs text-body-md text-muted">
            Monitor, audit, and moderate verified rental units across Nairobi metropolitan.
            Publishing a listing is an admin action — owners cannot do it themselves.
          </p>
        </header>

        <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((card) => {
            const percent = card.of ? Math.round((card.value / card.of) * 100) : 0;
            const bar = {
              ink: "bg-ink",
              success: "bg-success",
              warning: "bg-warning",
              danger: "bg-danger",
            }[card.tone];
            return (
              <div key={card.label} className="rounded-xl border border-border bg-surface p-space-lg">
                <p className="flex items-center justify-between gap-space-sm">
                  <span className="text-caption uppercase tracking-wider text-muted">{card.label}</span>
                  <span className="text-muted [&_svg]:size-4">{card.icon}</span>
                </p>
                <p className="mt-space-xs font-display text-[40px] font-bold leading-none text-ink">
                  {formatCount(card.value)}
                </p>
                <p className="mt-space-2xs text-body-sm text-muted">{percent}% of inventory</p>
                <div className="mt-space-sm h-1.5 overflow-hidden rounded-full bg-surface-low">
                  <div className={`h-full ${bar}`} style={{ width: `${Math.max(percent, 2)}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <form action="/admin/listings" className="flex flex-wrap items-center gap-space-sm">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search listing title, estate, or road…"
            aria-label="Search listings"
            className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-space-sm text-body-md placeholder:text-muted-subtle focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
          {active !== "ALL" && <input type="hidden" name="status" value={active} />}
          <button
            type="submit"
            className="h-10 rounded-lg border border-border bg-surface px-space-md text-label-md text-ink transition-colors hover:bg-surface-low"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-space-xs">
          {TABS.map((tab) => {
            const count =
              tab === "ALL"
                ? total
                : tab === "REPORTED"
                  ? reportedCount
                  : (countBy.get(tab as ListingStatus) ?? 0);
            const label =
              tab === "ALL" ? "All" : tab === "REPORTED" ? "Has open reports" : LISTING_STATUS_LABEL[tab];
            return (
              <Link
                key={tab}
                href={tab === "ALL" ? "/admin/listings" : `/admin/listings?status=${tab}`}
              >
                <Pill tone={tab === active ? "brand" : tab === "REPORTED" ? "danger" : "neutral"}>
                  {label} ({count})
                </Pill>
              </Link>
            );
          })}
        </div>

        {listings.length === 0 ? (
          <EmptyState
            title={query ? `Nothing matches “${query}”` : "No listings in this view"}
            description="Adjust the filters or clear the search."
          />
        ) : (
          <ListingsTable listings={listings} />
        )}

        <p className="flex items-start gap-space-sm rounded-xl bg-surface p-space-lg text-body-sm text-muted">
          <Scale className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
          <span>
            <strong className="text-ink">Rent Restriction Act (Cap 296) compliance.</strong> Any
            listing reported for unauthorised viewing fees, landlord impersonation, or deposit
            disputes is subject to immediate suspension. Review the tenancy tribunal guidelines
            before overriding a restriction flag.
          </span>
        </p>

        {rows.length === 40 && (
          <p className="flex items-center gap-space-2xs text-body-sm text-muted">
            <AlertTriangle className="size-4" aria-hidden />
            Showing the first 40 rows. Narrow the search to see more.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
