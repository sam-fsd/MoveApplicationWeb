import Link from "next/link";
import { BadgeCheck, Bell, ChevronRight, Info, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";

import { SiteShell } from "@/components/layout/SiteShell";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccountForm } from "./AccountForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account settings" };

/** Safely reads the JSON-encoded array columns SQLite forces on us. */
function parseJsonArray(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Screen 12. */
export default async function AccountPage() {
  const user = await requireRole("TENANT");

  const profile = await db.tenantProfile.findUnique({
    where: { userId: user.id },
    select: { preferredEstates: true, preferredTypes: true, budgetMin: true, budgetMax: true },
  });

  const savedCount = await db.savedListing.count({ where: { userId: user.id } });

  return (
    <SiteShell>
      <div className="mx-auto max-w-container-max px-gutter-mobile py-space-lg lg:px-gutter-desktop">
        <nav aria-label="Breadcrumb" className="mb-space-md flex items-center gap-space-2xs text-body-sm text-muted">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">Account settings</span>
        </nav>

        <header className="mb-space-lg flex flex-wrap items-start justify-between gap-space-md">
          <div>
            <h1 className="flex flex-wrap items-center gap-space-xs text-headline-lg-mobile md:text-headline-lg">
              Account settings
              <Pill tone="success">
                <BadgeCheck className="size-3.5" aria-hidden />
                Verified tenant (Cap 296 protected)
              </Pill>
            </h1>
            <p className="mt-space-2xs text-body-md text-muted">
              Manage your personal details, rental search criteria, and alert preferences across
              Nairobi.
            </p>
          </div>
          <Pill>Tenant ID: #{user.id.slice(-6).toUpperCase()}</Pill>
        </header>

        <div className="grid gap-space-lg lg:grid-cols-[260px_1fr]">
          <aside className="space-y-space-md lg:sticky lg:top-20 lg:self-start">
            <nav className="overflow-hidden rounded-xl border border-border bg-surface">
              <SideLink icon={<UserRound />} label="Profile" current />
              <SideLink icon={<SlidersHorizontal />} label="Preferences" aside={`${parseJsonArray(profile?.preferredEstates).length} active`} />
              <SideLink icon={<Bell />} label="Saved homes" href="/saved" aside={String(savedCount)} />
            </nav>

            <div className="rounded-xl border border-border bg-warning-bg p-space-md">
              <p className="flex items-center gap-space-2xs text-label-md text-ink">
                <Info className="size-4 text-warning" aria-hidden />
                Tenant rights guarantee
              </p>
              <p className="mt-space-2xs text-body-sm text-muted">
                MoveApp accounts are protected under the Kenyan Rent Restriction Act (Cap 296).
                Never send gate-pass fees over M-Pesa to unverified contacts.
              </p>
            </div>
          </aside>

          <section className="rounded-xl border border-border bg-surface">
            <header className="flex flex-wrap items-start justify-between gap-space-md border-b border-border p-space-lg">
              <div className="flex items-center gap-space-md">
                <Avatar name={user.fullName} src={user.avatarUrl} size="lg" />
                <div>
                  <h2 className="text-headline-sm">Public &amp; tenancy profile</h2>
                  <p className="text-body-sm text-muted">
                    This helps verified landlords prepare accurate tenancy agreements.
                  </p>
                </div>
              </div>
              <Pill tone="success">
                <ShieldCheck className="size-3.5" aria-hidden />
                ID document: vetted
              </Pill>
            </header>

            <div className="p-space-lg">
              <AccountForm
                initial={{
                  fullName: user.fullName,
                  email: user.email,
                  phone: user.phone,
                  estates: parseJsonArray(profile?.preferredEstates),
                  types: parseJsonArray(profile?.preferredTypes),
                  budgetMin: profile?.budgetMin ?? null,
                  budgetMax: profile?.budgetMax ?? null,
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}

function SideLink({
  icon,
  label,
  aside,
  href,
  current,
}: {
  icon: React.ReactNode;
  label: string;
  aside?: string;
  href?: string;
  current?: boolean;
}) {
  const inner = (
    <>
      <span className="shrink-0 [&_svg]:size-4" aria-hidden>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {aside && <span className="text-body-sm text-muted-subtle">{aside}</span>}
    </>
  );

  const className = `flex items-center gap-space-sm border-l-2 px-space-md py-space-sm text-label-md transition-colors ${
    current
      ? "border-brand bg-surface-low text-ink"
      : "border-transparent text-muted hover:bg-surface-low hover:text-ink"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <span className={className} aria-current={current ? "page" : undefined}>
      {inner}
    </span>
  );
}
