import { PrismaClient, type HouseType, type Prisma } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import {
  ADMIN,
  APPROVED_OWNERS,
  DEMO_PASSWORD,
  ENQUIRIES,
  LISTINGS,
  LISTING_PHOTOS,
  PENDING_OWNERS,
  REPORTS,
  TENANTS,
  type OwnerSeed,
} from "./seed-data";

const db = new PrismaClient();

/**
 * Deterministic PRNG (mulberry32). Reseeding must produce byte-identical data
 * so screenshots and the demo script stay valid between runs.
 */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = rng(20260910);

const HOUR = 3600_000;
const DAY = 24 * HOUR;

/** Fixed clock so relative timestamps stay stable within a run. */
const NOW = new Date();

const hoursAgo = (h: number) => new Date(NOW.getTime() - h * HOUR);
const daysAgo = (d: number) => new Date(NOW.getTime() - d * DAY);

function midnightUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

async function clear() {
  // Child rows first; SQLite will not cascade through every path on its own.
  await db.notification.deleteMany();
  await db.report.deleteMany();
  await db.enquiry.deleteMany();
  await db.priceAlert.deleteMany();
  await db.savedListing.deleteMany();
  await db.listingViewDaily.deleteMany();
  await db.listingAmenity.deleteMany();
  await db.listingImage.deleteMany();
  await db.listing.deleteMany();
  await db.verificationDocument.deleteMany();
  await db.verification.deleteMany();
  await db.ownerProfile.deleteMany();
  await db.tenantProfile.deleteMany();
  await db.platformWeekly.deleteMany();
  await db.user.deleteMany();
}

async function createOwner(seed: OwnerSeed, passwordHash: string, approved: boolean, adminId: string) {
  const submittedAt = approved
    ? daysAgo(randomInt(120, 400))
    : hoursAgo(seed.submittedHoursAgo ?? 12);

  return db.user.create({
    data: {
      role: "OWNER",
      fullName: seed.fullName,
      email: seed.email,
      phone: seed.phone,
      passwordHash,
      avatarUrl: seed.avatarUrl,
      createdAt: new Date(seed.memberSince),
      ownerProfile: {
        create: {
          businessName: seed.businessName,
          kind: seed.kind,
          about: seed.about,
          primaryEstate: seed.primaryEstate,
          badgeLabel: seed.badgeLabel,
          memberSince: new Date(seed.memberSince),
          verification: {
            create: {
              state: approved ? "APPROVED" : "PENDING",
              certificateNumber: seed.certificateNumber ?? null,
              submittedAt,
              reviewedAt: approved ? new Date(submittedAt.getTime() + 4.2 * HOUR) : null,
              reviewedById: approved ? adminId : null,
              adminNotes: approved
                ? "All documents verified against IPRS and KRA records. Physical inspection passed, Cap 296 compliant."
                : null,
              // A pending file has the checks that its uploaded documents cover,
              // and nothing else — that is what makes screen 22 worth reviewing.
              nationalIdOk: approved || seed.documents.includes("National ID"),
              kraPinOk: approved || seed.documents.includes("KRA PIN"),
              titleDeedOk:
                approved || seed.documents.some((d) => d === "Title Deed" || d === "Mandate"),
              inspectionOk: approved,
              feePledgeOk: approved,
              documents: {
                create: seed.documents.map((label) => ({
                  label,
                  fileUrl: `/seed/documents/${label.toLowerCase().replace(/\s+/g, "-")}.pdf`,
                  uploadedAt: submittedAt,
                })),
              },
            },
          },
        },
      },
    },
    include: { ownerProfile: { include: { verification: true } } },
  });
}

