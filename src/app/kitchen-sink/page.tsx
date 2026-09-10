import {
  Bookmark,
  Building2,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox, FieldHint, Input, Label, Select, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { StatCard } from "@/components/ui/StatCard";
import { ListingStatusPill, ReportStatusPill, SeverityPill } from "@/components/ui/StatusPill";
import { TrustNotice } from "@/components/ui/TrustNotice";
import { VerificationChecklist } from "@/components/ui/VerificationChecklist";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { HOUSE_TYPES, TRUST_COPY } from "@/lib/constants";
import { formatDeposit, formatKes, formatKesCompact, formatRelative, formatShortDate } from "@/lib/format";

export const metadata = { title: "Kitchen Sink" };

const SWATCHES = [
  ["brand", "#FFC93C"],
  ["brand-hover", "#F4BF32"],
  ["brand-subtle", "#FFF7DB"],
  ["ink", "#12151C"],
  ["ink-soft", "#1E232F"],
  ["muted", "#5A6472"],
  ["muted-subtle", "#9EABB9"],
  ["bg", "#FAF9F6"],
  ["surface", "#FFFFFF"],
  ["surface-low", "#F4F3F1"],
  ["surface-container", "#EFEEEB"],
  ["border", "#E6E3DC"],
  ["success", "#1F9D55"],
  ["success-bg", "#E8F8EE"],
  ["warning", "#E08700"],
  ["warning-bg", "#FEF3E2"],
  ["danger", "#D93025"],
  ["danger-bg", "#FCE8E6"],
] as const;

const TYPE_SCALE = [
  ["headline-xl", "text-headline-xl"],
  ["headline-lg", "text-headline-lg"],
  ["headline-md", "text-headline-md"],
  ["headline-sm", "text-headline-sm"],
  ["price-hero", "text-price-hero"],
  ["price-listing", "text-price-listing"],
  ["body-lg", "text-body-lg"],
  ["body-md", "text-body-md"],
  ["body-sm", "text-body-sm"],
  ["label-md", "text-label-md"],
  ["label-sm", "text-label-sm"],
  ["caption", "text-caption"],
] as const;

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-space-md border-t border-border pt-space-xl">
      <div>
        <h2 className="text-headline-md">{title}</h2>
        {note && <p className="text-body-md text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

export default function KitchenSinkPage() {
  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000);

  return (
    <main className="mx-auto max-w-container-max space-y-space-xl px-gutter-desktop py-space-2xl">
      <header className="space-y-space-2xs">
        <p className="text-label-sm uppercase tracking-wider text-muted">Dev only</p>
        <h1 className="text-headline-xl">Kitchen Sink</h1>
        <p className="max-w-2xl text-body-lg text-muted">
          Every shared primitive on one page. Values are sampled from the Stitch exports in{" "}
          <code className="rounded bg-surface-low px-1">docs/code/</code>, which override{" "}
          <code className="rounded bg-surface-low px-1">docs/DESIGN_SYSTEM.md</code> wherever the two disagree.
        </p>
      </header>

      <Section title="Colour" note="Yellow is a fill only — never text, icon, or border. Text on yellow is always ink.">
        <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-3 lg:grid-cols-6">
          {SWATCHES.map(([name, hex]) => (
            <div key={name} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="h-14 w-full" style={{ backgroundColor: hex }} />
              <div className="px-space-xs py-space-2xs">
                <p className="truncate text-label-sm text-ink">{name}</p>
                <p className="text-caption uppercase text-muted">{hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type" note="Plus Jakarta Sans for display and prices, Inter for body and UI.">
        <div className="space-y-space-xs rounded-xl border border-border bg-surface p-space-lg">
          {TYPE_SCALE.map(([name, cls]) => (
            <div key={name} className="flex flex-wrap items-baseline gap-space-md">
              <span className="w-40 shrink-0 text-caption uppercase tracking-wider text-muted-subtle">{name}</span>
              <span className={`${cls} ${name.startsWith("headline") || name.startsWith("price") ? "font-display" : ""}`}>
                Renting made transparent
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-space-sm">
          <Button>Add Listing</Button>
          <Button variant="secondary">List a House</Button>
          <Button variant="dark">Run Batch Audit</Button>
          <Button variant="whatsapp">
            <MessageSquare /> WhatsApp
          </Button>
          <Button variant="danger">Reject</Button>
          <Button variant="ghost">Clear all</Button>
          <Button disabled>Publish</Button>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">
            <Phone /> Show Contact (WhatsApp / Call)
          </Button>
        </div>
      </Section>

      <Section title="Pills and badges" note="Status is always a pill: dot plus label on a tinted ground.">
        <div className="flex flex-wrap items-center gap-space-sm">
          <ListingStatusPill status="PUBLISHED" />
          <ListingStatusPill status="PENDING_REVIEW" />
          <ListingStatusPill status="RENTED_OUT" />
          <ListingStatusPill status="REJECTED" />
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <ReportStatusPill status="OPEN" />
          <ReportStatusPill status="UNDER_REVIEW" />
          <ReportStatusPill status="RESOLVED" />
          <ReportStatusPill status="DISMISSED" />
          <SeverityPill severity="CRITICAL" />
          <SeverityPill severity="MODERATE" />
          <SeverityPill severity="LOW" />
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <Pill tone="ink">2 Bed Master Ensuite</Pill>
          <Pill>Borehole Water</Pill>
          <Pill tone="brand">1, 2, 3 Beds</Pill>
          <Pill tone="warning">24h SLA Warning</Pill>
          <Pill tone="success" dot>
            100% Vetted
          </Pill>
        </div>
        <div className="flex flex-wrap items-center gap-space-md">
          <VerifiedBadge kind="LANDLORD" />
          <VerifiedBadge kind="AGENT" />
          <VerifiedBadge kind="AGENT" label="Verified Agency" />
          <VerifiedBadge kind="LANDLORD" label="Verified Owner" variant="pill" />
        </div>
      </Section>

      <Section title="Avatars">
        <div className="flex flex-wrap items-center gap-space-md">
          <Avatar name="Grace Muthoni Wambui" size="sm" />
          <Avatar name="Kamau Properties Ltd" />
          <Avatar name="Samuel Njoroge" size="lg" />
          <Avatar name="Samuel Njoroge" src="/seed/avatars/owner-headshot.png" size="lg" />
          <Avatar name="Wanjiku Mwangi" src="/seed/avatars/tenant-portrait.png" />
        </div>
      </Section>

      <Section title="Stat cards" note="Numbers and captions here are the ones on screen 15.">
        <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active Listings"
            value="6"
            badge={<span className="text-body-md text-muted">of 8 registered</span>}
            icon={<Building2 />}
            trend="+1 this month"
            caption="2 pending lease signing"
            sparkline={[3, 4, 4, 5, 5, 5, 6, 6]}
            active
          />
          <StatCard
            label="Total Views This Month"
            value="4,820"
            icon={<Eye />}
            trend="+18.4%"
            caption="vs last month"
            sparkline={[120, 180, 160, 240, 300, 280, 360, 420]}
          />
          <StatCard
            label="Enquiries"
            value="38"
            badge={<Pill tone="warning">12 unread</Pill>}
            icon={<MessageSquare />}
            trend="+24%"
            caption="WhatsApp & in-app"
            sparkline={[4, 6, 5, 9, 8, 12, 14, 18]}
          />
          <StatCard
            label="Saved by Tenants"
            value="142"
            badge={<Pill>High interest</Pill>}
            icon={<Bookmark />}
            trend="+15 this week"
            caption="Top in Westlands hub"
            sparkline={[60, 72, 80, 95, 104, 118, 130, 142]}
          />
        </div>
      </Section>

      <Section title="Cards, prices and formatting" note="All money goes through lib/format.ts.">
        <div className="grid gap-space-md lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>2 Bedroom Modern Flat</CardTitle>
                <CardDescription className="flex items-center gap-space-2xs">
                  <MapPin className="size-4" aria-hidden /> Muthithi Road, Westlands
                </CardDescription>
              </div>
              <ListingStatusPill status="PUBLISHED" />
            </CardHeader>
            <CardBody className="space-y-space-xs">
              <div className="flex flex-wrap items-baseline gap-space-xs">
                <span className="font-display text-price-hero text-ink">{formatKes(45000)}</span>
                <span className="text-body-md text-muted">/ month</span>
                <Pill>{formatDeposit(1)}</Pill>
              </div>
              <p className="text-body-md text-muted">
                Compact: {formatKesCompact(45000)} · Available from {formatShortDate(new Date("2025-10-01"))} ·
                Listed {formatRelative(hoursAgo(5), now)}
              </p>
            </CardBody>
            <CardFooter>
              <Avatar name="Kamau Properties Ltd" size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-label-md">Kamau Properties Ltd</p>
                <VerifiedBadge kind="AGENT" label="Verified Agency" />
              </div>
              <Button size="sm" variant="secondary">
                <Heart /> Save
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>MoveApp Verification</CardTitle>
                <CardDescription>Compliance Certificate #MP-NBI-2025-084</CardDescription>
              </div>
              <Pill tone="success" dot>
                100% Vetted
              </Pill>
            </CardHeader>
            <CardBody className="space-y-space-md">
              <VerificationChecklist
                items={[
                  { label: "National ID", sublabel: "Verified against IPRS records", done: true },
                  { label: "KRA PIN", done: true },
                  { label: "Title Deed or ownership mandate", done: true },
                  { label: "Physical inspection", sublabel: "Cap 296 compliant", done: true },
                  { label: "Zero viewing-fee pledge", sublabel: "Awaiting signature", done: false },
                ]}
              />
              <TrustNotice>{TRUST_COPY.noViewingFee}</TrustNotice>
              <TrustNotice tone="neutral" icon={<ShieldCheck />}>
                {TRUST_COPY.approximateLocation}
              </TrustNotice>
            </CardBody>
          </Card>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid gap-space-lg lg:grid-cols-2">
          <Card>
            <CardBody className="space-y-space-md pt-space-lg">
              <div>
                <Label htmlFor="ks-search">Search</Label>
                <Input id="ks-search" placeholder="Search by estate, tenant name, or unit ID…" icon={<Search />} />
              </div>
              <div>
                <Label htmlFor="ks-estate">Estate</Label>
                <Select id="ks-estate" defaultValue="Westlands">
                  <option>Westlands</option>
                  <option>Kilimani</option>
                  <option>Parklands</option>
                </Select>
                <FieldHint>Approximate location is shown to tenants until an enquiry is confirmed.</FieldHint>
              </div>
              <div>
                <Label htmlFor="ks-rent">Monthly rent (KES)</Label>
                <Input id="ks-rent" type="number" defaultValue={45000} />
              </div>
              <div>
                <Label htmlFor="ks-about">About this home</Label>
                <Textarea id="ks-about" placeholder="What makes this unit worth a viewing?" />
              </div>
              <div>
                <Label htmlFor="ks-disabled">Publish</Label>
                <Input id="ks-disabled" disabled placeholder="Blocked until verification is approved" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-space-xs">
                <SlidersHorizontal className="size-4" aria-hidden /> House Type
              </CardTitle>
              <Pill>Nairobi Urban</Pill>
            </CardHeader>
            <CardBody>
              {HOUSE_TYPES.map((type, i) => (
                <Checkbox
                  key={type.value}
                  label={type.plural}
                  count={{ BEDSITTER: 14, SINGLE_ROOM: 3, STUDIO: 19, APARTMENT: 48, MAISONETTE: 8, TOWNHOUSE: 5 }[type.value]}
                  defaultChecked={i < 2}
                />
              ))}
            </CardBody>
          </Card>
        </div>
      </Section>

      <Section title="Empty states" note="Built at the same time as the list they belong to.">
        <div className="grid gap-space-md lg:grid-cols-2">
          <EmptyState
            illustration="/illustrations/empty-search-results-map.png"
            title="No verified rentals in Ruaka yet"
            description="Nothing matches these filters right now. Widen the budget, or let us alert you the moment a match is published."
            actions={
              <>
                <Button>Create a price alert</Button>
                <Button variant="secondary">Clear filters</Button>
              </>
            }
          />
          <EmptyState
            illustration="/illustrations/404-house-missing-door.png"
            title="This page has moved out"
            description="The link may be stale, or the listing was taken down after a report."
            actions={<Button variant="secondary">Back to browse rentals</Button>}
          />
        </div>
      </Section>
    </main>
  );
}
