import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FileCheck2,
  MapPin,
  MessageSquare,
  Scale,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { SiteShell } from "@/components/layout/SiteShell";
import { TopBarSearch } from "@/components/layout/TopBar";
import { ListingCard } from "@/components/listing/ListingCard";
import { SaveButton } from "@/components/listing/SaveButton";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { TrustNotice } from "@/components/ui/TrustNotice";
import { VerificationChecklist } from "@/components/ui/VerificationChecklist";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TRUST_COPY } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { formatCount, formatMonthYear } from "@/lib/format";
import {
  findListingsForOwnerProfile,
  getOwnerProfile,
  getOwnerResponsiveness,
} from "@/lib/queries/owners";
import { getSavedListingIds } from "@/lib/queries/notifications";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const owner = await getOwnerProfile((await params).id);
  if (!owner?.ownerProfile) return { title: "Owner not found" };
  return { title: owner.ownerProfile.businessName };
}

const STANDARDS = [
  {
    icon: <Scale />,
    title: "Cap 296 compliant",
    body: "Written standardised rental leases conforming to Kenyan tenant law.",
  },
  {
    icon: <ClipboardCheck />,
    title: "Physical inspection",
    body: "Units checked for active water supply, KPLC metering, and compound security.",
  },
  {
    icon: <Wrench />,
    title: "Dedicated caretakers",
    body: "On-site caretaker contacts assigned to each property for repairs.",
  },
  {
    icon: <FileCheck2 />,
    title: "Deposit protection",
    body: "Transparent refund checkout terms documented in writing upon move-out.",
  },
];

