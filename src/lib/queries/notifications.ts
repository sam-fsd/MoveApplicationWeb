import { db } from "@/lib/db";

/** The dropdown on screen 11 — newest first, unread marked with a dot. */
export async function findNotifications(userId: string, take = 12) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function countUnreadNotifications(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}

/** Saved listings on screen 09; the empty state on screen 10 is the zero case. */
export async function findSavedListings(userId: string) {
  return db.savedListing.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          rentKes: true,
          depositMonths: true,
          estate: true,
          roadOrLandmark: true,
          houseType: true,
          bedrooms: true,
          bathrooms: true,
          status: true,
          highlight: true,
          images: { where: { isCover: true }, take: 1, select: { url: true } },
          owner: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              ownerProfile: { select: { businessName: true, kind: true, badgeLabel: true } },
            },
          },
        },
      },
    },
  });
}

export async function findPriceAlerts(userId: string) {
  return db.priceAlert.findMany({ where: { userId }, orderBy: { label: "asc" } });
}

/** Ids only — the heart on a card needs a cheap "is this saved" lookup. */
export async function getSavedListingIds(userId: string): Promise<Set<string>> {
  const rows = await db.savedListing.findMany({
    where: { userId },
    select: { listingId: true },
  });
  return new Set(rows.map((r) => r.listingId));
}

/** Recent enquiries on the owner dashboard, screen 15. */
export async function findEnquiriesForOwner(ownerId: string, take = 10) {
  return db.enquiry.findMany({
    where: { listing: { ownerId } },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      tenant: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
      listing: { select: { id: true, title: true } },
    },
  });
}

export async function findEnquiriesForListing(listingId: string) {
  return db.enquiry.findMany({
    where: { listingId },
    orderBy: { createdAt: "desc" },
    include: { tenant: { select: { id: true, fullName: true, phone: true, avatarUrl: true } } },
  });
}
