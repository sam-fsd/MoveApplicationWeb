import Link from "next/link";
import { BadgeCheck, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Label } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { AMENITIES, HOUSE_TYPES } from "@/lib/constants";
import type { ListingFilters } from "@/lib/queries/listings";
import {
  BEDROOM_OPTIONS,
  PARAM,
  RENT_CEILING,
  RENT_FLOOR,
} from "@/lib/search-params";
import { cn } from "@/lib/cn";

/**
 * The Refine Rentals panel on screen 04. A plain GET form, so filtering works
 * without JavaScript and every result set is a shareable URL. Sort and page are
 * carried as hidden fields so applying a filter does not silently reset them.
 */
export function FilterSidebar({
  filters,
  typeCounts,
  resultCount,
}: {
  filters: ListingFilters;
  typeCounts: Record<string, number>;
  resultCount: number;
}) {
  return (
    <form
      action="/listings"
      className="flex flex-col gap-space-lg rounded-xl border border-border bg-surface p-space-lg"
    >
      {filters.estate && <input type="hidden" name={PARAM.estate} value={filters.estate} />}
      {filters.query && <input type="hidden" name={PARAM.query} value={filters.query} />}
      {filters.sort && filters.sort !== "newest" && (
        <input type="hidden" name={PARAM.sort} value={filters.sort} />
      )}

      <div className="flex items-center justify-between gap-space-sm">
        <h2 className="flex items-center gap-space-xs text-headline-sm">
          <SlidersHorizontal className="size-4" aria-hidden />
          Refine Rentals
        </h2>
        <Link href="/listings" className="text-label-sm text-muted hover:text-ink">
          Clear all
        </Link>
      </div>

      <Group title="Monthly Rent (KES)" aside="Verified deposits">
        <div className="grid grid-cols-2 gap-space-sm">
          <div>
            <Label htmlFor="min-rent" className="text-caption uppercase tracking-wider text-muted">
              Min Rent
            </Label>
            <RentInput id="min-rent" name={PARAM.minRent} value={filters.minRent} placeholder={RENT_FLOOR} />
          </div>
          <div>
            <Label htmlFor="max-rent" className="text-caption uppercase tracking-wider text-muted">
              Max Rent
            </Label>
            <RentInput id="max-rent" name={PARAM.maxRent} value={filters.maxRent} placeholder={RENT_CEILING} />
          </div>
        </div>
        <p className="mt-space-xs flex justify-between text-caption text-muted-subtle">
          <span>KES {RENT_FLOOR / 1000}k</span>
          <span>KES {RENT_CEILING / 1000}k+</span>
        </p>
      </Group>

      <Group title="Bedrooms">
        <div className="flex flex-wrap gap-space-xs">
          {BEDROOM_OPTIONS.map((option) => {
            const checked = filters.bedrooms?.includes(option.value) ?? false;
            return (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="checkbox"
                  name={PARAM.bedrooms}
                  value={option.value}
                  defaultChecked={checked}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "inline-flex h-9 items-center rounded-lg border px-space-sm text-label-sm transition-colors",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-ink/20",
                    checked
                      ? "border-brand bg-brand text-ink"
                      : "border-border bg-surface text-ink hover:bg-surface-low",
                  )}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </Group>

      <Group title="House Type" aside="Nairobi Urban">
        {HOUSE_TYPES.map((type) => (
          <Checkbox
            key={type.value}
            name={PARAM.houseTypes}
            value={type.value}
            label={type.plural}
            count={typeCounts[type.value] ?? 0}
            defaultChecked={filters.houseTypes?.includes(type.value) ?? false}
          />
        ))}
      </Group>

      <Group title="Crucial Utilities" aside="Reliability Checked">
        {AMENITIES.map((amenity) => (
          <Checkbox
            key={amenity}
            name={PARAM.amenities}
            value={amenity}
            label={amenity}
            defaultChecked={filters.amenities?.includes(amenity) ?? false}
          />
        ))}
        <Checkbox
          name={PARAM.furnished}
          value="1"
          label="Furnished only"
          defaultChecked={filters.furnished ?? false}
        />
      </Group>

      <p className="flex items-start gap-space-xs rounded-lg bg-success-bg px-space-sm py-space-xs text-body-sm text-success">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        Physical title deed checked and safe deposit guaranteed. Every owner here is admin-verified.
      </p>

      <Button type="submit" size="lg" className="w-full">
        Apply Filters
        <Pill tone="ink" className="ml-space-2xs">
          {resultCount} {resultCount === 1 ? "Result" : "Results"}
        </Pill>
      </Button>
    </form>
  );
}

function Group({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-t border-border pt-space-md first-of-type:border-t-0 first-of-type:pt-0">
      <legend className="sr-only">{title}</legend>
      <div className="mb-space-sm flex items-baseline justify-between gap-space-sm">
        <h3 className="text-label-md text-ink">{title}</h3>
        {aside && (
          <span className="flex items-center gap-space-2xs text-caption text-success">
            <BadgeCheck className="size-3.5" aria-hidden />
            {aside}
          </span>
        )}
      </div>
      {children}
    </fieldset>
  );
}

function RentInput({
  id,
  name,
  value,
  placeholder,
}: {
  id: string;
  name: string;
  value?: number;
  placeholder: number;
}) {
  return (
    <span className="flex h-10 min-w-0 items-center gap-space-2xs rounded-lg border border-border bg-surface px-space-sm focus-within:ring-2 focus-within:ring-ink/10">
      <span className="text-body-sm text-muted-subtle">Ksh</span>
      <input
        id={id}
        name={name}
        type="number"
        inputMode="numeric"
        min={0}
        step={1000}
        defaultValue={value ?? ""}
        placeholder={placeholder.toLocaleString("en-KE")}
        className="w-full min-w-0 bg-transparent text-body-md text-ink placeholder:text-muted-subtle focus:outline-none"
      />
    </span>
  );
}
