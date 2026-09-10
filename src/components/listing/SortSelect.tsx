"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import type { ListingSort } from "@/lib/queries/listings";
import { SORT_OPTIONS } from "@/lib/search-params";

/**
 * The only client component on the listings page. Sorting is a navigation, so
 * it changes the URL rather than holding state — everything else on the page
 * stays a server render.
 */
export function SortSelect({ value, hrefFor }: { value: ListingSort; hrefFor: Record<string, string> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <span className="relative inline-flex items-center">
      <label htmlFor="sort" className="sr-only">
        Sort listings
      </label>
      <select
        id="sort"
        value={value}
        disabled={pending}
        onChange={(event) => {
          const href = hrefFor[event.target.value];
          if (href) startTransition(() => router.push(href));
        }}
        className="h-10 appearance-none rounded-lg border border-border bg-surface pl-space-sm pr-8 text-label-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/10 disabled:opacity-60"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            Sort by: {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-space-xs size-4 text-muted"
        aria-hidden
      />
    </span>
  );
}
