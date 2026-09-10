import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Flag,
  Gavel,
  Home,
  MessageSquare,
  PhoneCall,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  Zap,
} from "lucide-react";

import { HeroSearch } from "@/components/home/HeroSearch";
import { SiteShell } from "@/components/layout/SiteShell";
import { ListingCard } from "@/components/listing/ListingCard";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { ESTATES } from "@/lib/constants";
import { formatCount, formatKesCompact } from "@/lib/format";
import { findListings } from "@/lib/queries/listings";
import { buildListingHref } from "@/lib/search-params";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    number: "01",
    icon: <SlidersHorizontal />,
    title: "Search by area & budget",
    body: "Filter specifically by your workplace commute, preferred estate, and exact rent ceiling without agent guesswork or bait-and-switch pricing.",
    proof: "Real photos only, no renderings",
  },
  {
    number: "02",
    icon: <ShieldCheck />,
    title: "View verified listings",
    body: "Every apartment comes with genuine photos, exact rental terms, borehole and power status, and admin-checked ownership before going live.",
    proof: "Title deed & ID cross-verified",
  },
  {
    number: "03",
    icon: <MessageSquare />,
    title: "Contact the owner directly",
    body: "Chat via WhatsApp or call the verified landlord directly. No middleman extortion, zero illegal viewing fees, and seamless key handover.",
    proof: "Zero viewing fees guaranteed",
  },
];

const PILLARS = [
  {
    icon: <BadgeCheck />,
    title: "Strict Admin Vetting",
    body: "We inspect National IDs and ownership records before account approval.",
  },
  {
    icon: <PhoneCall />,
    title: "Direct Contact",
    body: "Connect straight to the actual caretakers and landlords who hold the keys.",
  },
  {
    icon: <Flag />,
    title: "Fast Reporting",
    body: "One-click flag instantly routes questionable listings to our Nairobi ops desk.",
  },
];

