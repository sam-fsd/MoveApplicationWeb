import { db } from "@/lib/db";

/** The public owner profile on screen 13. */
export async function getOwnerProfile(userId: string) {
  const owner = await db.user.findFirst({
    where: { id: userId, role: "OWNER" },
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      phone: true,
      createdAt: true,
      ownerProfile: {
        select: {
          businessName: true,
          kind: true,
          about: true,
          primaryEstate: true,
          badgeLabel: true,
          memberSince: true,
          verification: {
            select: {
              state: true,
              certificateNumber: true,
              reviewedAt: true,
              nationalIdOk: true,
              kraPinOk: true,
              titleDeedOk: true,
              inspectionOk: true,
              feePledgeOk: true,
            },
          },
        },
      },
    },
  });

  if (!owner?.ownerProfile) return null;

  const [activeListings, totalViews] = await Promise.all([
    db.listing.count({ where: { ownerId: userId, status: "PUBLISHED" } }),
    db.listing.aggregate({ where: { ownerId: userId }, _sum: { viewCount: true } }),
  ]);

  return { ...owner, activeListings, totalViews: totalViews._sum.viewCount ?? 0 };
}

export async function getOwnerVerification(ownerProfileId: string) {
  return db.verification.findUnique({
    where: { ownerProfileId },
    include: { documents: { orderBy: { uploadedAt: "asc" } } },
  });
}

/** The Pending Owner Verifications panel on screen 20, oldest submission first. */
export async function findPendingVerifications(take?: number) {
  return db.verification.findMany({
    where: { state: "PENDING" },
    orderBy: { submittedAt: "asc" },
    take,
    include: {
      documents: { select: { label: true } },
      ownerProfile: {
        select: {
          id: true,
          businessName: true,
          kind: true,
          primaryEstate: true,
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      },
    },
  });
}

export async function getVerificationById(id: string) {
  return db.verification.findUnique({
    where: { id },
    include: {
      documents: { orderBy: { uploadedAt: "asc" } },
      ownerProfile: {
        select: {
          id: true,
          businessName: true,
          kind: true,
          about: true,
          primaryEstate: true,
          memberSince: true,
          user: {
            select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true },
          },
        },
      },
    },
  });
}

/** Stat-card numbers for the owner dashboard on screen 15. */
export async function getOwnerStats(ownerId: string) {
  const monthStart = new Date(Date.now() - 30 * 86400_000);

  const [registered, active, viewsThisMonth, enquiries, unreadEnquiries, saves] = await Promise.all([
    db.listing.count({ where: { ownerId } }),
    db.listing.count({ where: { ownerId, status: "PUBLISHED" } }),
    db.listingViewDaily.aggregate({
      where: { listing: { ownerId }, date: { gte: monthStart } },
      _sum: { views: true },
    }),
    db.enquiry.count({ where: { listing: { ownerId } } }),
    db.enquiry.count({ where: { listing: { ownerId }, readAt: null } }),
    db.savedListing.count({ where: { listing: { ownerId } } }),
  ]);

  return {
    registered,
    active,
    viewsThisMonth: viewsThisMonth._sum.views ?? 0,
    enquiries,
    unreadEnquiries,
    saves,
  };
}

/** The six stat cards on screen 20. */
export async function getAdminStats() {
  const weekStart = new Date(Date.now() - 7 * 86400_000);

  const [tenants, owners, verifiedOwners, pendingAudit, activeListings, openReports, criticalReports, newThisWeek] =
    await Promise.all([
      db.user.count({ where: { role: "TENANT" } }),
      db.user.count({ where: { role: "OWNER" } }),
      db.verification.count({ where: { state: "APPROVED" } }),
      db.verification.count({ where: { state: "PENDING" } }),
      db.listing.count({ where: { status: "PUBLISHED" } }),
      db.report.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
      db.report.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] }, severity: "CRITICAL" } }),
      db.listing.count({ where: { createdAt: { gte: weekStart } } }),
    ]);

  return {
    tenants,
    owners,
    verifiedOwners,
    pendingAudit,
    activeListings,
    openReports,
    criticalReports,
    newThisWeek,
  };
}

/** The 12-week stacked bar on screen 20. Seeded aggregates, not derived. */
export async function getPlatformWeekly(weeks = 12) {
  const rows = await db.platformWeekly.findMany({ orderBy: { weekStart: "desc" }, take: weeks });
  return rows.reverse();
}
