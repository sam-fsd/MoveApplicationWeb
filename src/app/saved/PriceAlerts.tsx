"use client";

import { useActionState, useState } from "react";
import { BellPlus, BellRing, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Pill } from "@/components/ui/Pill";
import { ESTATES, HOUSE_TYPES } from "@/lib/constants";
import { formatKes } from "@/lib/format";
import type { ActionResult } from "@/app/listings/[id]/actions";
import { createPriceAlert, deletePriceAlert, togglePriceAlert } from "./actions";
import { cn } from "@/lib/cn";

export interface AlertRow {
  id: string;
  label: string;
  estate: string | null;
  houseType: string | null;
  maxRent: number | null;
  active: boolean;
  matches: number;
}

/**
 * The Price & New Listing Alerts panel on screens 09 and 10. Match counts are
 * real: they come from the listings the alert's own criteria select.
 */
export function PriceAlerts({ alerts }: { alerts: AlertRow[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createPriceAlert, {
    ok: false,
  });

  return (
    <section className="rounded-xl border border-border bg-surface p-space-lg">
      <div className="mb-space-md flex flex-wrap items-start justify-between gap-space-md">
        <div>
          <h2 className="flex items-center gap-space-xs text-headline-sm">
            <BellRing className="size-5 text-brand-strong" aria-hidden />
            Price &amp; new listing alerts
          </h2>
          <p className="mt-space-2xs text-body-md text-muted">
            We tell you the moment a verified landlord posts a match in your target zone.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          <BellPlus />
          Create new alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-space-lg py-space-xl text-center text-body-md text-muted">
          No alerts yet. Create one and we will watch new listings for you.
        </p>
      ) : (
        <ul className="space-y-space-sm">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex flex-wrap items-center gap-space-sm rounded-xl bg-surface-low p-space-sm"
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  alert.active ? "bg-brand text-ink" : "bg-surface-container text-muted",
                )}
                aria-hidden
              >
                <BellRing className="size-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-space-xs">
                  <span className="text-label-md text-ink">{alert.label}</span>
                  {alert.matches > 0 ? (
                    <Pill tone="success">
                      {alert.matches} match{alert.matches === 1 ? "" : "es"} right now
                    </Pill>
                  ) : (
                    <Pill>No matches yet</Pill>
                  )}
                </span>
                <span className="mt-space-2xs flex flex-wrap gap-space-2xs">
                  {alert.estate && <Pill className="text-caption">{alert.estate}</Pill>}
                  {alert.houseType && (
                    <Pill className="text-caption">
                      {HOUSE_TYPES.find((t) => t.value === alert.houseType)?.label ?? alert.houseType}
                    </Pill>
                  )}
                  {alert.maxRent && (
                    <Pill className="text-caption">Max {formatKes(alert.maxRent)}/mo</Pill>
                  )}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-space-sm">
                <span className="hidden text-body-sm text-muted sm:block">
                  {alert.active ? "WhatsApp & email" : "Paused"}
                </span>
                <form action={togglePriceAlert.bind(null, alert.id)}>
                  <button
                    type="submit"
                    role="switch"
                    aria-checked={alert.active}
                    aria-label={`${alert.active ? "Pause" : "Resume"} ${alert.label}`}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      alert.active ? "bg-brand" : "bg-surface-container",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-5 rounded-full bg-surface shadow-sm transition-all",
                        alert.active ? "left-[22px]" : "left-0.5",
                      )}
                      aria-hidden
                    />
                  </button>
                </form>
                <form action={deletePriceAlert.bind(null, alert.id)}>
                  <button
                    type="submit"
                    className="rounded-lg p-space-2xs text-muted transition-colors hover:bg-danger-bg hover:text-danger"
                    aria-label={`Delete ${alert.label}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a price alert"
        subtitle="We will watch new verified listings and tell you when one matches."
        icon={
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-subtle text-brand-strong">
            <BellPlus className="size-4" aria-hidden />
          </span>
        }
        footer={
          state.ok ? (
            <Button onClick={() => setOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="alert-form" disabled={pending}>
                <Plus />
                {pending ? "Creating…" : "Create alert"}
              </Button>
            </>
          )
        }
      >
        {state.ok ? (
          <p className="rounded-xl bg-success-bg p-space-md text-body-md text-success">
            {state.message}
          </p>
        ) : (
          <form id="alert-form" action={formAction} className="space-y-space-md">
            <div>
              <label htmlFor="alert-estate" className="mb-space-2xs block text-label-md">
                Estate
              </label>
              <select
                id="alert-estate"
                name="estate"
                className="h-10 w-full rounded-lg border border-border bg-surface px-space-sm text-body-md focus:outline-none focus:ring-2 focus:ring-ink/10"
              >
                <option value="">Anywhere in Nairobi</option>
                {ESTATES.map((estate) => (
                  <option key={estate}>{estate}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="alert-type" className="mb-space-2xs block text-label-md">
                House type
              </label>
              <select
                id="alert-type"
                name="houseType"
                className="h-10 w-full rounded-lg border border-border bg-surface px-space-sm text-body-md focus:outline-none focus:ring-2 focus:ring-ink/10"
              >
                <option value="">Any type</option>
                {HOUSE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="alert-max" className="mb-space-2xs block text-label-md">
                Maximum rent (KES) <span className="text-danger">*</span>
              </label>
              <input
                id="alert-max"
                name="maxRent"
                type="number"
                min={1000}
                step={1000}
                defaultValue={30000}
                required
                className="h-10 w-full rounded-lg border border-border bg-surface px-space-sm text-body-md focus:outline-none focus:ring-2 focus:ring-ink/10"
              />
            </div>

            {state.error && (
              <p role="alert" className="rounded-lg bg-danger-bg px-space-sm py-space-xs text-body-sm text-danger">
                {state.error}
              </p>
            )}
          </form>
        )}
      </Modal>
    </section>
  );
}
