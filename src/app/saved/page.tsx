import Link from "next/link";
import { ArrowRight, BadgeCheck, ChevronRight, Search } from "lucide-react";

import { SiteShell } from "@/components/layout/SiteShell";
import { TopBarSearch } from "@/components/layout/TopBar";
import { ListingCard } from "@/components/listing/ListingCard";
import { SaveButton } from "@/components/listing/SaveButton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { TrustNotice } from "@/components/ui/TrustNotice";
import { requireRole } from "@/lib/auth";
import { HOUSE_TYPE_LABEL } from "@/lib/constants";
import { findPriceAlerts, findSavedListings } from "@/lib/queries/notifications";
import { buildListingHref } from "@/lib/search-params";
import { db } from "@/lib/db";
import { PriceAlerts, type AlertRow } from "./PriceAlerts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved homes" };

const QUICK_SEARCHES = [
  { label: "2 Bed Westlands", href: buildListingHref({ estate: "Westlands", bedrooms: [2] }) },
  { label: "1 Bed Kilimani", href: buildListingHref({ estate: "Kilimani", bedrooms: [1] }) },
  { label: "Studios in Parklands", href: buildListingHref({ estate: "Parklands", houseTypes: ["STUDIO"] }) },
  { label: "Bedsitters in Kasarani", href: buildListingHref({ estate: "Kasarani", houseTypes: ["BEDSITTER"] }) },
];

/** Screens 09 and 10 — the saved grid and its empty state. */
export default async function SavedPage() {
  const user = await requireRole("TENANT");

  const [saved, alerts] = await Promise.all([
    findSavedListings(user.id),
    findPriceAlerts(user.id),
  ]);

  // Each alert's match count is computed from its own criteria, so the badge on
  // screen 09 means something rather than being decoration.
  const alertRows: AlertRow[] = await Promise.all(
    alerts.map(async (alert) => ({
      id: alert.id,
      label: alert.label,
      estate: alert.estate,
      houseType: alert.houseType,
      maxRent: alert.maxRent,
      active: alert.active,
      matches: await db.listing.count({
        where: {
          status: "PUBLISHED",
          ...(alert.estate ? { estate: alert.estate } : {}),
          ...(alert.houseType ? { houseType: alert.houseType } : {}),
          ...(alert.maxRent ? { rentKes: { lte: alert.maxRent } } : {}),
        },
      }),
    })),
  );

  const byType = saved.reduce<Record<string, number>>((acc, row) => {
    const key = row.listing.houseType;
    return { ...acc, [key]: (acc[key] ?? 0) + 1 };
  }, {});

  return (
    <SiteShell searchSlot={<TopBarSearch />}>
      <div className="mx-auto max-w-container-max space-y-space-lg px-gutter-mobile py-space-lg lg:px-gutter-desktop">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-2xs text-body-sm text-muted">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">Saved homes</span>
        </nav>

        <header className="flex flex-wrap items-start justify-between gap-space-md">
          <div>
            <h1 className="flex flex-wrap items-center gap-space-xs text-headline-lg-mobile md:text-headline-lg">
              Saved homes
              <span className="text-muted">({saved.length})</span>
              <Pill tone="success">
                <BadgeCheck className="size-3.5" aria-hidden />
                All listings anti-fraud verified
              </Pill>
            </h1>
            <p className="mt-space-2xs text-body-md text-muted">
              Keep track of verified Nairobi rentals, monitor rent changes, and compare move-in
              terms side by side.
            </p>
          </div>
          <Link href="/listings">
            <Button variant="secondary">
              <Search />
              Browse rentals
            </Button>
          </Link>
        </header>

        {saved.length > 0 && (
          <div className="flex flex-wrap items-center gap-space-xs">
            <Pill tone="brand">All types {saved.length}</Pill>
            {Object.entries(byType).map(([type, count]) => (
              <Link key={type} href={buildListingHref({ houseTypes: [type as never] })}>
                <Pill>
                  {HOUSE_TYPE_LABEL[type as keyof typeof HOUSE_TYPE_LABEL]} {count}
                </Pill>
              </Link>
            ))}
          </div>
        )}

        {saved.length === 0 ? (
          <EmptyState
            illustration="/illustrations/404-house-missing-door.png"
            title="You haven't saved any houses yet"
            description="Tap the heart on any listing while exploring rentals across Nairobi to keep track of your favourite verified homes and compare them side by side."
            actions={
              <Link href="/listings">
                <Button size="lg">
                  Browse listings
                  <ArrowRight />
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-space-lg sm:grid-cols-2 xl:grid-cols-3">
            {saved.map((row) => (
              <ListingCard
                key={row.id}
                listing={row.listing}
                saveSlot={<SaveButton listingId={row.listing.id} saved signedIn />}
              />
            ))}
          </div>
        )}

        {saved.length === 0 && (
          <section className="rounded-xl border border-border bg-surface p-space-lg text-center">
            <p className="mb-space-sm text-label-sm uppercase tracking-wider text-muted">
              Quick search recommendations across popular Nairobi nodes
            </p>
            <div className="flex flex-wrap items-center justify-center gap-space-xs">
              {QUICK_SEARCHES.map((search) => (
                <Link key={search.label} href={search.href}>
                  <Pill className="border border-border bg-surface text-ink transition-colors hover:bg-brand">
                    <Search className="size-3.5" aria-hidden />
                    {search.label}
                  </Pill>
                </Link>
              ))}
            </div>
          </section>
        )}

        <PriceAlerts alerts={alertRows} />

        <TrustNotice>
          <strong>MoveApp Nairobi tenant protection.</strong> Never transfer viewing fees — a
          &ldquo;gate pass&rdquo; or &ldquo;booking fee&rdquo; — through M-Pesa to unregistered
          numbers before physical entry. Every landlord here follows verified tenancy checks in line
          with the Rent Restriction Act.
        </TrustNotice>
      </div>
    </SiteShell>
  );
}
