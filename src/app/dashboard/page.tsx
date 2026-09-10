import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bookmark, Building2, Eye, MessageSquare, ShieldCheck, TrendingUp } from "lucide-react";

import { EnquiryList } from "@/components/owner/EnquiryList";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { StatCard } from "@/components/ui/StatCard";
import { ListingStatusPill } from "@/components/ui/StatusPill";
import { VerificationChecklist } from "@/components/ui/VerificationChecklist";
import { LISTING_STATUS_LABEL } from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import { formatCount, formatDateRange, formatKes } from "@/lib/format";
import { countListingsByStatus, findListingsByOwner, getOwnerViewSeries } from "@/lib/queries/listings";
import { findEnquiriesForOwner } from "@/lib/queries/notifications";
import { getOwnerStats, getOwnerVerification } from "@/lib/queries/owners";
import type { ListingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const TABS: (ListingStatus | "ALL")[] = ["ALL", "PUBLISHED", "PENDING_REVIEW", "RENTED_OUT", "REJECTED"];

/** Screen 15. */
export default async function OwnerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireRole("OWNER");
  const requested = (await searchParams).status;
  const active = (TABS.includes(requested as ListingStatus) ? requested : "ALL") as
    | ListingStatus
    | "ALL";

  const [stats, counts, listings, enquiries, series, verification] = await Promise.all([
    getOwnerStats(user.id),
    countListingsByStatus(user.id),
    findListingsByOwner(user.id, active === "ALL" ? undefined : active),
    findEnquiriesForOwner(user.id, 3),
    getOwnerViewSeries(user.id, 30),
    user.ownerProfile ? getOwnerVerification(user.ownerProfile.id) : Promise.resolve(null),
  ]);

  const approved = verification?.state === "APPROVED";

  // The sparkline is the real 30-day series, bucketed to keep it legible.
  const spark = series.map((point) => point.views);
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 86400_000);

  return (
    <OwnerShell user={user} current="dashboard">
      <div className="space-y-space-lg">
        <header className="flex flex-wrap items-start justify-between gap-space-md">
          <div>
            <h1 className="flex flex-wrap items-center gap-space-sm text-headline-xl-mobile md:text-headline-xl">
              Habari, {user.fullName.split(" ")[0]}! <span aria-hidden>👋</span>
              {approved ? (
                <Pill tone="success">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  {user.ownerProfile?.badgeLabel ?? "Verified Landlord"}
                </Pill>
              ) : (
                <Pill tone="warning" dot>
                  Pending verification
                </Pill>
              )}
            </h1>
            <p className="mt-space-2xs max-w-2xl text-body-md text-muted">
              Here is what is happening with your rental properties across{" "}
              {user.ownerProfile?.primaryEstate || "Nairobi"} today.
            </p>
          </div>
          <Pill>{formatDateRange(monthAgo, now)}</Pill>
        </header>

        {!approved && (
          <div className="flex flex-wrap items-center justify-between gap-space-md rounded-xl bg-warning-bg p-space-lg">
            <p className="max-w-2xl text-body-md text-ink">
              <strong>Your listings cannot go live yet.</strong> An admin is reviewing your
              ownership documents. You can prepare listings now — they will publish the moment your
              verification clears.
            </p>
            <Link href="/dashboard/verification">
              <Button>
                View verification status
                <ArrowRight />
              </Button>
            </Link>
          </div>
        )}

        <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active Listings"
            value={formatCount(stats.active)}
            badge={<span className="text-body-md text-muted">of {stats.registered} registered</span>}
            icon={<Building2 />}
            trend={`${counts.PENDING_REVIEW} awaiting review`}
            trendTone={counts.PENDING_REVIEW > 0 ? "warning" : "success"}
            caption={`${counts.RENTED_OUT} rented out`}
            sparkline={spark}
            active
          />
          <StatCard
            label="Total Views This Month"
            value={formatCount(stats.viewsThisMonth)}
            icon={<Eye />}
            trend="Last 30 days"
            caption="Across all your listings"
            sparkline={spark}
          />
          <StatCard
            label="Enquiries"
            value={formatCount(stats.enquiries)}
            badge={
              stats.unreadEnquiries > 0 ? <Pill tone="warning">{stats.unreadEnquiries} unread</Pill> : undefined
            }
            icon={<MessageSquare />}
            trend="WhatsApp & in-app"
            caption="Tenants who reached out"
          />
          <StatCard
            label="Saved by Tenants"
            value={formatCount(stats.saves)}
            badge={stats.saves > 10 ? <Pill>High interest</Pill> : undefined}
            icon={<Bookmark />}
            trend="Watching your units"
            caption={`Top in ${user.ownerProfile?.primaryEstate || "Nairobi"}`}
          />
        </div>

        <div className="grid gap-space-lg xl:grid-cols-[1.7fr_1fr]">
          {/* Listings table */}
          <section className="min-w-0 rounded-xl border border-border bg-surface">
            <header className="flex flex-wrap items-start justify-between gap-space-md p-space-lg pb-space-sm">
              <div>
                <h2 className="text-headline-sm">Your listings</h2>
                <p className="text-body-sm text-muted">
                  Manage availability, tenant views, and leasing documentation.
                </p>
              </div>
              <Link
                href="/dashboard/listings"
                className="flex items-center gap-space-2xs text-label-md text-ink hover:text-brand-strong"
              >
                View all listings
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </header>

            <div className="flex flex-wrap gap-space-xs px-space-lg pb-space-md">
              {TABS.map((tab) => {
                const count = tab === "ALL" ? counts.all : counts[tab];
                const label = tab === "ALL" ? "All" : LISTING_STATUS_LABEL[tab];
                const isActive = tab === active;
                return (
                  <Link
                    key={tab}
                    href={tab === "ALL" ? "/dashboard" : `/dashboard?status=${tab}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Pill tone={isActive ? "brand" : "neutral"}>
                      {label} ({count})
                    </Pill>
                  </Link>
                );
              })}
            </div>

            {listings.length === 0 ? (
              <p className="px-space-lg pb-space-xl text-body-md text-muted">
                Nothing in this tab yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-left">
                  <thead>
                    <tr className="border-y border-border bg-surface-low">
                      <th scope="col" className="px-space-lg py-space-xs text-caption uppercase tracking-wider text-muted">
                        Property
                      </th>
                      <th scope="col" className="px-space-sm py-space-xs text-caption uppercase tracking-wider text-muted">
                        Price
                      </th>
                      <th scope="col" className="px-space-sm py-space-xs text-caption uppercase tracking-wider text-muted">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => (
                      <tr key={listing.id} className="border-b border-border last:border-0">
                        <td className="px-space-lg py-space-sm">
                          <span className="flex items-center gap-space-sm">
                            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-low">
                              {listing.images[0] && (
                                <Image
                                  src={listing.images[0].url}
                                  alt=""
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              )}
                            </span>
                            <span className="min-w-0">
                              <Link
                                href={`/dashboard/listings/${listing.id}`}
                                className="block truncate text-label-md text-ink hover:text-brand-strong"
                              >
                                {listing.title}
                              </Link>
                              <span className="block truncate text-body-sm text-muted">
                                {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} Bed`} •{" "}
                                {listing.bathrooms} Bath • {listing.roadOrLandmark}
                              </span>
                            </span>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-space-sm py-space-sm align-top">
                          <span className="block font-display text-label-md text-ink">
                            {formatKes(listing.rentKes)}
                          </span>
                          <span className="block text-body-sm text-muted">/ month</span>
                        </td>
                        <td className="px-space-sm py-space-sm align-top">
                          <ListingStatusPill status={listing.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Verification + enquiries */}
          <div className="space-y-space-lg">
            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <header className="mb-space-md flex items-start justify-between gap-space-sm">
                <h2 className="flex items-center gap-space-xs text-headline-sm">
                  <ShieldCheck className="size-5 text-success" aria-hidden />
                  MoveApp verification
                </h2>
                <Pill tone={approved ? "success" : "warning"} dot>
                  {approved ? "100% vetted" : "In review"}
                </Pill>
              </header>

              {approved && verification?.certificateNumber && (
                <p className="mb-space-md rounded-xl bg-success-bg p-space-md">
                  <span className="flex items-center gap-space-2xs text-label-md text-ink">
                    {user.ownerProfile?.badgeLabel ?? "Verified Landlord"}
                    <ShieldCheck className="size-4 text-success" aria-hidden />
                  </span>
                  <span className="mt-space-2xs block text-body-sm text-muted">
                    Compliance certificate {verification.certificateNumber}
                  </span>
                </p>
              )}

              <VerificationChecklist
                items={[
                  { label: "National ID & KRA PIN verified", done: Boolean(verification?.nationalIdOk && verification?.kraPinOk) },
                  { label: "Title deeds & ownership vetted", done: Boolean(verification?.titleDeedOk) },
                  { label: "Physical inspection passed", sublabel: "Cap 296 compliant", done: Boolean(verification?.inspectionOk) },
                  { label: "Zero middleman viewing-fee pledge", done: Boolean(verification?.feePledgeOk) },
                ]}
              />

              <p className="mt-space-md flex items-start gap-space-xs rounded-lg bg-surface-low p-space-sm text-body-sm text-muted">
                <TrendingUp className="mt-0.5 size-4 shrink-0 text-brand-strong" aria-hidden />
                Your verified badge boosts tenant enquiry rates and placement in search results.
              </p>

              <Link href="/dashboard/verification" className="mt-space-sm block">
                <Button variant="secondary" className="w-full">
                  {approved ? "View verification" : "Complete verification"}
                </Button>
              </Link>
            </section>

            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <header className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm">
                <h2 className="flex items-center gap-space-xs text-headline-sm">
                  Recent enquiries
                  {stats.unreadEnquiries > 0 && (
                    <Pill tone="warning">{stats.unreadEnquiries} unread</Pill>
                  )}
                </h2>
                <Link
                  href="/dashboard/enquiries"
                  className="text-label-sm text-ink hover:text-brand-strong"
                >
                  View all
                </Link>
              </header>
              <EnquiryList enquiries={enquiries} ownerName={user.fullName} />
            </section>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}
