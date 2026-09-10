"use client";

import { useActionState, useState } from "react";
import { Check, CheckCircle2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useResultToast } from "@/components/ui/Toast";
import { FieldHint, Input, Label } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { ESTATES, HOUSE_TYPES } from "@/lib/constants";
import { formatKes } from "@/lib/format";
import type { ActionResult } from "@/app/listings/[id]/actions";
import { updateTenantProfile } from "./actions";
import { cn } from "@/lib/cn";

export interface AccountFormData {
  fullName: string;
  email: string;
  phone: string;
  estates: string[];
  types: string[];
  budgetMin: number | null;
  budgetMax: number | null;
}

/** Screen 12's Public & Tenancy Profile panel. */
export function AccountForm({ initial }: { initial: AccountFormData }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updateTenantProfile,
    { ok: false },
  );

  useResultToast(state);

  const [estates, setEstates] = useState<string[]>(initial.estates);
  const [budgetMin, setBudgetMin] = useState(initial.budgetMin ?? 15000);
  const [budgetMax, setBudgetMax] = useState(initial.budgetMax ?? 60000);

  const available = ESTATES.filter((estate) => !estates.includes(estate));

  return (
    <form action={formAction} className="space-y-space-xl">
      {estates.map((estate) => (
        <input key={estate} type="hidden" name="estates" value={estate} />
      ))}

      <section className="space-y-space-md">
        <div>
          <h2 className="text-headline-sm">Personal &amp; contact details</h2>
          <p className="text-body-sm text-muted">
            Verified landlords use this to prepare tenancy agreements and schedule scam-free
            viewings.
          </p>
        </div>

        <div>
          <Label htmlFor="fullName">Full legal name</Label>
          <Input id="fullName" name="fullName" defaultValue={initial.fullName} required />
          <FieldHint>Used on rental agreements and formal payment receipts.</FieldHint>
        </div>

        <div className="grid gap-space-md sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" defaultValue={initial.email} disabled />
            <FieldHint>Your sign-in address. Contact support to change it.</FieldHint>
          </div>
          <div>
            <Label htmlFor="phone">Phone number (M-Pesa / WhatsApp)</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={initial.phone} required />
            <FieldHint>Landlords contact you here after you confirm a viewing time.</FieldHint>
          </div>
        </div>
      </section>

      <section className="space-y-space-md border-t border-border pt-space-lg">
        <div>
          <h2 className="flex items-center gap-space-xs text-headline-sm">
            <span className="size-2 rounded-full bg-brand" aria-hidden />
            Rental housing search preferences
          </h2>
          <p className="text-body-sm text-muted">
            MoveApp tailors your home alerts and match notifications using these settings.
          </p>
        </div>

        <div>
          <span className="mb-space-2xs flex flex-wrap items-baseline justify-between gap-space-sm">
            <Label className="mb-0">Preferred Nairobi neighbourhoods</Label>
            <span className="text-caption text-muted">
              {estates.length} selected — tap × to remove
            </span>
          </span>

          <div className="flex flex-wrap gap-space-xs rounded-xl border border-border bg-surface p-space-sm">
            {estates.length === 0 && (
              <span className="px-space-2xs py-1 text-body-sm text-muted">
                None yet — add one below.
              </span>
            )}
            {estates.map((estate) => (
              <button
                key={estate}
                type="button"
                onClick={() => setEstates((list) => list.filter((e) => e !== estate))}
                className="group"
              >
                <Pill tone="brand" dot className="transition-colors group-hover:bg-danger-bg group-hover:text-danger">
                  {estate}
                  <X className="size-3.5" aria-hidden />
                </Pill>
              </button>
            ))}
          </div>

          {available.length > 0 && (
            <div className="mt-space-xs flex flex-wrap items-center gap-space-2xs">
              <span className="text-caption text-muted">Add:</span>
              {available.map((estate) => (
                <button
                  key={estate}
                  type="button"
                  onClick={() => setEstates((list) => [...list, estate])}
                >
                  <Pill className="transition-colors hover:bg-brand hover:text-ink">+ {estate}</Pill>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="mb-space-2xs flex flex-wrap items-baseline justify-between gap-space-sm">
            <Label className="mb-0">Target monthly budget range</Label>
            <Pill>
              {formatKes(budgetMin)} — {formatKes(budgetMax)} / month
            </Pill>
          </span>

          <div className="grid gap-space-md rounded-xl border border-border bg-surface p-space-md sm:grid-cols-2">
            <div>
              <Label htmlFor="budgetMin" className="text-caption uppercase tracking-wider text-muted">
                Minimum budget
              </Label>
              <Input
                id="budgetMin"
                name="budgetMin"
                type="number"
                min={0}
                step={1000}
                value={budgetMin}
                onChange={(event) => setBudgetMin(Number(event.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="budgetMax" className="text-caption uppercase tracking-wider text-muted">
                Maximum budget
              </Label>
              <Input
                id="budgetMax"
                name="budgetMax"
                type="number"
                min={0}
                step={1000}
                value={budgetMax}
                onChange={(event) => setBudgetMax(Number(event.target.value))}
              />
            </div>
            {budgetMin > budgetMax && (
              <p className="text-body-sm text-danger sm:col-span-2">
                The minimum is above the maximum — swap them before saving.
              </p>
            )}
          </div>
        </div>

        <div>
          <Label className="mb-space-xs">Preferred house types</Label>
          <div className="grid gap-space-sm sm:grid-cols-2 lg:grid-cols-3">
            {HOUSE_TYPES.map((type) => (
              <label
                key={type.value}
                className={cn(
                  "flex cursor-pointer items-center gap-space-sm rounded-xl border p-space-md transition-colors",
                  "border-border has-[:checked]:border-ink has-[:checked]:bg-surface-low",
                )}
              >
                <input
                  type="checkbox"
                  name="types"
                  value={type.value}
                  defaultChecked={initial.types.includes(type.value)}
                  className="size-4 shrink-0 rounded border-border accent-brand"
                />
                <span className="text-label-md text-ink">{type.plural}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-space-md border-t border-border pt-space-lg">
        <p className="flex items-center gap-space-2xs text-body-sm text-success">
          <CheckCircle2 className="size-4" aria-hidden />
          Changes sync with your instant WhatsApp rental alerts.
        </p>

        <div className="flex items-center gap-space-sm">
          {state.ok && (
            <span className="flex items-center gap-space-2xs text-label-sm text-success">
              <Check className="size-4" aria-hidden />
              {state.message}
            </span>
          )}
          <Button type="submit" size="lg" disabled={pending}>
            <Save />
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-danger-bg px-space-sm py-space-xs text-body-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
