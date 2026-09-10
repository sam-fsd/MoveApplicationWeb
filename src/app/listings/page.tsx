import Link from "next/link";
import { BellPlus, LayoutGrid, ShieldCheck, X } from "lucide-react";

import { SiteShell } from "@/components/layout/SiteShell";
import { TopBarSearch } from "@/components/layout/TopBar";
import { FilterSidebar } from "@/components/listing/FilterSidebar";
import { ListingCard } from "@/components/listing/ListingCard";
import { Pagination } from "@/components/listing/Pagination";
import { SaveButton } from "@/components/listing/SaveButton";
import { SortSelect } from "@/components/listing/SortSelect";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { TrustNotice } from "@/components/ui/TrustNotice";
import { ESTATES } from "@/lib/constants";
import { formatCount, formatKes } from "@/lib/format";
import { countListingsByHouseType, findListings } from "@/lib/queries/listings";
import { getSavedListingIds } from "@/lib/queries/notifications";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  SORT_OPTIONS,
  activeFilterChips,
  buildListingHref,
  countActiveFilters,
  parseListingFilters,
  type RawSearchParams,
} from "@/lib/search-params";

export const dynamic = "force-dynamic";

export const metadata = { title: "Browse verified rentals" };

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const filters = parseListingFilters(await searchParams);

  const user = await getCurrentUser();
  const [page, typeCounts, savedIds] = await Promise.all([
    findListings(filters),
    countListingsByHouseType(filters),
    user ? getSavedListingIds(user.id) : Promise.resolve(new Set<string>()),
  ]);

  const chips = activeFilterChips(filters);
  const activeCount = countActiveFilters(filters);
  const heading = filters.estate ? `Rentals in ${filters.estate}, Nairobi` : "Verified rentals in Nairobi";

  const sortHrefs = Object.fromEntries(
    SORT_OPTIONS.map((option) => [option.value, buildListingHref({ ...filters, sort: option.value, page: 1 })]),
  );

  return (
    <SiteShell searchSlot={<TopBarSearch defaultValue={filters.query} />}>
      <div className="mx-auto max-w-container-max px-gutter-mobile py-space-lg lg:px-gutter-desktop">
        {/* Estate quick-jump, mirroring the pill row on the landing page */}
        <div className="mb-space-lg flex flex-wrap items-center gap-space-xs">
          <Link href={buildListingHref({ ...filters, estate: undefined, page: 1 })}>
            <Pill tone={filters.estate ? "neutral" : "brand"}>All estates</Pill>
          </Link>
          {ESTATES.map((estate) => (
            <Link key={estate} href={buildListingHref({ ...filters, estate, page: 1 })}>
              <Pill tone={filters.estate === estate ? "brand" : "neutral"}>{estate}</Pill>
            </Link>
          ))}
        </div>

        <div className="grid gap-space-lg lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <FilterSidebar filters={filters} typeCounts={typeCounts} resultCount={page.total} />
          </aside>

          <section>
            {/* Toolbar */}
            <div className="mb-space-md flex flex-wrap items-end justify-between gap-space-md">
              <div>
                <h1 className="flex flex-wrap items-center gap-space-xs text-headline-lg-mobile md:text-headline-lg">
                  {heading}
                  <Pill tone="success">{formatCount(page.total)} Found</Pill>
                </h1>
                <p className="mt-space-2xs flex items-center gap-space-2xs text-body-sm text-muted">
                  <span className="size-1.5 rounded-full bg-success" aria-hidden />
                  Live availability • Verified by MoveApp within 48h
                </p>
              </div>

              <div className="flex items-center gap-space-xs">
                <SortSelect value={filters.sort ?? "newest"} hrefFor={sortHrefs} />
                <Pill className="hidden h-10 items-center sm:inline-flex">
                  <LayoutGrid className="size-4" aria-hidden />
                  Grid
                </Pill>
              </div>
            </div>

            {/* Active filter chips */}
            {chips.length > 0 && (
              <div className="mb-space-md flex flex-wrap items-center gap-space-xs">
                <span className="text-caption uppercase tracking-wider text-muted">
                  Active ({activeCount}):
                </span>
                {chips.map((chip) => (
                  <Link key={chip.label} href={chip.href} className="group">
                    <Pill className="transition-colors group-hover:bg-danger-bg group-hover:text-danger">
                      {chip.label}
                      <X className="size-3.5" aria-hidden />
                      <span className="sr-only">Remove filter</span>
                    </Pill>
                  </Link>
                ))}
                <Link href="/listings" className="text-label-sm text-danger hover:underline">
                  Clear all tags
                </Link>
              </div>
            )}

            {page.listings.length === 0 ? (
              <NoResults filters={filters} />
            ) : (
              <>
                <div className="grid gap-space-lg sm:grid-cols-2 xl:grid-cols-3">
                  {page.listings.map((listing) => (
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

                <div className="mt-space-lg flex flex-wrap items-center justify-between gap-space-md rounded-xl border border-border bg-surface px-space-lg py-space-md">
                  <p className="text-body-md text-muted">
                    Showing{" "}
                    <strong className="text-ink">
                      {(page.page - 1) * page.perPage + 1}–
                      {Math.min(page.page * page.perPage, page.total)}
                    </strong>{" "}
                    of <strong className="text-ink">{formatCount(page.total)}</strong> verified
                    rentals
                  </p>
                  <Pagination filters={filters} page={page.page} pageCount={page.pageCount} />
                </div>

                <TrustNotice className="mt-space-lg px-space-lg py-space-md">
                  <strong className="text-success">MoveApp Kenya Renter Guarantee.</strong> Every
                  listing here comes from an admin-verified owner whose title deed and ID have been
                  checked. We enforce a strict zero viewing fee policy across Nairobi.
                </TrustNotice>
              </>
            )}
          </section>
        </div>
      </div>
    </SiteShell>
  );
}

/**
 * Screen 05. The illustration, the reason the search failed, and two ways
 * forward — clear the filters, or be told when something matching appears.
 * Nearby alternatives come from real rows so the page is never a dead end.
 */
async function NoResults({ filters }: { filters: Awaited<ReturnType<typeof parseListingFilters>> }) {
  const estate = filters.estate;

  const [nearby, band] = await Promise.all([
    findListings({ estate: undefined, sort: "newest", perPage: 3 }),
    estate
      ? db.listing.aggregate({
          where: { status: "PUBLISHED", estate },
          _avg: { rentKes: true },
          _count: { _all: true },
        })
      : Promise.resolve(null),
  ]);

  const average = band?._avg.rentKes ? Math.round(band._avg.rentKes) : null;

  return (
    <div className="space-y-space-xl">
      <EmptyState
        illustration="/illustrations/empty-search-results-map.png"
        title={estate ? `No houses match these filters in ${estate}` : "No houses match these filters"}
        description={
          average
            ? `Verified units in ${estate} average ${formatKes(average)} a month across ${band?._count._all} listings. Try raising your ceiling, relaxing the bedroom count, or looking at a nearby estate.`
            : "Nothing matches this combination right now. Try widening the budget, relaxing the bedroom count, or clearing a filter or two."
        }
        actions={
          <>
            <Link href="/listings">
              <Button variant="secondary">Clear filters</Button>
            </Link>
            <Link href="/saved">
              <Button>
                <BellPlus />
                {estate ? `Set a ${estate} price alert` : "Create a price alert"}
              </Button>
            </Link>
          </>
        }
      />

      <p className="flex items-center justify-center gap-space-2xs text-body-sm text-muted">
        <ShieldCheck className="size-4 text-success" aria-hidden />
        We will alert you when a verified match is published. Zero agent commissions, always.
      </p>

      {nearby.listings.length > 0 && (
        <section>
          <div className="mb-space-md flex flex-wrap items-end justify-between gap-space-md">
            <div>
              <p className="text-label-sm uppercase tracking-wider text-brand-strong">
                Nearby alternatives
              </p>
              <h2 className="mt-space-2xs text-headline-md">Popular verified homes nearby</h2>
            </div>
            <Link href="/listings" className="text-label-md text-ink hover:text-brand-strong">
              View all verified rentals →
            </Link>
          </div>
          <div className="grid gap-space-lg sm:grid-cols-2 xl:grid-cols-3">
            {nearby.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
