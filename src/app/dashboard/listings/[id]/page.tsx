import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Eye,
  MessageSquare,
  Pencil,
  Undo2,
} from "lucide-react";

import { setListingStatus } from "./actions";
import { EnquiryList } from "@/components/owner/EnquiryList";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { ViewsChart } from "@/components/owner/ViewsChart";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { StatCard } from "@/components/ui/StatCard";
import { ListingStatusPill } from "@/components/ui/StatusPill";
import { requireRole } from "@/lib/auth";
import { formatCount, formatKes, formatShortDate } from "@/lib/format";
import { getListingById, getListingViewSeries } from "@/lib/queries/listings";
import { findEnquiriesForListing } from "@/lib/queries/notifications";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Screen 19. */
export default async function ManageListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requireRole("OWNER");
  const { id } = await params;
  const justCreated = (await searchParams).created === "1";

  const listing = await getListingById(id);
  // Scoped to the signed-in owner, so one owner cannot open another's listing.
  if (!listing || listing.ownerId !== user.id) notFound();

  const [series, enquiries, saves] = await Promise.all([
    getListingViewSeries(listing.id, 90),
    findEnquiriesForListing(listing.id),
    db.savedListing.count({ where: { listingId: listing.id } }),
  ]);

  const unread = enquiries.filter((e) => !e.readAt).length;
  const points = series.map((point) => ({
    date: formatShortDate(point.date).replace(/ \d{4}$/, ""),
    views: point.views,
  }));

  const health = [
    { label: `${listing.images.length} photos uploaded`, ok: listing.images.length >= 3 },
    { label: "Cap 296 compliant pricing", ok: listing.rentKes > 0 },
    { label: "Transparent utility breakdown", ok: listing.amenities.length >= 3 },
    { label: "WhatsApp contact verified", ok: Boolean(listing.owner.phone) },
  ];
  const score = Math.round((health.filter((h) => h.ok).length / health.length) * 100);

  return (
    <OwnerShell user={user} current="listings">
      <div className="space-y-space-lg">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-space-2xs text-body-sm text-muted">
          <Link href="/dashboard" className="hover:text-ink">
            Dashboard
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link href="/dashboard/listings" className="hover:text-ink">
            My Listings
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">{listing.title}</span>
        </nav>

        {justCreated && (
          <p className="flex items-start gap-space-sm rounded-xl bg-success-bg p-space-md text-body-md text-success">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
            <span>
              <strong>Listing submitted.</strong> It is in review now — an admin checks it against
              your verified ownership documents, and you will be notified when it goes live.
            </span>
          </p>
        )}

        <header className="flex flex-wrap items-start justify-between gap-space-md rounded-xl border border-border bg-surface p-space-lg">
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-space-sm text-headline-lg-mobile md:text-headline-lg">
              {listing.title}
              <ListingStatusPill status={listing.status} />
            </h1>
            <p className="mt-space-2xs text-body-md text-muted">
              {locationLine(listing.roadOrLandmark, listing.estate)} • Listed{" "}
              {formatShortDate(listing.createdAt)} • Unit ref{" "}
              <strong className="text-ink">#{listing.id.slice(-6).toUpperCase()}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            {listing.status === "PUBLISHED" && (
              <Link href={`/listings/${listing.id}`} target="_blank">
                <Button variant="secondary">
                  <ExternalLink />
                  View public listing
                </Button>
              </Link>
            )}

            {listing.status === "RENTED_OUT" ? (
              <form action={setListingStatus.bind(null, listing.id, "PENDING_REVIEW")}>
                <Button type="submit">
                  <Undo2 />
                  Put back on the market
                </Button>
              </form>
            ) : (
              <form action={setListingStatus.bind(null, listing.id, "RENTED_OUT")}>
                <Button type="submit" variant="secondary">
                  <Pencil />
                  Mark as rented
                </Button>
              </form>
            )}
          </div>
        </header>

        <div className="grid gap-space-md sm:grid-cols-3">
          <StatCard
            label="Total Views"
            value={formatCount(listing.viewCount)}
            icon={<Eye />}
            trend={`${points.at(-1)?.views ?? 0} today`}
            caption={`${listing.estate} rentals`}
            sparkline={points.slice(-30).map((p) => p.views)}
            active
          />
          <StatCard
            label="Saved by Tenants"
            value={formatCount(saves)}
            icon={<Bookmark />}
            trend={saves > 5 ? "High renter interest" : "Building interest"}
            trendTone={saves > 5 ? "success" : "muted"}
            caption="Tenants watching this unit"
          />
          <StatCard
            label="Enquiries Received"
            value={formatCount(enquiries.length)}
            badge={unread > 0 ? <Pill tone="warning">{unread} unread</Pill> : undefined}
            icon={<MessageSquare />}
            trend={`${enquiries.filter((e) => e.reply).length} replied`}
            caption="WhatsApp & in-app"
          />
        </div>

        <div className="grid gap-space-lg xl:grid-cols-[1.7fr_1fr]">
          <div className="min-w-0 space-y-space-lg">
            <ViewsChart points={points} />

            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <header className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm">
                <h2 className="flex items-center gap-space-xs text-headline-sm">
                  Tenant enquiries
                  <Pill>
                    {enquiries.length} total{unread > 0 && ` • ${unread} unread`}
                  </Pill>
                </h2>
              </header>
              <EnquiryList
                enquiries={enquiries.map((e) => ({ ...e, listing: { id: listing.id, title: listing.title } }))}
                ownerName={user.fullName}
              />
            </section>
          </div>

          <div className="space-y-space-lg">
            {/* Tenant card preview */}
            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <h2 className="text-headline-sm">Tenant card preview</h2>
              <p className="mb-space-md text-body-sm text-muted">
                How your listing appears in {listing.estate} search results.
              </p>

              <div className="overflow-hidden rounded-xl border border-border">
                <span className="relative block aspect-[4/3] bg-surface-low">
                  {listing.images[0] && (
                    <Image src={listing.images[0].url} alt="" fill sizes="360px" className="object-cover" />
                  )}
                  <Pill tone="ink" className="absolute left-space-sm top-space-sm">
                    {listing.status === "PUBLISHED" ? "For rent" : "Not live"}
                  </Pill>
                </span>
                <span className="block p-space-md">
                  <span className="flex items-baseline gap-space-xs">
                    <span className="font-display text-price-listing text-ink">
                      {formatKes(listing.rentKes)}
                    </span>
                    <span className="text-body-sm text-muted">/ month</span>
                    <Pill className="ml-auto">Dep: {listing.depositMonths} Mo</Pill>
                  </span>
                  <span className="mt-space-2xs block truncate text-label-md text-ink">
                    {listing.title}
                  </span>
                  <span className="block truncate text-body-sm text-muted">
                    {listing.roadOrLandmark}
                  </span>
                </span>
              </div>

              {listing.status === "PUBLISHED" && (
                <Link href={`/listings/${listing.id}`} target="_blank" className="mt-space-sm block">
                  <Button variant="secondary" className="w-full">
                    <ExternalLink />
                    Open full public listing
                  </Button>
                </Link>
              )}
            </section>

            {/* Health score */}
            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <header className="mb-space-sm flex items-center justify-between gap-space-sm">
                <h2 className="text-headline-sm">Listing health score</h2>
                <Pill tone={score >= 75 ? "success" : "warning"}>{score}%</Pill>
              </header>

              <div className="mb-space-md h-2 overflow-hidden rounded-full bg-surface-low">
                <div
                  className={score >= 75 ? "h-full bg-success" : "h-full bg-warning"}
                  style={{ width: `${score}%` }}
                />
              </div>

              <ul className="space-y-space-xs">
                {health.map((item) => (
                  <li key={item.label} className="flex items-center gap-space-xs text-body-md">
                    {item.ok ? (
                      <BadgeCheck className="size-4 shrink-0 text-success" aria-hidden />
                    ) : (
                      <span className="size-4 shrink-0 rounded-full border border-border" aria-hidden />
                    )}
                    <span className={item.ok ? "text-ink" : "text-muted"}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}

/** Avoids "Rhapta Road, Westlands, Westlands" when the road already names it. */
function locationLine(roadOrLandmark: string, estate: string): string {
  return roadOrLandmark.toLowerCase().includes(estate.toLowerCase())
    ? roadOrLandmark
    : `${roadOrLandmark}, ${estate}`;
}
