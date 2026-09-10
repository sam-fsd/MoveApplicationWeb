import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, Home, Map, Search, TriangleAlert } from "lucide-react";

import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { ESTATES } from "@/lib/constants";
import { buildListingHref } from "@/lib/search-params";

export const metadata = { title: "Page not found" };

/** Screen 24. */
export default function NotFound() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-surface">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-brand/15 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-container-max flex-col items-center gap-space-lg px-gutter-mobile py-space-3xl text-center lg:px-gutter-desktop">
          <Pill>
            <span className="size-1.5 rounded-full bg-warning" aria-hidden />
            404 Listing Status • Unoccupied
            <span className="ml-space-2xs rounded bg-surface-container px-space-2xs text-caption text-muted">
              REF: ERR-NAIROBI-EMPTY
            </span>
          </Pill>

          <Image
            src="/illustrations/404-house-missing-door.png"
            alt=""
            width={320}
            height={268}
            className="h-56 w-auto"
            priority
          />

          <h1 className="max-w-2xl text-headline-xl-mobile md:text-headline-xl">
            This door leads to <span className="text-brand-strong">nowhere</span>
          </h1>

          <p className="max-w-xl text-body-lg text-muted">
            The rental unit or page you are looking for might have been moved, leased out, or never
            existed in the Nairobi registry. Let&apos;s get you back to safe, verified homes with
            zero viewing fees.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-space-sm">
            <Link href="/listings">
              <Button size="lg">
                <Search />
                Back to listings
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="secondary">
                <Map />
                Search Nairobi estates
              </Button>
            </Link>
          </div>

          <div className="space-y-space-sm pt-space-md">
            <p className="text-label-sm uppercase tracking-wider text-muted">
              Popular safe-rent neighbourhoods
            </p>
            <div className="flex flex-wrap items-center justify-center gap-space-xs">
              {ESTATES.slice(0, 5).map((estate) => (
                <Link key={estate} href={buildListingHref({ estate })}>
                  <Pill className="border border-border bg-surface text-ink transition-colors hover:bg-brand">
                    {estate}
                  </Pill>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-container-max px-gutter-mobile py-space-2xl lg:px-gutter-desktop">
        <div className="mb-space-lg flex flex-wrap items-end justify-between gap-space-md">
          <div>
            <p className="text-label-sm uppercase tracking-wider text-brand-strong">
              Need direction?
            </p>
            <h2 className="mt-space-2xs text-headline-md">Verified homes open right now</h2>
          </div>
          <Link
            href="/listings"
            className="flex items-center gap-space-2xs text-label-md text-ink hover:text-brand-strong"
          >
            Explore all active units
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-space-lg md:grid-cols-3">
          <RouteCard
            href={buildListingHref({ bedrooms: [1, 2] })}
            tag="Instant Move-in"
            icon={<Building2 />}
            tone="success"
            title="1 & 2 Bed Apartments"
            body="Kilimani, Kileleshwa, Parklands and Westlands with prepaid tokens and backup water."
            footer="From Ksh 17,000 / mo"
          />
          <RouteCard
            href={buildListingHref({ houseTypes: ["BEDSITTER", "STUDIO"] })}
            tag="Budget Direct"
            icon={<Home />}
            tone="brand"
            title="Bedsitters & Studios"
            body="Ruaka, Roysambu, Kasarani and Rongai vetted for high-speed fibre and reliable security."
            footer="From Ksh 8,500 / mo"
          />
          <RouteCard
            href="/listings"
            tag="Tenant Protection"
            icon={<TriangleAlert />}
            tone="danger"
            title="Reported a fake agent?"
            body="If a link asked you for upfront viewing fees via M-Pesa, flag it directly with the MoveApp Trust Desk."
            footer="Report scam link to compliance"
            footerTone="danger"
          />
        </div>
      </section>
    </SiteShell>
  );
}

function RouteCard({
  href,
  tag,
  icon,
  tone,
  title,
  body,
  footer,
  footerTone,
}: {
  href: string;
  tag: string;
  icon: React.ReactNode;
  tone: "success" | "brand" | "danger";
  title: string;
  body: string;
  footer: string;
  footerTone?: "danger";
}) {
  const iconTone = {
    success: "bg-success-bg text-success",
    brand: "bg-brand-subtle text-brand-strong",
    danger: "bg-danger-bg text-danger",
  }[tone];

  return (
    <Link
      href={href}
      className="group flex flex-col gap-space-sm rounded-xl border border-border bg-surface p-space-lg transition-shadow hover:shadow-raised"
    >
      <div className="flex items-start justify-between gap-space-sm">
        <span className={`flex size-10 items-center justify-center rounded-lg [&_svg]:size-5 ${iconTone}`}>
          {icon}
        </span>
        <Pill>{tag}</Pill>
      </div>
      <h3 className="text-headline-sm">{title}</h3>
      <p className="text-body-md text-muted">{body}</p>
      <p
        className={`mt-auto flex items-center justify-between gap-space-sm pt-space-sm text-label-md ${
          footerTone === "danger" ? "text-danger" : "text-ink"
        }`}
      >
        {footer}
        {footerTone === "danger" ? (
          <ArrowUpRight className="size-4" aria-hidden />
        ) : (
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        )}
      </p>
    </Link>
  );
}