async function main() {
  console.log("Clearing existing data…");
  await clear();

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  console.log("Creating users…");
  const admin = await db.user.create({
    data: {
      role: "ADMIN",
      fullName: ADMIN.fullName,
      email: ADMIN.email,
      phone: ADMIN.phone,
      passwordHash,
      createdAt: daysAgo(600),
    },
  });

  const approvedOwners = [];
  for (const seed of APPROVED_OWNERS) {
    approvedOwners.push(await createOwner(seed, passwordHash, true, admin.id));
  }
  for (const seed of PENDING_OWNERS) {
    await createOwner(seed, passwordHash, false, admin.id);
  }

  const tenants = [];
  for (const seed of TENANTS) {
    tenants.push(
      await db.user.create({
        data: {
          role: "TENANT",
          fullName: seed.fullName,
          email: seed.email,
          phone: seed.phone,
          passwordHash,
          avatarUrl: seed.avatarUrl,
          createdAt: daysAgo(randomInt(20, 300)),
          tenantProfile: {
            create: {
              preferredEstates: JSON.stringify(seed.preferredEstates),
              budgetMin: seed.budgetMin,
              budgetMax: seed.budgetMax,
              preferredTypes: JSON.stringify(seed.preferredTypes),
            },
          },
        },
      }),
    );
  }

  console.log("Creating listings…");
  const listings = [];
  for (const [index, seed] of LISTINGS.entries()) {
    const owner = approvedOwners[seed.owner];
    const createdAt = daysAgo(seed.ageDays);
    const photoCount = randomInt(3, 5);
    // Offset the photo cycle per listing, otherwise every cover is the same
    // image — there are only three seed photos to go round.
    const photoOffset = index % LISTING_PHOTOS.length;

    // Views accumulate per day since the listing went up, capped at 90 days of
    // history. Published listings get more traffic than pending or rented ones.
    const historyDays = Math.min(seed.ageDays, 90);
    const baseDaily = seed.status === "PUBLISHED" ? randomInt(8, 26) : randomInt(1, 5);
    const dailyViews: Prisma.ListingViewDailyCreateWithoutListingInput[] = [];
    let viewCount = 0;

    for (let d = historyDays; d >= 0; d--) {
      // A gentle upward trend so the sparklines rise the way the designs show.
      const trend = 1 + (historyDays - d) / Math.max(historyDays, 1);
      const views = Math.max(0, Math.round(baseDaily * trend * (0.6 + random() * 0.8)));
      viewCount += views;
      dailyViews.push({ date: midnightUtc(daysAgo(d)), views });
    }

    listings.push(
      await db.listing.create({
        data: {
          ownerId: owner.id,
          title: seed.title,
          description: seed.description,
          houseType: seed.houseType,
          bedrooms: seed.bedrooms,
          bathrooms: seed.bathrooms,
          furnished: seed.furnished,
          rentKes: seed.rentKes,
          depositMonths: seed.depositMonths,
          serviceCharge: seed.serviceCharge,
          estate: seed.estate,
          roadOrLandmark: seed.roadOrLandmark,
          // Nairobi, jittered — the detail page shows an approximate location.
          latitude: -1.2921 + (random() - 0.5) * 0.12,
          longitude: 36.8219 + (random() - 0.5) * 0.12,
          availableFrom: seed.status === "RENTED_OUT" ? daysAgo(-90) : daysAgo(-randomInt(0, 45)),
          status: seed.status,
          viewCount,
          createdAt,
          floorAreaSqft: seed.floorAreaSqft,
          parkingSpaces: seed.parkingSpaces ?? 0,
          highlight: seed.highlight,
          bedroomsNote: seed.bedroomsNote,
          bathroomsNote: seed.bathroomsNote,
          furnishedNote: seed.furnishedNote,
          images: {
            create: Array.from({ length: photoCount }, (_, i) => ({
              url: LISTING_PHOTOS[(i + photoOffset) % LISTING_PHOTOS.length],
              isCover: i === 0,
              position: i,
            })),
          },
          amenities: {
            create: seed.amenities.map(([label, sublabel]) => ({ label, sublabel })),
          },
          dailyViews: { create: dailyViews },
        },
      }),
    );
  }

  console.log("Creating enquiries…");
  for (const seed of ENQUIRIES) {
    const createdAt = hoursAgo(seed.hoursAgo);
    await db.enquiry.create({
      data: {
        listingId: listings[seed.listing].id,
        tenantId: tenants[seed.tenant].id,
        message: seed.message,
        readAt: seed.read ? new Date(createdAt.getTime() + randomInt(10, 180) * 60_000) : null,
        createdAt,
        reply: seed.reply ?? null,
        repliedAt: seed.reply ? new Date(createdAt.getTime() + randomInt(1, 6) * HOUR) : null,
      },
    });
  }

  console.log("Creating reports…");
  for (const seed of REPORTS) {
    const createdAt = hoursAgo(seed.hoursAgo);
    const closed = seed.status === "RESOLVED" || seed.status === "DISMISSED";
    await db.report.create({
      data: {
        listingId: listings[seed.listing].id,
        reporterId: tenants[seed.reporter].id,
        reason: seed.reason,
        details: seed.details,
        severity: seed.severity,
        status: seed.status,
        resolution: seed.resolution ?? null,
        createdAt,
        resolvedAt: closed ? new Date(createdAt.getTime() + randomInt(4, 48) * HOUR) : null,
      },
    });
  }

  console.log("Creating saved listings and price alerts…");
  const published = listings.filter((l) => l.status === "PUBLISHED");

  for (const [i, tenant] of tenants.entries()) {
    // The demo tenant gets a full saved list; screen 10's empty state belongs to
    // a tenant who has saved nothing, so the last two are left bare.
    const saveCount = i === 0 ? 6 : i >= tenants.length - 2 ? 0 : randomInt(1, 4);
    const chosen = new Set<string>();
    while (chosen.size < saveCount) chosen.add(pick(published).id);

    for (const listingId of chosen) {
      await db.savedListing.create({
        data: { userId: tenant.id, listingId, createdAt: daysAgo(randomInt(1, 40)) },
      });
    }
  }

  const alerts: { tenant: number; label: string; estate: string; houseType: HouseType | null; maxRent: number }[] = [
    { tenant: 0, label: "2 Bedroom in Westlands under Ksh 50,000", estate: "Westlands", houseType: "APARTMENT", maxRent: 50000 },
    { tenant: 0, label: "Studio in Parklands under Ksh 30,000", estate: "Parklands", houseType: "STUDIO", maxRent: 30000 },
    { tenant: 3, label: "Bedsitter in Kasarani under Ksh 25,000", estate: "Kasarani", houseType: "BEDSITTER", maxRent: 25000 },
    { tenant: 6, label: "Any house in Roysambu under Ksh 20,000", estate: "Roysambu", houseType: null, maxRent: 20000 },
    { tenant: 8, label: "2 Bedroom in Ruaka under Ksh 40,000", estate: "Ruaka", houseType: "APARTMENT", maxRent: 40000 },
  ];

  for (const alert of alerts) {
    await db.priceAlert.create({
      data: {
        userId: tenants[alert.tenant].id,
        label: alert.label,
        estate: alert.estate,
        houseType: alert.houseType,
        maxRent: alert.maxRent,
        active: true,
      },
    });
  }

  console.log("Creating notifications…");
  const notifications: Prisma.NotificationCreateManyInput[] = [
    { userId: tenants[0].id, kind: "SAVED_SEARCH_MATCH", title: "New match in Westlands", body: "Garden Court 2 Bed near Sarit was just published at Ksh 56,000 / month.", href: `/listings/${listings[5].id}`, createdAt: hoursAgo(1.5) },
    { userId: tenants[0].id, kind: "PRICE_DROP", title: "Price drop on a saved home", body: "Charming 2-Bed with Jacaranda Views dropped to Ksh 48,000 / month.", href: `/listings/${listings[28].id}`, createdAt: hoursAgo(20) },
    { userId: tenants[0].id, kind: "ENQUIRY_REPLY", title: "Kamau Properties replied", body: "They are built in and stay with the unit. Happy to show you on a viewing.", href: `/listings/${listings[0].id}`, readAt: hoursAgo(24), createdAt: hoursAgo(26) },
    { userId: approvedOwners[0].id, kind: "ENQUIRY_RECEIVED", title: "New enquiry from Brian Otieno", body: "Hello Samuel, is this unit still available for viewing this Saturday at 11am?", href: "/dashboard", createdAt: hoursAgo(0.25) },
    { userId: approvedOwners[0].id, kind: "LISTING_APPROVED", title: "Listing published", body: "Sunlit 1-Bedroom with Scenic City Views passed review and is now live.", href: `/listings/${listings[4].id}`, readAt: hoursAgo(180), createdAt: hoursAgo(192) },
    { userId: approvedOwners[0].id, kind: "REPORT_UPDATE", title: "A listing of yours was reported", body: "A tenant reported an illegal viewing fee on 2 Bedroom Apartment in Westlands. Our team is reviewing it.", href: "/dashboard", createdAt: hoursAgo(0.4) },
    { userId: admin.id, kind: "VERIFICATION_SUBMITTED", title: "New verification to review", body: "Peter Kariuki of Roysambu Property Group submitted documents for review.", href: "/admin/verifications", createdAt: hoursAgo(6) },
    { userId: admin.id, kind: "REPORT_UPDATE", title: "Critical report escalated", body: "Illegal Viewing Fee Demanded on 2 Bedroom Apartment in Westlands.", href: "/admin/reports", createdAt: hoursAgo(0.4) },
  ];
  await db.notification.createMany({ data: notifications });

  console.log("Creating platform weekly aggregates…");
  // Screen 20's stacked bar runs 12 weeks and peaks at 186 listings in W12,
  // which is platform-scale history, not something this seed's ~36 listings can
  // produce. Seeded so the ops console reads like the design; everything a demo
  // action touches is still derived from real rows.
  const weekly: Prisma.PlatformWeeklyCreateManyInput[] = [];
  const totals = [88, 96, 99, 112, 105, 120, 128, 135, 132, 148, 160, 186];
  for (const [i, total] of totals.entries()) {
    const rejected = Math.round(total * (0.02 + random() * 0.02));
    const inReview = Math.round(total * (0.08 + random() * 0.04));
    weekly.push({
      weekStart: midnightUtc(daysAgo((totals.length - i) * 7)),
      published: total - rejected - inReview,
      inReview,
      rejected,
    });
  }
  await db.platformWeekly.createMany({ data: weekly });

  const counts = {
    users: await db.user.count(),
    owners: await db.ownerProfile.count(),
    tenants: await db.tenantProfile.count(),
    listings: await db.listing.count(),
    published: await db.listing.count({ where: { status: "PUBLISHED" } }),
    pending: await db.listing.count({ where: { status: "PENDING_REVIEW" } }),
    rented: await db.listing.count({ where: { status: "RENTED_OUT" } }),
    rejected: await db.listing.count({ where: { status: "REJECTED" } }),
    images: await db.listingImage.count(),
    enquiries: await db.enquiry.count(),
    reports: await db.report.count(),
    saved: await db.savedListing.count(),
    alerts: await db.priceAlert.count(),
    notifications: await db.notification.count(),
    pendingVerifications: await db.verification.count({ where: { state: "PENDING" } }),
  };

  console.log(`
Seed complete.

  Users                  ${counts.users}  (${counts.owners} owners, ${counts.tenants} tenants, 1 admin)
  Pending verifications  ${counts.pendingVerifications}
  Listings               ${counts.listings}  (${counts.published} published, ${counts.pending} pending, ${counts.rented} rented out, ${counts.rejected} rejected)
  Listing images         ${counts.images}
  Enquiries              ${counts.enquiries}
  Reports                ${counts.reports}
  Saved listings         ${counts.saved}
  Price alerts           ${counts.alerts}
  Notifications          ${counts.notifications}

Demo logins — password for all three is "${DEMO_PASSWORD}":

  Tenant   tenant@moveapp.ke   ${TENANTS[0].fullName}
  Owner    owner@moveapp.ke    ${APPROVED_OWNERS[0].fullName}, ${APPROVED_OWNERS[0].businessName} (verified)
  Admin    admin@moveapp.ke    ${ADMIN.fullName}
`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
