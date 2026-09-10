import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { ESTATES, HOUSE_TYPES, TRUST_COPY } from "@/lib/constants";
import { buildListingHref } from "@/lib/search-params";

/**
 * The designs carry three footer variants. This follows screen 01's columns —
 * Popular Estates / Property Types / Company & Trust — because those two
 * columns are real links into filtered searches, where the other variants'
 * columns are mostly pages this project does not build.
 */
export function Footer() {
  return (
    <footer className="mt-space-3xl border-t border-border bg-surface">
      <div className="mx-auto grid max-w-container-max gap-space-xl px-gutter-mobile py-space-2xl lg:grid-cols-4 lg:px-gutter-desktop">
        <div className="space-y-space-sm">
          <Logo href={null} />
          <p className="max-w-xs text-body-sm text-muted">
            Direct verified landlords in Nairobi. Zero fake agent fees, authentic neighbourhood
            scans, and guaranteed transparent leases.
          </p>
          <p className="flex items-center gap-space-2xs text-label-sm text-success">
            <BadgeCheck className="size-4" aria-hidden />
            100% Anti-Fraud Verified
          </p>
        </div>

        <FooterColumn title="Popular Estates">
          {ESTATES.slice(0, 6).map((estate) => (
            <FooterLink key={estate} href={buildListingHref({ estate })}>
              {estate}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Property Types">
          {HOUSE_TYPES.map((type) => (
            <FooterLink key={type.value} href={buildListingHref({ houseTypes: [type.value] })}>
              {type.plural}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Company & Trust">
          <FooterLink href="/#why">Verification Process</FooterLink>
          <FooterLink href="/#why">Report a Listing</FooterLink>
          <FooterLink href="/#why">Safety Tips</FooterLink>
          <FooterLink href="/register?role=owner">List a House</FooterLink>
          <FooterLink href="/login">Sign In</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-container-max flex-col gap-space-2xs px-gutter-mobile py-space-md text-body-sm text-muted lg:flex-row lg:items-center lg:justify-between lg:px-gutter-desktop">
          <p>© {new Date().getFullYear()} MoveApp Kenya. All rights reserved. Made for Kenya with trust.</p>
          <p>{TRUST_COPY.compliance}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-space-sm text-label-sm uppercase tracking-wider text-ink">{title}</h2>
      <ul className="space-y-space-xs">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-body-md text-muted transition-colors hover:text-ink">
        {children}
      </Link>
    </li>
  );
}
