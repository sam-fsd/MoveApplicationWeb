"use client";

import { useActionState, useState } from "react";
import { BadgeCheck, Check, MessageSquare, Phone, Save, ShieldCheck } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FieldHint, Input, Label } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { ESTATES } from "@/lib/constants";
import { formatCount, formatMonthYear } from "@/lib/format";
import type { ActionResult } from "@/app/listings/[id]/actions";
import { updateOwnerProfile } from "./actions";

const QUICK_ADD = [
  "Borehole water guarantee.",
  "Zero middleman viewing fees.",
  "Resident caretaker on site.",
  "Deposit refunded within 14 days of checkout.",
];

export interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  businessName: string;
  about: string;
  primaryEstate: string;
  kind: "LANDLORD" | "AGENT";
  badgeLabel: string | null;
  memberSince: Date;
  listings: number;
  approved: boolean;
}

/**
 * Screen 14. The right-hand preview is driven by the same state as the form,
 * so it genuinely reflects what a tenant will see rather than being a mock.
 */
export function ProfileForm({ initial }: { initial: ProfileFormData }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updateOwnerProfile,
    { ok: false },
  );

  const [businessName, setBusinessName] = useState(initial.businessName);
  const [about, setAbout] = useState(initial.about);
  const [estate, setEstate] = useState(initial.primaryEstate);
  const [phone, setPhone] = useState(initial.phone);

  return (
    <div className="grid gap-space-lg lg:grid-cols-[1.4fr_1fr]">
      <form action={formAction} className="space-y-space-lg">
        <section className="space-y-space-md rounded-xl border border-border bg-surface p-space-lg">
          <div>
            <h2 className="text-headline-sm">Agency &amp; contact details</h2>
            <p className="text-body-sm text-muted">
              The public phone number and registration details tenants use to book viewings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-md">
            <Avatar name={businessName || initial.fullName} src={initial.avatarUrl} size="lg" className="size-16" />
            <p className="text-body-sm text-muted">
              Your headshot comes from your account. Clear natural daylight portraits measurably
              increase rental enquiries.
            </p>
          </div>

          <div>
            <span className="mb-space-2xs flex items-baseline justify-between gap-space-sm">
              <Label htmlFor="businessName" className="mb-0">
                Display / agency name <span className="text-danger">*</span>
              </Label>
              <span className="text-caption text-muted">Shown on listing cards</span>
            </span>
            <Input
              id="businessName"
              name="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-space-md sm:grid-cols-2">
            <div>
              <Label htmlFor="legalName">Legal representative</Label>
              <Input id="legalName" value={initial.fullName} disabled />
              <FieldHint>Locked to your verified Kenyan National ID.</FieldHint>
            </div>

            <div>
              <Label htmlFor="phone">
                Primary phone (direct) <span className="text-danger">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <FieldHint>Used for tenant WhatsApp enquiries and viewing alerts.</FieldHint>
            </div>

            <div>
              <Label htmlFor="email">Registered business email</Label>
              <Input id="email" value={initial.email} disabled />
            </div>

            <div>
              <Label htmlFor="primaryEstate">Primary operating estate</Label>
              <select
                id="primaryEstate"
                name="primaryEstate"
                value={estate}
                onChange={(e) => setEstate(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-surface px-space-sm text-body-md focus:outline-none focus:ring-2 focus:ring-ink/10"
              >
                <option value="">Not set</option>
                {ESTATES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <FieldHint>Helps renters find you by neighbourhood.</FieldHint>
            </div>
          </div>

          <div>
            <Label htmlFor="kind">I operate as</Label>
            <select
              id="kind"
              name="kind"
              defaultValue={initial.kind}
              className="h-10 w-full rounded-lg border border-border bg-surface px-space-sm text-body-md focus:outline-none focus:ring-2 focus:ring-ink/10"
            >
              <option value="LANDLORD">Landlord — I own the property</option>
              <option value="AGENT">Agent — I manage on the owner&apos;s behalf</option>
            </select>
            <FieldHint>
              Your verified badge wording is set by MoveApp admins and cannot be edited here.
            </FieldHint>
          </div>
        </section>

        <section className="space-y-space-md rounded-xl border border-border bg-surface p-space-lg">
          <div className="flex flex-wrap items-start justify-between gap-space-sm">
            <div>
              <h2 className="text-headline-sm">Landlord bio &amp; management terms</h2>
              <p className="text-body-sm text-muted">
                Describe your tenant care standards, water backup, and direct leasing policies.
              </p>
            </div>
            <Pill>{about.length} / 600</Pill>
          </div>

          <textarea
            id="about"
            name="about"
            rows={6}
            maxLength={600}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-space-sm py-space-xs text-body-md focus:outline-none focus:ring-2 focus:ring-ink/10"
          />

          <div>
            <p className="mb-space-xs text-caption uppercase tracking-wider text-muted">
              Quick add for Nairobi renters
            </p>
            <div className="flex flex-wrap gap-space-xs">
              {QUICK_ADD.map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() =>
                    setAbout((current) =>
                      current.includes(phrase)
                        ? current
                        : `${current.trim()}${current.trim() ? " " : ""}${phrase}`.slice(0, 600),
                    )
                  }
                >
                  <Pill className="transition-colors hover:bg-brand hover:text-ink">+ {phrase}</Pill>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-space-md">
          {state.ok && (
            <span className="flex items-center gap-space-2xs text-label-sm text-success">
              <Check className="size-4" aria-hidden />
              {state.message}
            </span>
          )}
          {state.error && (
            <span role="alert" className="text-label-sm text-danger">
              {state.error}
            </span>
          )}
          <Button type="submit" size="lg" disabled={pending}>
            <Save />
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-space-sm flex items-center gap-space-2xs text-label-sm text-muted">
          <span className="size-1.5 rounded-full bg-success" aria-hidden />
          Live tenant view preview
        </p>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="h-20 bg-ink" aria-hidden />
          <div className="-mt-8 px-space-lg pb-space-lg">
            <Avatar
              name={businessName || initial.fullName}
              src={initial.avatarUrl}
              size="lg"
              className="size-16 ring-4 ring-surface"
            />

            <h3 className="mt-space-sm flex flex-wrap items-center gap-space-xs text-headline-sm">
              {businessName || "Your agency name"}
              {initial.approved && <BadgeCheck className="size-5 text-success" aria-hidden />}
            </h3>
            <p className="text-body-sm text-muted">
              Managed by {initial.fullName}
              {estate && ` • ${estate}, Nairobi`}
            </p>

            <dl className="my-space-md grid grid-cols-3 gap-space-xs rounded-xl bg-surface-low p-space-sm text-center">
              {[
                [formatCount(initial.listings), "Listings"],
                [initial.approved ? "100%" : "—", "Verified"],
                [formatMonthYear(initial.memberSince).split(" ")[1], "Since"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block text-label-md text-ink">{value}</span>
                    <span className="block text-caption text-muted">{label}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="text-caption uppercase tracking-wider text-muted">Landlord statement</p>
            <p className="mt-space-2xs line-clamp-4 text-body-sm text-muted">
              {about || "Tell tenants how you manage your properties."}
            </p>

            <div className="mt-space-md grid grid-cols-2 gap-space-xs">
              <Button size="sm" variant="whatsapp" type="button" disabled>
                <MessageSquare />
                WhatsApp
              </Button>
              <Button size="sm" variant="secondary" type="button" disabled>
                <Phone />
                Direct call
              </Button>
            </div>

            <p className="mt-space-sm flex items-start gap-space-2xs text-caption text-muted">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
              Zero viewing fee pledge. Verified by the MoveApp Kenya trust unit.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
