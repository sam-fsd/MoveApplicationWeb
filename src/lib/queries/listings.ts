import type { HouseType, ListingStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Every filter on screen 04 is a URL search param, so this shape is built
 * straight from `searchParams` and is safe to serialise back into a link.
 */
export interface ListingFilters {
  estate?: string;
  query?: string;
  minRent?: number;
  maxRent?: number;
  /** Bedroom counts; 0 means bedsitter/studio. 4 matches "4+ Beds". */
  bedrooms?: number[];
  houseTypes?: HouseType[];
  amenities?: string[];
  furnished?: boolean;
  sort?: ListingSort;
  page?: number;
  perPage?: number;
}

export type ListingSort = "newest" | "price-asc" | "price-desc" | "popular";

const SORTS: Record<ListingSort, Prisma.ListingOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }],
  "price-asc": [{ rentKes: "asc" }, { createdAt: "desc" }],
  "price-desc": [{ rentKes: "desc" }, { createdAt: "desc" }],
  popular: [{ viewCount: "desc" }, { createdAt: "desc" }],
};

export const DEFAULT_PER_PAGE = 6;

/** The card shape. Six later screens render this, so it is selected once here. */
export const listingCardSelect = {
  id: true,
  title: true,
  rentKes: true,
  depositMonths: true,
  serviceCharge: true,
  estate: true,
  roadOrLandmark: true,
  houseType: true,
  bedrooms: true,
  bathrooms: true,
  furnished: true,
  parkingSpaces: true,
  floorAreaSqft: true,
  highlight: true,
  status: true,
  viewCount: true,
  createdAt: true,
  images: {
    where: { isCover: true },
    take: 1,
    select: { url: true },
  },
  amenities: { take: 1, select: { label: true } },
  owner: {
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      ownerProfile: {
        select: { businessName: true, kind: true, badgeLabel: true },
      },
    },
  },
} satisfies Prisma.ListingSelect;

export type ListingCardData = Prisma.ListingGetPayload<{ select: typeof listingCardSelect }>;

export interface ListingPage {
  listings: ListingCardData[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

/**
 * Only PUBLISHED listings are ever visible to tenants — a listing pulled for a
 * report, or still in review, must disappear from search entirely.
 */
export function buildListingWhere(filters: ListingFilters): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: "PUBLISHED" };
  const and: Prisma.ListingWhereInput[] = [];

  if (filters.estate) where.estate = filters.estate;
  if (filters.furnished !== undefined) where.furnished = filters.furnished;

  if (filters.minRent !== undefined || filters.maxRent !== undefined) {
    where.rentKes = {
      ...(filters.minRent !== undefined ? { gte: filters.minRent } : {}),
      ...(filters.maxRent !== undefined ? { lte: filters.maxRent } : {}),
    };
  }

  if (filters.houseTypes?.length) where.houseType = { in: filters.houseTypes };

  if (filters.bedrooms?.length) {
    // "4+ Beds" is the top option on screen 04, so 4 means four or more.
    const exact = filters.bedrooms.filter((b) => b < 4);
    const openEnded = filters.bedrooms.some((b) => b >= 4);
    and.push({
      OR: [
        ...(exact.length ? [{ bedrooms: { in: exact } }] : []),
        ...(openEnded ? [{ bedrooms: { gte: 4 } }] : []),
      ],
    });
  }

  if (filters.query) {
    const contains = filters.query;
    and.push({
      OR: [
        { title: { contains } },
        { estate: { contains } },
        { roadOrLandmark: { contains } },
      ],
    });
  }

  // Every named amenity must be present, not just one of them.
  for (const label of filters.amenities ?? []) {
    and.push({ amenities: { some: { label } } });
  }

  if (and.length) where.AND = and;
  return where;
}

export async function findListings(filters: ListingFilters = {}): Promise<ListingPage> {
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;
  const where = buildListingWhere(filters);

  const total = await db.listing.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / perPage));

  // Clamp rather than return an empty page: ?page=99 on a 5-page result should
  // land on page 5, not on an empty state that blames the filters.
  const page = Math.min(Math.max(1, filters.page ?? 1), pageCount);

  const listings = await db.listing.findMany({
    where,
    select: listingCardSelect,
    orderBy: SORTS[filters.sort ?? "newest"],
    skip: (page - 1) * perPage,
    take: perPage,
  });

  return { listings, total, page, perPage, pageCount };
}

/** Facet counts for the filter sidebar, computed against the same filters. */
export async function countListingsByHouseType(
  filters: ListingFilters = {},
): Promise<Record<string, number>> {
  const rows = await db.listing.groupBy({
    by: ["houseType"],
    where: buildListingWhere({ ...filters, houseTypes: undefined }),
    _count: { _all: true },
  });

  return Object.fromEntries(rows.map((r) => [r.houseType, r._count._all]));
}

export async function getListingById(id: string) {
  return db.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      amenities: true,
      owner: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          avatarUrl: true,
          ownerProfile: {
            select: {
              businessName: true,
              kind: true,
              about: true,
              badgeLabel: true,
              memberSince: true,
              primaryEstate: true,
              verification: { select: { state: true, certificateNumber: true } },
            },
          },
        },
      },
      _count: { select: { images: true } },
    },
  });
}

/** "Similar houses in Westlands" on screen 06 — same estate, never itself. */
export async function findSimilarListings(listingId: string, estate: string, take = 3) {
  return db.listing.findMany({
    where: { status: "PUBLISHED", estate, id: { not: listingId } },
    select: listingCardSelect,
    orderBy: { viewCount: "desc" },
    take,
  });
}

/** The owner dashboard table on screen 15, filtered by its status tabs. */
export async function findListingsByOwner(ownerId: string, status?: ListingStatus) {
  return db.listing.findMany({
    where: { ownerId, ...(status ? { status } : {}) },
    select: listingCardSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function countListingsByStatus(ownerId: string) {
  const rows = await db.listing.groupBy({
    by: ["status"],
    where: { ownerId },
    _count: { _all: true },
  });

  const counts: Record<ListingStatus, number> = {
    PENDING_REVIEW: 0,
    PUBLISHED: 0,
    RENTED_OUT: 0,
    REJECTED: 0,
  };
  for (const row of rows) counts[row.status] = row._count._all;
  return { ...counts, all: rows.reduce((sum, r) => sum + r._count._all, 0) };
}

/** Daily view series for the sparklines and the chart on screen 19. */
export async function getListingViewSeries(listingId: string, days = 30) {
  const since = new Date(Date.now() - days * 86400_000);
  const rows = await db.listingViewDaily.findMany({
    where: { listingId, date: { gte: since } },
    orderBy: { date: "asc" },
    select: { date: true, views: true },
  });
  return rows;
}

export async function getOwnerViewSeries(ownerId: string, days = 30) {
  const since = new Date(Date.now() - days * 86400_000);
  const rows = await db.listingViewDaily.groupBy({
    by: ["date"],
    where: { listing: { ownerId }, date: { gte: since } },
    _sum: { views: true },
    orderBy: { date: "asc" },
  });
  return rows.map((r) => ({ date: r.date, views: r._sum.views ?? 0 }));
}
