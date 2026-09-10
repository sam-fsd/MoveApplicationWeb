import type { HouseType } from "@prisma/client";
import { AMENITIES, ESTATES, HOUSE_TYPES } from "@/lib/constants";
import type { ListingFilters, ListingSort } from "@/lib/queries/listings";

/**
 * Every filter on screen 04 is a URL search param, so state lives in the
 * address bar and a filtered view is shareable and back-button safe. This
 * module is the single place params are named, parsed, and written.
 */

export const PARAM = {
  estate: "estate",
  query: "q",
  minRent: "min",
  maxRent: "max",
  bedrooms: "beds",
  houseTypes: "type",
  amenities: "amenity",
  furnished: "furnished",
  sort: "sort",
  page: "page",
  /** Hero-search shorthand: "15000-30000", "60000-". Expands to min/max. */
  budget: "budget",
} as const;

export const SORT_OPTIONS: { value: ListingSort; label: string }[] = [
  { value: "newest", label: "Newest Listed" },
  { value: "price-asc", label: "Price: Lowest to Highest" },
  { value: "price-desc", label: "Price: Highest to Lowest" },
  { value: "popular", label: "Most Popular" },
];

/** The bedroom filter on screen 04. 0 is "Bedsitter", 4 means four or more. */
export const BEDROOM_OPTIONS = [
  { value: 0, label: "Bedsitter" },
  { value: 1, label: "1 Bed" },
  { value: 2, label: "2 Beds" },
  { value: 3, label: "3 Beds" },
  { value: 4, label: "4+ Beds" },
];

export const RENT_FLOOR = 5000;
export const RENT_CEILING = 150000;

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** `"15000-30000"` -> `[15000, 30000]`; `"60000-"` -> `[60000, undefined]`. */
function parseBudget(value: string | undefined): [number | undefined, number | undefined] {
  if (!value) return [undefined, undefined];
  const [lo, hi] = value.split("-");
  const min = lo ? Number.parseInt(lo, 10) : NaN;
  const max = hi ? Number.parseInt(hi, 10) : NaN;
  return [Number.isFinite(min) && min > 0 ? min : undefined, Number.isFinite(max) ? max : undefined];
}

function all(params: RawSearchParams, key: string): string[] {
  const value = params[key];
  if (value === undefined) return [];
  const list = Array.isArray(value) ? value : [value];
  // Accept both repeated params and comma-joined ones.
  return list.flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean);
}

function one(params: RawSearchParams, key: string): string | undefined {
  return all(params, key)[0];
}

function int(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

const VALID_TYPES = new Set(HOUSE_TYPES.map((t) => t.value));
const VALID_ESTATES = new Set<string>(ESTATES);
const VALID_AMENITIES = new Set<string>(AMENITIES);
const VALID_SORTS = new Set(SORT_OPTIONS.map((s) => s.value));

/**
 * Unknown or malformed values are dropped rather than rejected — a hand-edited
 * URL should degrade to a broader search, never to an error page.
 */
export function parseListingFilters(params: RawSearchParams): ListingFilters {
  const estate = one(params, PARAM.estate);
  const sort = one(params, PARAM.sort);
  const furnished = one(params, PARAM.furnished);

  const bedrooms = all(params, PARAM.bedrooms)
    .map((v) => Number.parseInt(v, 10))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 4);

  const houseTypes = all(params, PARAM.houseTypes).filter((t): t is HouseType =>
    VALID_TYPES.has(t as HouseType),
  );

  const amenities = all(params, PARAM.amenities).filter((a) => VALID_AMENITIES.has(a));

  // The hero search sends one `budget` range; the sidebar sends min/max
  // directly. Explicit min/max wins where both are present.
  const [budgetMin, budgetMax] = parseBudget(one(params, PARAM.budget));
  const minRent = int(one(params, PARAM.minRent)) ?? budgetMin;
  const maxRent = int(one(params, PARAM.maxRent)) ?? budgetMax;

  return {
    estate: estate && VALID_ESTATES.has(estate) ? estate : undefined,
    query: one(params, PARAM.query) || undefined,
    minRent: minRent !== undefined && minRent > RENT_FLOOR ? minRent : undefined,
    maxRent: maxRent !== undefined && maxRent < RENT_CEILING ? maxRent : undefined,
    bedrooms: bedrooms.length ? [...new Set(bedrooms)] : undefined,
    houseTypes: houseTypes.length ? [...new Set(houseTypes)] : undefined,
    amenities: amenities.length ? [...new Set(amenities)] : undefined,
    furnished: furnished === "1" ? true : undefined,
    sort: sort && VALID_SORTS.has(sort as ListingSort) ? (sort as ListingSort) : "newest",
    page: Math.max(1, int(one(params, PARAM.page)) ?? 1),
  };
}

