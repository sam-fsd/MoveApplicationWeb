import type { ReportSeverity, ReportStatus } from "@prisma/client";
import { db } from "@/lib/db";

export interface ReportFilters {
  status?: ReportStatus;
  severity?: ReportSeverity;
  page?: number;
  perPage?: number;
}

export const REPORTS_PER_PAGE = 10;

/** Queue order: needs-action first, then most severe, then newest. */
const STATUS_RANK: Record<ReportStatus, number> = {
  OPEN: 0,
  UNDER_REVIEW: 1,
  RESOLVED: 2,
  DISMISSED: 3,
};

const SEVERITY_RANK: Record<ReportSeverity, number> = {
  LOW: 0,
  MODERATE: 1,
  CRITICAL: 2,
};

/** The moderation queue on screen 23 and the Recent Reports panel on screen 20. */
export async function findReports(filters: ReportFilters = {}) {
  const perPage = filters.perPage ?? REPORTS_PER_PAGE;
  const page = Math.max(1, filters.page ?? 1);
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.severity ? { severity: filters.severity } : {}),
  };

  const [total, rows] = await Promise.all([
    db.report.count({ where }),
    db.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { id: true, fullName: true, avatarUrl: true } },
        listing: {
          select: {
            id: true,
            title: true,
            estate: true,
            status: true,
            images: { where: { isCover: true }, take: 1, select: { url: true } },
            owner: { select: { id: true, fullName: true } },
          },
        },
      },
    }),
  ]);

  // Ordered and paginated in memory. SQLite stores enums as text, so Prisma's
  // orderBy sorts them alphabetically — DISMISSED would outrank OPEN, and
  // MODERATE would outrank CRITICAL. A work queue needs the opposite, and the
  // report table is small enough that ranking here is cheaper than a raw query.
  const reports = rows
    .sort(
      (a, b) =>
        STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
        SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
        b.createdAt.getTime() - a.createdAt.getTime(),
    )
    .slice((page - 1) * perPage, page * perPage);

  return { reports, total, page, perPage, pageCount: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getReportById(id: string) {
  return db.report.findUnique({
    where: { id },
    include: {
      reporter: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      listing: {
        select: {
          id: true,
          title: true,
          estate: true,
          roadOrLandmark: true,
          rentKes: true,
          status: true,
          images: { where: { isCover: true }, take: 1, select: { url: true } },
          owner: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              ownerProfile: { select: { businessName: true, kind: true, badgeLabel: true } },
            },
          },
        },
      },
    },
  });
}

/** Counts for the status tabs on screen 23. */
export async function countReportsByStatus() {
  const rows = await db.report.groupBy({ by: ["status"], _count: { _all: true } });

  const counts: Record<ReportStatus, number> = {
    OPEN: 0,
    UNDER_REVIEW: 0,
    RESOLVED: 0,
    DISMISSED: 0,
  };
  for (const row of rows) counts[row.status] = row._count._all;
  return { ...counts, all: rows.reduce((sum, r) => sum + r._count._all, 0) };
}

export async function countReportsForListing(listingId: string) {
  return db.report.count({
    where: { listingId, status: { in: ["OPEN", "UNDER_REVIEW"] } },
  });
}
