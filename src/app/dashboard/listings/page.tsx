import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Eye, MessageSquare, Plus } from "lucide-react";

import { OwnerShell } from "@/components/owner/OwnerShell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { ListingStatusPill } from "@/components/ui/StatusPill";
import { LISTING_STATUS_LABEL } from "@/lib/constants";
import { canPublish, requireRole } from "@/lib/auth";
import { formatCount, formatKes, formatRelative } from "@/lib/format";
import { countListingsByStatus, findListingsByOwner } from "@/lib/queries/listings";
import { db } from "@/lib/db";
import type { ListingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "My listings" };

const TABS: (ListingStatus | "ALL")[] = ["ALL", "PUBLISHED", "PENDING_REVIEW", "RENTED_OUT", "REJECTED"];

/** The full listings table behind screen 15's "View all listings". */
export default async function OwnerListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await requireRole("OWNER");
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const active = (TABS.includes(params.status as ListingStatus) ? params.status : "ALL") as
    | ListingStatus
    | "ALL";

  const [counts, all] = await Promise.all([
    countListingsByStatus(user.id),
    findListingsByOwner(user.id, active === "ALL" ? undefined : active),
  ]);

  const listings = query
    ? all.filter((l) =>
        `${l.title} ${l.estate} ${l.roadOrLandmark}`.toLowerCase().includes(query.toLowerCase()),
      )
    : all;

  const enquiryCounts = await db.enquiry.groupBy({
    by: ["listingId"],
    where: { listing: { ownerId: user.id } },
    _count: { _all: true },
  });
  const enquiriesBy = new Map(enquiryCounts.map((row) => [row.listingId, row._count._all]));

  return (
    <OwnerShell user={user} current="listings">
      <div className="space-y-space-lg">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-2xs text-body-sm text-muted">
          <Link href="/dashboard" className="hover:text-ink">
            Dashboard
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">My Listings</span>
        </nav>

        <header className="flex flex-wrap items-start justify-between gap-space-md">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg">My listings</h1>
            <p className="mt-space-2xs text-body-md text-muted">
              {counts.all} {counts.all === 1 ? "property" : "properties"} registered
              {query && ` • filtered by “${query}”`}
            </p>
          </div>
          {canPublish(user) && (
            <Link href="/dashboard/listings/new">
              <Button>
                <Plus />
                Add listing
              </Button>
            </Link>
          )}
        </header>

        <div className="flex flex-wrap gap-space-xs">
          {TABS.map((tab) => {
            const count = tab === "ALL" ? counts.all : counts[tab];
            const label = tab === "ALL" ? "All" : LISTING_STATUS_LABEL[tab];
            return (
              <Link
                key={tab}
                href={tab === "ALL" ? "/dashboard/listings" : `/dashboard/listings?status=${tab}`}
              >
                <Pill tone={tab === active ? "brand" : "neutral"}>
                  {label} ({count})
                </Pill>
              </Link>
            );
          })}
        </div>

        {listings.length === 0 ? (
          <EmptyState
            title={query ? `Nothing matches “${query}”` : "No listings in this tab"}
            description={
              canPublish(user)
                ? "Add a property and it will appear here the moment you submit it for review."
                : "Your account is still being verified. You can add listings once an admin approves it."
            }
            actions={
              canPublish(user) ? (
                <Link href="/dashboard/listings/new">
                  <Button>
                    <Plus />
                    Add listing
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard/verification">
                  <Button>View verification status</Button>
                </Link>
              )
            }
          />
        ) : (
          <ul className="grid gap-space-md">
            {listings.map((listing) => (
              <li
                key={listing.id}
                className="flex flex-wrap items-center gap-space-md rounded-xl border border-border bg-surface p-space-md"
              >
                <span className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface-low">
                  {listing.images[0] && (
                    <Image src={listing.images[0].url} alt="" fill sizes="80px" className="object-cover" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/listings/${listing.id}`}
                    className="block truncate text-label-md text-ink hover:text-brand-strong"
                  >
                    {listing.title}
                  </Link>
                  <span className="block truncate text-body-sm text-muted">
                    {listing.roadOrLandmark}, {listing.estate}
                  </span>
                  <span className="mt-space-2xs flex flex-wrap items-center gap-space-md text-body-sm text-muted">
                    <span className="flex items-center gap-space-2xs">
                      <Eye className="size-4" aria-hidden />
                      {formatCount(listing.viewCount)} views
                    </span>
                    <span className="flex items-center gap-space-2xs">
                      <MessageSquare className="size-4" aria-hidden />
                      {enquiriesBy.get(listing.id) ?? 0} enquiries
                    </span>
                    <span>Listed {formatRelative(listing.createdAt)}</span>
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-space-md">
                  <span className="text-right">
                    <span className="block font-display text-price-listing text-ink">
                      {formatKes(listing.rentKes)}
                    </span>
                    <span className="block text-body-sm text-muted">/ month</span>
                  </span>
                  <ListingStatusPill status={listing.status} />
                  <Link href={`/dashboard/listings/${listing.id}`}>
                    <Button size="sm" variant="secondary">
                      Manage
                    </Button>
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </OwnerShell>
  );
}