export default async function HomePage() {
  const [featured, publishedCount, cheapest] = await Promise.all([
    findListings({ sort: "newest", perPage: 6 }),
    db.listing.count({ where: { status: "PUBLISHED" } }),
    db.listing.aggregate({ where: { status: "PUBLISHED" }, _min: { rentKes: true } }),
  ]);

  const hero = featured.listings[0];

  return (
    <SiteShell>
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto max-w-container-max px-gutter-mobile pb-space-2xl pt-space-xl lg:px-gutter-desktop">
          <div className="grid items-center gap-space-xl lg:grid-cols-12">
            <div className="flex flex-col gap-space-md lg:col-span-7">
              <Pill tone="warning" className="self-start">
                <ShieldCheck className="size-4" aria-hidden />
                Kenya&apos;s #1 Anti-Fraud Rental Platform
              </Pill>

              <h1 className="text-headline-xl-mobile text-ink md:text-headline-xl">
                Find your next rental in Kenya without{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">walking estate to estate.</span>
                  <span
                    className="absolute inset-x-0 bottom-1 z-0 h-3 rounded-sm bg-brand/80"
                    aria-hidden
                  />
                </span>
              </h1>

              <p className="max-w-xl text-body-lg text-muted">
                MoveApp connects you directly with admin-verified landlords and registered agents
                across Nairobi. Zero unverified viewing fees, zero phantom listings.
              </p>

              <ul className="flex flex-wrap items-center gap-space-lg pt-space-2xs text-label-sm text-muted">
                {["100% ID Verified", "Zero Middleman Con", "Direct WhatsApp Contact"].map((item) => (
                  <li key={item} className="flex items-center gap-space-2xs">
                    <CheckCircle2 className="size-4 text-success" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {hero && (
              <div className="relative lg:col-span-5">
                <div className="relative overflow-hidden rounded-xl bg-surface shadow-raised">
                  <Image
                    src={hero.images[0]?.url ?? "/seed/listings/apartment-interior-warm.png"}
                    alt=""
                    width={640}
                    height={400}
                    className="h-[320px] w-full object-cover lg:h-[400px]"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />

                  <Link
                    href={`/listings/${hero.id}`}
                    className="absolute inset-x-space-md bottom-space-md flex items-center justify-between gap-space-sm rounded-xl bg-surface/95 p-space-sm shadow-card backdrop-blur-sm"
                  >
                    <span className="flex min-w-0 items-center gap-space-sm">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
                        <Home className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-label-md text-ink">{hero.title}</span>
                        <span className="block truncate text-body-sm text-muted">
                          {hero.estate}, Nairobi • Ready for move-in
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-display text-price-listing text-ink">
                        {formatKesCompact(hero.rentKes)}
                      </span>
                      <span className="block text-caption text-muted">/month</span>
                    </span>
                  </Link>
                </div>

                <Pill tone="brand" className="absolute -right-2 -top-3 shadow-raised">
                  <Zap className="size-4" aria-hidden />
                  Updated 12m ago
                </Pill>
              </div>
            )}
          </div>

          <div className="mt-space-xl">
            <HeroSearch />
            <div className="mt-space-sm flex flex-wrap items-center gap-x-space-md gap-y-space-2xs text-body-sm text-muted">
              <span className="flex items-center gap-space-2xs">
                <CheckCircle2 className="size-4 text-success" aria-hidden />
                {formatCount(publishedCount)} verified Nairobi listings, updated daily
              </span>
              <span aria-hidden>•</span>
              <span>100% Free for tenants to browse and call</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular estates */}
      <section className="border-y border-border bg-bg">
        <div className="mx-auto flex max-w-container-max flex-wrap items-center gap-space-xs px-gutter-mobile py-space-md lg:px-gutter-desktop">
          <span className="flex items-center gap-space-2xs text-label-sm text-ink">
            <TrendingUp className="size-4 text-brand-strong" aria-hidden />
            Popular right now:
          </span>
          {ESTATES.map((estate) => (
            <Link key={estate} href={buildListingHref({ estate })}>
              <Pill className="transition-colors hover:bg-brand hover:text-ink">{estate}</Pill>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-container-max px-gutter-mobile py-space-2xl lg:px-gutter-desktop">
        <div className="mb-space-lg flex flex-wrap items-end justify-between gap-space-md">
          <div>
            <p className="flex items-center gap-space-2xs text-label-sm uppercase tracking-wider text-success">
              <BadgeCheck className="size-4" aria-hidden />
              Zero Phantom Listings
            </p>
            <h2 className="mt-space-2xs text-headline-lg-mobile md:text-headline-lg">
              Featured Verified Rentals
            </h2>
            <p className="text-body-md text-muted">
              Hand-checked apartments with verified landlords ready for move-in
            </p>
          </div>
          <Link
            href="/listings"
            className="flex items-center gap-space-2xs text-label-md text-ink hover:text-brand-strong"
          >
            View all {formatCount(publishedCount)} rentals
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-space-lg sm:grid-cols-2 lg:grid-cols-3">
          {featured.listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* Three steps */}
      <section id="how" className="scroll-mt-20 bg-surface py-space-3xl">
        <div className="mx-auto max-w-container-max px-gutter-mobile lg:px-gutter-desktop">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-label-sm uppercase tracking-wider text-brand-strong">
              The MoveApp Standard
            </p>
            <h2 className="mt-space-2xs text-headline-lg-mobile md:text-headline-lg">
              Renting made transparent in 3 simple steps
            </h2>
            <p className="mt-space-2xs text-body-md text-muted">
              We stripped away fake agent gatekeepers and phantom listing syndicates to make finding
              a home in Nairobi straightforward.
            </p>
          </div>

          <ol className="mt-space-xl grid gap-space-lg md:grid-cols-3">
            {STEPS.map((step) => (
              <li
                key={step.number}
                className="flex flex-col gap-space-sm rounded-xl border border-border bg-bg p-space-lg"
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-headline-md text-brand-strong">{step.number}</span>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-surface text-ink [&_svg]:size-4">
                    {step.icon}
                  </span>
                </div>
                <h3 className="text-headline-sm">{step.title}</h3>
                <p className="text-body-md text-muted">{step.body}</p>
                <p className="mt-auto flex items-center gap-space-2xs border-t border-border pt-space-sm text-label-sm text-muted">
                  <CheckCircle2 className="size-4 text-success" aria-hidden />
                  {step.proof}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section id="why" className="scroll-mt-20 py-space-3xl">
        <div className="mx-auto max-w-container-max px-gutter-mobile lg:px-gutter-desktop">
          <div className="grid gap-space-xl rounded-xl border border-border bg-surface p-space-lg lg:grid-cols-[1.4fr_1fr] lg:p-space-2xl">
            <div className="space-y-space-md">
              <Pill tone="success">
                <ShieldCheck className="size-4" aria-hidden />
                Institutional Anti-Fraud Vetting
              </Pill>
              <h2 className="text-headline-lg-mobile md:text-headline-lg">
                Why MoveApp is different: Zero fake listings, 100% verified owners.
              </h2>
              <p className="text-body-md text-muted">
                In Nairobi, up to 60% of online rental ads belong to fake brokers demanding
                Ksh 1,000 &ldquo;viewing fees&rdquo; before disappearing. MoveApp is built
                specifically to eradicate this syndication.
              </p>

              <ul className="grid gap-space-sm sm:grid-cols-3">
                {PILLARS.map((pillar) => (
                  <li
                    key={pillar.title}
                    className="rounded-xl border border-border bg-bg p-space-md"
                  >
                    <span className="mb-space-xs flex size-9 items-center justify-center rounded-lg bg-brand-subtle text-brand-strong [&_svg]:size-4">
                      {pillar.icon}
                    </span>
                    <h3 className="text-label-md text-ink">{pillar.title}</h3>
                    <p className="mt-space-2xs text-body-sm text-muted">{pillar.body}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-space-md rounded-xl border border-border bg-bg p-space-lg text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-bg text-success">
                <BadgeCheck className="size-6" aria-hidden />
              </span>
              <p className="text-label-sm uppercase tracking-wider text-success">
                MoveApp Trust Guarantee
              </p>
              <h3 className="text-headline-md">Never Pay Viewing Fees</h3>
              <p className="text-body-md text-muted">
                If any landlord or agent registered on MoveApp asks you for viewing money before
                showing an apartment, report them immediately. We take down their account and
                protect our community.
              </p>
              <p className="mt-auto flex items-center justify-center gap-space-xs rounded-lg border border-border bg-surface px-space-sm py-space-xs text-left">
                <Gavel className="size-4 shrink-0 text-muted" aria-hidden />
                <span>
                  <span className="block text-label-sm text-ink">Kenyan Law Compliant</span>
                  <span className="block text-body-sm text-muted">Cap 301 Landlord &amp; Tenant Act</span>
                </span>
                <BadgeCheck className="ml-auto size-4 shrink-0 text-success" aria-hidden />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Split CTA */}
      <section className="mx-auto max-w-container-max px-gutter-mobile pb-space-3xl lg:px-gutter-desktop">
        <div className="grid gap-space-lg lg:grid-cols-2">
          <div className="flex flex-col gap-space-sm rounded-xl border border-border bg-surface p-space-xl">
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand text-ink">
              <Search className="size-5" aria-hidden />
            </span>
            <p className="text-label-sm uppercase tracking-wider text-muted">For House Hunters</p>
            <h2 className="text-headline-md">Looking for a house?</h2>
            <p className="text-body-md text-muted">
              Explore genuine, scam-free bedsitters, studios, and 1 to 3-bedroom apartments across
              Nairobi right now — from {formatKesCompact(cheapest._min.rentKes ?? 12000)} a month.
              Filter by price, water supply, and security.
            </p>
            <Link href="/listings" className="mt-space-sm self-start">
              <Button size="lg">
                Browse Available Rentals
                <ArrowRight />
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-space-sm rounded-xl bg-ink p-space-xl text-white">
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand text-ink">
              <Scale className="size-5" aria-hidden />
            </span>
            <p className="text-label-sm uppercase tracking-wider text-brand">For Property Owners</p>
            <h2 className="font-display text-headline-md text-white">I have a house to rent out</h2>
            <p className="text-body-md text-white/70">
              Fill your vacancies faster with vetted, serious tenants. Get verified in under 24
              hours, showcase your apartments transparently, and manage enquiries without rogue
              middlemen.
            </p>
            <Link href="/register?role=owner" className="mt-space-sm self-start">
              <Button size="lg" variant="secondary">
                List Your Property Free
                <ArrowUpRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
