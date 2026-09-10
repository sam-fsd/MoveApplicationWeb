import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Bath,
  Bed,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Info,
  MapPin,
  Share2,
  Sofa,
} from "lucide-react";

import { SiteShell } from "@/components/layout/SiteShell";
import { TopBarSearch } from "@/components/layout/TopBar";
import { Gallery } from "@/components/listing/Gallery";
import { ListingCard } from "@/components/listing/ListingCard";
import { OwnerContactCard } from "@/components/listing/OwnerContactCard";
import { SaveButton } from "@/components/listing/SaveButton";
import { Pill } from "@/components/ui/Pill";
import { TRUST_COPY } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { formatCount, formatKes, formatShortDate } from "@/lib/format";
import { findSimilarListings, getListingById } from "@/lib/queries/listings";
import { getSavedListingIds } from "@/lib/queries/notifications";
import { enquiryMessage, formatPhone } from "@/lib/whatsapp";
import { db } from "@/lib/db";
import { ViewCounter } from "./ViewCounter";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const listing = await getListingById((await params).id);
  if (!listing) return { title: "Listing not found" };
  return {
    title: listing.title,
    description: `${listing.title} in ${listing.estate}, Nairobi at ${formatKes(listing.rentKes)} a month. Verified owner, zero viewing fees.`,
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListingById(id);

  // A listing pulled for a report or still in review must not be reachable by
  // a tenant, even with a direct link. Its owner and admins can still see it.
  if (!listing) notFound();

  const user = await getCurrentUser();
  const isOwnListing = user?.id === listing.owner.id;
  const isStaff = user?.role === "ADMIN" || isOwnListing;
  if (listing.status !== "PUBLISHED" && !isStaff) notFound();

  const [similar, savedIds, activeListings] = await Promise.all([
    findSimilarListings(listing.id, listing.estate),
    user ? getSavedListingIds(user.id) : Promise.resolve(new Set<string>()),
    db.listing.count({ where: { ownerId: listing.owner.id, status: "PUBLISHED" } }),
  ]);

  const profile = listing.owner.ownerProfile;
  const location = listing.roadOrLandmark.toLowerCase().includes(listing.estate.toLowerCase())
    ? listing.roadOrLandmark
    : `${listing.roadOrLandmark}, ${listing.estate}`;
  const waMessage = enquiryMessage({
    listingTitle: listing.title,
    estate: listing.estate,
    rentLabel: formatKes(listing.rentKes),
    tenantName: user?.fullName,
  });

  const specs = [
    {
      icon: <Bed />,
      label: listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} Bedroom${listing.bedrooms > 1 ? "s" : ""}`,
      note: listing.bedroomsNote,
    },
    {
      icon: <Bath />,
      label: `${listing.bathrooms} Bathroom${listing.bathrooms > 1 ? "s" : ""}`,
      note: listing.bathroomsNote,
    },
    {
      icon: <Sofa />,
      label: listing.furnished ? "Furnished" : "Unfurnished",
      note: listing.furnishedNote,
    },
    {
      icon: <CalendarCheck />,
      label: "Available",
      note: `From ${formatShortDate(listing.availableFrom)}`,
    },
  ];

  // The three utilities that decide a Nairobi let get their own strip.
  const utilities = listing.amenities.filter((a) => a.sublabel).slice(0, 3);

  return (
    <SiteShell searchSlot={<TopBarSearch />}>
      <ViewCounter listingId={listing.id} />

      <div className="mx-auto max-w-container-max px-gutter-mobile py-space-lg lg:px-gutter-desktop">
        <nav aria-label="Breadcrumb" className="mb-space-md flex flex-wrap items-center gap-space-2xs text-body-sm text-muted">
          <Link href="/listings" className="hover:text-ink">
            Browse rentals
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link href={`/listings?estate=${encodeURIComponent(listing.estate)}`} className="hover:text-ink">
            {listing.estate}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">{listing.title}</span>
        </nav>

        {listing.status !== "PUBLISHED" && (
          <p className="mb-space-md rounded-xl bg-warning-bg px-space-md py-space-sm text-body-md text-ink">
            <strong>Not visible to tenants.</strong> This listing is {listing.status.replace("_", " ").toLowerCase()} —
            you can see it because it is yours or you are an admin.
          </p>
        )}

        <Gallery
          images={listing.images}
          title={listing.title}
          badge={
            <Pill tone="ink">
              <BadgeCheck className="size-3.5 text-success" aria-hidden />
              Live street-vetted
            </Pill>
          }
        />

        <div className="mt-space-lg grid gap-space-xl lg:grid-cols-[1.7fr_1fr]">
          <div className="min-w-0 space-y-space-lg">
            <header className="space-y-space-sm">
              <p className="flex flex-wrap items-center gap-space-xs text-label-sm text-success">
                <BadgeCheck className="size-4" aria-hidden />
                Direct landlord listing • Verified by admin
              </p>

              <h1 className="text-headline-lg-mobile md:text-headline-lg">{listing.title}</h1>

              <p className="flex items-center gap-space-2xs text-body-md text-muted">
                <MapPin className="size-4 shrink-0" aria-hidden />
                {location}
              </p>

              <div className="flex flex-wrap items-end justify-between gap-space-md">
                <div>
                  <p className="flex flex-wrap items-baseline gap-space-xs">
                    <span className="relative font-display text-price-hero text-ink">
                      {formatKes(listing.rentKes)}
                      <span className="absolute inset-x-0 -bottom-1 h-1 rounded-full bg-brand" aria-hidden />
                    </span>
                    <span className="text-body-md text-muted">/ month</span>
                  </p>
                  <p className="mt-space-xs text-body-sm text-muted">
                    Deposit: {listing.depositMonths} month{listing.depositMonths > 1 ? "s" : ""}
                    {listing.serviceCharge && " • Service charge included"}
                    {listing.floorAreaSqft && ` • ${formatCount(listing.floorAreaSqft)} sqft`}
                  </p>
                </div>

                <div className="flex items-center gap-space-xs">
                  <span className="inline-flex h-10 items-center gap-space-xs rounded-lg border border-border bg-surface px-space-md text-label-md text-muted">
                    <Share2 className="size-4" aria-hidden />
                    {formatCount(listing.viewCount)} views
                  </span>
                  <SaveButton
                    listingId={listing.id}
                    saved={savedIds.has(listing.id)}
                    signedIn={Boolean(user)}
                    variant="inline"
                  />
                </div>
              </div>
            </header>

            <ul className="grid grid-cols-2 gap-space-sm md:grid-cols-4">
              {specs.map((spec) => (
                <li
                  key={spec.label}
                  className="rounded-xl border border-border bg-surface p-space-md text-center"
                >
                  <span className="mx-auto mb-space-2xs flex size-8 items-center justify-center text-muted [&_svg]:size-5">
                    {spec.icon}
                  </span>
                  <span className="block text-label-md text-ink">{spec.label}</span>
                  {spec.note && <span className="block text-body-sm text-muted">{spec.note}</span>}
                </li>
              ))}
            </ul>

            {utilities.length > 0 && (
              <ul className="grid gap-space-sm rounded-xl border border-border bg-surface p-space-md sm:grid-cols-3">
                {utilities.map((utility) => (
                  <li key={utility.id} className="flex items-start gap-space-xs">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    <span>
                      <span className="block text-label-sm text-ink">{utility.label}</span>
                      <span className="block text-body-sm text-muted">{utility.sublabel}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <h2 className="mb-space-sm text-headline-sm">About this home</h2>
              <div className="space-y-space-md text-body-md leading-relaxed text-muted">
                {listing.description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <h2 className="mb-space-md text-headline-sm">Amenities &amp; features</h2>
              <ul className="grid gap-space-sm sm:grid-cols-2 lg:grid-cols-3">
                {listing.amenities.map((amenity) => (
                  <li key={amenity.id} className="flex items-start gap-space-xs text-body-md">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    {amenity.label}
                  </li>
                ))}
              </ul>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="flex flex-wrap items-start justify-between gap-space-sm p-space-lg pb-space-sm">
                <div>
                  <h2 className="text-headline-sm">Location &amp; neighbourhood</h2>
                  <p className="text-body-sm text-muted">
                    {listing.roadOrLandmark}, {listing.estate} Sub-county, Nairobi
                  </p>
                </div>
                <Pill>
                  <MapPin className="size-3.5" aria-hidden />
                  {listing.estate}
                </Pill>
              </div>

              {/* No mapping library is approved and the demo must work offline,
                  so the location is drawn as a schematic rather than a map. */}
              <div className="relative mx-space-lg h-56 overflow-hidden rounded-xl border border-border bg-surface-low">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      "linear-gradient(#E6E3DC 1px, transparent 1px), linear-gradient(90deg, #E6E3DC 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                  }}
                  aria-hidden
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center gap-space-xs rounded-full bg-ink px-space-md py-space-xs text-label-sm text-white shadow-raised">
                    <MapPin className="size-4 text-brand" aria-hidden />
                    {listing.estate} • {listing.roadOrLandmark.split(",")[0]}
                  </span>
                </div>
              </div>

              <p className="flex items-start gap-space-xs p-space-lg text-body-sm text-muted">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                {TRUST_COPY.approximateLocation}
              </p>
            </section>
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            {profile && (
              <OwnerContactCard
                ownerId={listing.owner.id}
                listingId={listing.id}
                listingTitle={listing.title}
                listingLocation={location}
                waMessage={waMessage}
                emailSubject={`Enquiry about ${listing.title} on MoveApp Kenya`}
                signedIn={Boolean(user)}
                owner={{
                  businessName: profile.businessName,
                  kind: profile.kind,
                  badgeLabel: profile.badgeLabel,
                  about: profile.about,
                  avatarUrl: listing.owner.avatarUrl,
                  phone: listing.owner.phone,
                  displayPhone: formatPhone(listing.owner.phone),
                  email: listing.owner.email,
                  memberSince: profile.memberSince,
                  activeListings,
                }}
              />
            )}
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-space-3xl">
            <div className="mb-space-lg flex flex-wrap items-end justify-between gap-space-md">
              <h2 className="text-headline-md">Similar houses in {listing.estate}</h2>
              <Link
                href={`/listings?estate=${encodeURIComponent(listing.estate)}`}
                className="text-label-md text-ink hover:text-brand-strong"
              >
                View all in {listing.estate} →
              </Link>
            </div>
            <div className="grid gap-space-lg sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  saveSlot={
                    <SaveButton
                      listingId={item.id}
                      saved={savedIds.has(item.id)}
                      signedIn={Boolean(user)}
                    />
                  }
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
