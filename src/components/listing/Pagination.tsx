import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ListingFilters } from "@/lib/queries/listings";
import { buildListingHref } from "@/lib/search-params";
import { cn } from "@/lib/cn";

/** Prev / numbered pages with an ellipsis / Next — the pager on screen 04. */
export function Pagination({
  filters,
  page,
  pageCount,
}: {
  filters: ListingFilters;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const href = (p: number) => buildListingHref({ ...filters, page: p });

  return (
    <nav className="flex items-center gap-space-xs" aria-label="Pagination">
      <PageLink href={href(page - 1)} disabled={page <= 1}>
        <ArrowLeft className="size-4" aria-hidden />
        Prev
      </PageLink>

      {pageNumbers(page, pageCount).map((entry, i) =>
        entry === "…" ? (
          <span key={`gap-${i}`} className="px-space-2xs text-muted-subtle" aria-hidden>
            …
          </span>
        ) : (
          <PageLink key={entry} href={href(entry)} current={entry === page}>
            {entry}
          </PageLink>
        ),
      )}

      <PageLink href={href(page + 1)} disabled={page >= pageCount}>
        Next
        <ArrowRight className="size-4" aria-hidden />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  current,
  disabled,
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
}) {
  const className = cn(
    "inline-flex h-9 min-w-9 items-center justify-center gap-space-2xs rounded-lg border px-space-sm text-label-sm transition-colors",
    current
      ? "border-brand bg-brand text-ink"
      : "border-border bg-surface text-ink hover:bg-surface-low",
    disabled && "pointer-events-none opacity-40",
  );

  if (disabled) {
    return (
      <span className={className} aria-disabled>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}

/** 1 … 4 5 6 … 12 — always shows first, last, and the window around current. */
function pageNumbers(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);

  const out: (number | "…")[] = [];
  let previous = 0;
  for (const p of sorted) {
    if (previous && p - previous > 1) out.push("…");
    out.push(p);
    previous = p;
  }
  return out;
}