/** Writes filters back to a query string. Defaults are omitted to keep URLs short. */
export function buildListingHref(filters: ListingFilters, base = "/listings"): string {
  const search = new URLSearchParams();

  if (filters.estate) search.set(PARAM.estate, filters.estate);
  if (filters.query) search.set(PARAM.query, filters.query);
  if (filters.minRent !== undefined) search.set(PARAM.minRent, String(filters.minRent));
  if (filters.maxRent !== undefined) search.set(PARAM.maxRent, String(filters.maxRent));
  for (const b of filters.bedrooms ?? []) search.append(PARAM.bedrooms, String(b));
  for (const t of filters.houseTypes ?? []) search.append(PARAM.houseTypes, t);
  for (const a of filters.amenities ?? []) search.append(PARAM.amenities, a);
  if (filters.furnished) search.set(PARAM.furnished, "1");
  if (filters.sort && filters.sort !== "newest") search.set(PARAM.sort, filters.sort);
  if (filters.page && filters.page > 1) search.set(PARAM.page, String(filters.page));

  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

/** A copy of `filters` with one thing removed — powers the active-filter chips. */
export function withoutFilter(
  filters: ListingFilters,
  key: keyof ListingFilters,
  value?: string | number,
): ListingFilters {
  const next: ListingFilters = { ...filters, page: 1 };

  if (value === undefined) {
    delete next[key];
    return next;
  }

  switch (key) {
    case "bedrooms":
      next.bedrooms = next.bedrooms?.filter((b) => b !== value);
      if (!next.bedrooms?.length) delete next.bedrooms;
      break;
    case "houseTypes":
      next.houseTypes = next.houseTypes?.filter((t) => t !== value);
      if (!next.houseTypes?.length) delete next.houseTypes;
      break;
    case "amenities":
      next.amenities = next.amenities?.filter((a) => a !== value);
      if (!next.amenities?.length) delete next.amenities;
      break;
    default:
      delete next[key];
  }
  return next;
}

/** How many filters are active — the count badge on the Filters button. */
export function countActiveFilters(filters: ListingFilters): number {
  return (
    (filters.estate ? 1 : 0) +
    (filters.query ? 1 : 0) +
    (filters.minRent !== undefined || filters.maxRent !== undefined ? 1 : 0) +
    (filters.bedrooms?.length ?? 0) +
    (filters.houseTypes?.length ?? 0) +
    (filters.amenities?.length ?? 0) +
    (filters.furnished ? 1 : 0)
  );
}

export interface ActiveChip {
  label: string;
  href: string;
}

/** The "ACTIVE:" chip row under the toolbar on screen 04. */
export function activeFilterChips(filters: ListingFilters): ActiveChip[] {
  const chips: ActiveChip[] = [];
  const link = (f: ListingFilters) => buildListingHref(f);

  if (filters.estate) {
    chips.push({ label: filters.estate, href: link(withoutFilter(filters, "estate")) });
  }
  if (filters.query) {
    chips.push({ label: `“${filters.query}”`, href: link(withoutFilter(filters, "query")) });
  }
  if (filters.minRent !== undefined || filters.maxRent !== undefined) {
    const min = filters.minRent ?? RENT_FLOOR;
    const max = filters.maxRent ?? RENT_CEILING;
    const cleared = withoutFilter(withoutFilter(filters, "minRent"), "maxRent");
    chips.push({
      label: `Ksh ${Math.round(min / 1000)}k – ${Math.round(max / 1000)}k`,
      href: link(cleared),
    });
  }
  for (const b of filters.bedrooms ?? []) {
    const label = BEDROOM_OPTIONS.find((o) => o.value === b)?.label ?? `${b} Beds`;
    chips.push({ label, href: link(withoutFilter(filters, "bedrooms", b)) });
  }
  for (const t of filters.houseTypes ?? []) {
    const label = HOUSE_TYPES.find((o) => o.value === t)?.plural ?? t;
    chips.push({ label, href: link(withoutFilter(filters, "houseTypes", t)) });
  }
  for (const a of filters.amenities ?? []) {
    chips.push({ label: a, href: link(withoutFilter(filters, "amenities", a)) });
  }
  if (filters.furnished) {
    chips.push({ label: "Furnished", href: link(withoutFilter(filters, "furnished")) });
  }
  return chips;
}
