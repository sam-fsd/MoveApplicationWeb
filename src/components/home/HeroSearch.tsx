import { Banknote, Building2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ESTATES, HOUSE_TYPES } from "@/lib/constants";
import { PARAM } from "@/lib/search-params";

const BUDGETS = [
  { label: "Any Budget", value: "" },
  { label: "Under Ksh 15,000", value: "-15000" },
  { label: "Ksh 15,000 – Ksh 30,000", value: "15000-30000" },
  { label: "Ksh 30,000 – Ksh 60,000", value: "30000-60000" },
  { label: "Ksh 60,000+", value: "60000-" },
];

/**
 * The search bar overlaid on the hero. A plain GET form, so it works without
 * JavaScript and lands on /listings with the filters already in the URL.
 */
export function HeroSearch() {
  return (
    <form
      action="/listings"
      className="grid gap-space-xs rounded-xl border border-border bg-surface p-space-sm shadow-raised md:grid-cols-[1.4fr_1fr_1fr_auto]"
    >
      <Field icon={<MapPin />} label="Location / Estate">
        <select
          name={PARAM.estate}
          aria-label="Location or estate"
          className="w-full bg-transparent text-body-md text-ink focus:outline-none"
          defaultValue=""
        >
          <option value="">e.g. Ruaka, Roysambu, Kilimani</option>
          {ESTATES.map((estate) => (
            <option key={estate} value={estate}>
              {estate}
            </option>
          ))}
        </select>
      </Field>

      <Field icon={<Building2 />} label="House Type">
        <select
          name={PARAM.houseTypes}
          aria-label="House type"
          className="w-full bg-transparent text-body-md text-ink focus:outline-none"
          defaultValue=""
        >
          <option value="">All Types</option>
          {HOUSE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </Field>

      <Field icon={<Banknote />} label="Budget Range">
        <select
          name={PARAM.budget}
          aria-label="Budget range"
          className="w-full bg-transparent text-body-md text-ink focus:outline-none"
          defaultValue=""
        >
          {BUDGETS.map((budget) => (
            <option key={budget.label} value={budget.value}>
              {budget.label}
            </option>
          ))}
        </select>
      </Field>

      <Button type="submit" size="lg" className="md:h-auto">
        <Search />
        Search Houses
      </Button>
    </form>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-space-xs rounded-lg px-space-sm py-space-xs hover:bg-surface-low">
      <span className="shrink-0 text-muted [&_svg]:size-4" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-caption uppercase tracking-wider text-muted">{label}</span>
        {children}
      </span>
    </label>
  );
}