/** Screen 13 — the public owner profile. */
export default async function OwnerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await getOwnerProfile(id);
  if (!owner?.ownerProfile) notFound();

  const profile = owner.ownerProfile;
  const verification = profile.verification;

  // An owner whose verification is not approved has no public profile — the
  // whole point of the page is the badge.
  if (verification?.state !== "APPROVED") notFound();

  const user = await getCurrentUser();
  const [listings, responsiveness, rentedOut, savedIds] = await Promise.all([
    findListingsForOwnerProfile(owner.id),
    getOwnerResponsiveness(owner.id),
    db.listing.count({ where: { ownerId: owner.id, status: "RENTED_OUT" } }),
    user ? getSavedListingIds(user.id) : Promise.resolve(new Set<string>()),
  ]);

  const years = Math.max(1, new Date().getFullYear() - profile.memberSince.getFullYear());

  const stats: [string, string][] = [
    ["Listings posted", formatCount(listings.length + rentedOut)],
    ["Currently available", formatCount(owner.activeListings)],
    [
      "Avg. response time",
      responsiveness.averageMinutes === null
        ? "—"
        : responsiveness.averageMinutes < 60
          ? `${responsiveness.averageMinutes} mins`
          : `${Math.round(responsiveness.averageMinutes / 60)} hrs`,
    ],
    ["Response rate", responsiveness.responseRate === null ? "—" : `${responsiveness.responseRate}%`],
    ["Total views", formatCount(owner.totalViews)],
  ];

  return (
    <SiteShell searchSlot={<TopBarSearch />}>
      <div className="mx-auto max-w-container-max space-y-space-lg px-gutter-mobile py-space-lg lg:px-gutter-desktop">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-space-2xs text-body-sm text-muted">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link href="/listings" className="hover:text-ink">
            Property owners
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">{profile.businessName}</span>
        </nav>

        {/* Identity + contact */}
        <section className="rounded-xl border border-border bg-surface p-space-lg">
          <div className="grid gap-space-lg lg:grid-cols-[1.6fr_1fr]">
            <div className="flex flex-wrap items-start gap-space-md">
              <div className="relative">
                <Avatar name={profile.businessName} src={owner.avatarUrl} size="lg" className="size-20" />
                <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-success text-white ring-2 ring-surface">
                  <BadgeCheck className="size-4" aria-hidden />
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-space-xs">
                <h1 className="flex flex-wrap items-center gap-space-sm text-headline-lg-mobile md:text-headline-lg">
                  {profile.businessName}
                  <VerifiedBadge kind={profile.kind} label={profile.badgeLabel} variant="pill" />
                </h1>

                <p className="flex flex-wrap items-center gap-space-md text-body-sm text-muted">
                  <span className="flex items-center gap-space-2xs">
                    <MapPin className="size-4" aria-hidden />
                    {profile.primaryEstate}, Nairobi
                  </span>
                  <span className="flex items-center gap-space-2xs">
                    <Clock className="size-4" aria-hidden />
                    Member since {formatMonthYear(profile.memberSince)} • {years}{" "}
                    {years === 1 ? "year" : "years"} on MoveApp
                  </span>
                </p>

                {profile.about && <p className="text-body-md text-muted">{profile.about}</p>}

                <div className="flex flex-wrap gap-space-xs pt-space-2xs">
                  {[
                    ["Title deeds vetted", verification.titleDeedOk],
                    ["KRA tax compliant", verification.kraPinOk],
                    ["No middleman brokers", verification.feePledgeOk],
                  ]
                    .filter(([, ok]) => ok)
                    .map(([label]) => (
                      <Pill key={String(label)} tone="success">
                        <BadgeCheck className="size-3.5" aria-hidden />
                        {label}
                      </Pill>
                    ))}
                </div>
              </div>
            </div>

            <div className="space-y-space-sm rounded-xl border border-border bg-surface-low p-space-md">
              <p className="flex items-center justify-between gap-space-sm">
                <span className="text-label-sm uppercase tracking-wider text-muted">
                  Direct landlord contact
                </span>
                <span className="flex items-center gap-space-2xs text-label-sm text-success">
                  <span className="size-1.5 rounded-full bg-success" aria-hidden />
                  Available now
                </span>
              </p>

              {/* Contact runs through a listing, so the enquiry is always tied
                  to a specific house — CLAUDE.md rule 4. */}
              {listings[0] ? (
                <Link href={`/listings/${listings[0].id}`} className="block">
                  <Button size="lg" className="w-full">
                    <MessageSquare />
                    Contact via a listing
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="w-full" disabled>
                  No available listings
                </Button>
              )}

              <TrustNotice>{TRUST_COPY.noViewingFee}</TrustNotice>

              {verification.certificateNumber && (
                <p className="flex items-center gap-space-2xs text-body-sm text-muted">
                  <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden />
                  Compliance certificate {verification.certificateNumber}
                </p>
              )}
            </div>
          </div>

          <dl className="mt-space-lg grid gap-space-md border-t border-border pt-space-lg sm:grid-cols-3 lg:grid-cols-5">
            {stats.map(([label, value]) => (
              <div key={label}>
                <dt className="text-caption uppercase tracking-wider text-muted">{label}</dt>
                <dd className="font-display text-headline-md text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Listings */}
        <section>
          <div className="mb-space-md flex flex-wrap items-end justify-between gap-space-md">
            <h2 className="flex items-center gap-space-xs text-headline-md">
              Available listings
              <Pill tone="brand">{listings.length}</Pill>
            </h2>
            <Link
              href={`/listings?estate=${encodeURIComponent(profile.primaryEstate)}`}
              className="text-label-md text-ink hover:text-brand-strong"
            >
              More in {profile.primaryEstate} →
            </Link>
          </div>

          {listings.length === 0 ? (
            <EmptyState
              title="No available listings right now"
              description={`${profile.businessName} has nothing published at the moment. Their next verified unit will appear here.`}
            />
          ) : (
            <div className="grid gap-space-lg sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  saveSlot={
                    <SaveButton
                      listingId={listing.id}
                      saved={savedIds.has(listing.id)}
                      signedIn={Boolean(user)}
                    />
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Verification standards */}
        <section className="rounded-xl border border-border bg-surface p-space-lg">
          <div className="mb-space-md flex flex-wrap items-start justify-between gap-space-md">
            <div>
              <h2 className="flex items-center gap-space-xs text-headline-sm">
                <ShieldCheck className="size-5 text-success" aria-hidden />
                {profile.businessName} verification standards
              </h2>
              <p className="mt-space-2xs text-body-md text-muted">
                Every home listed under this profile has undergone in-person vetting by MoveApp
                Kenya field inspectors in Nairobi.
              </p>
            </div>
            <div className="flex flex-wrap gap-space-xs">
              <Pill tone="success">Title deed certified</Pill>
              <Pill tone="success">No viewing fees ever</Pill>
            </div>
          </div>

          <div className="grid gap-space-lg lg:grid-cols-[1.5fr_1fr]">
            <ul className="grid gap-space-md sm:grid-cols-2">
              {STANDARDS.map((standard) => (
                <li key={standard.title} className="flex items-start gap-space-sm">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-bg text-success [&_svg]:size-4">
                    {standard.icon}
                  </span>
                  <span>
                    <span className="block text-label-md text-ink">{standard.title}</span>
                    <span className="mt-space-2xs block text-body-sm text-muted">
                      {standard.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-border bg-surface-low p-space-md">
              <p className="mb-space-sm text-label-md text-ink">Admin verification checklist</p>
              <VerificationChecklist
                items={[
                  { label: "National ID", done: verification.nationalIdOk },
                  { label: "KRA PIN", done: verification.kraPinOk },
                  { label: "Title deed or ownership mandate", done: verification.titleDeedOk },
                  { label: "Physical inspection", done: verification.inspectionOk },
                  { label: "Zero viewing-fee pledge", done: verification.feePledgeOk },
                ]}
              />
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
