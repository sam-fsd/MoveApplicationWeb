import { redirect } from "next/navigation";
import { BadgeCheck, Gavel, Lock, Quote, ShieldCheck } from "lucide-react";

import { SiteShell } from "@/components/layout/SiteShell";
import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { getCurrentUser, homePathForRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { RegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create your account" };

/** Screen 03 — ink Partner Hub panel on the left, the account form on the right. */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  const role = (await searchParams).role === "owner" ? "owner" : "tenant";
  const verifiedOwners = await db.verification.count({ where: { state: "APPROVED" } });

  return (
    <SiteShell>
      <div className="grid lg:grid-cols-2">
        {/* Partner hub */}
        <aside className="flex flex-col gap-space-xl bg-ink p-space-xl text-white lg:p-space-2xl">
          <div className="space-y-space-lg">
            <span className="flex items-center gap-space-xs">
              <Logo href={null} tone="light" variant="kenya" />
              <Pill tone="brand">Partner Hub</Pill>
            </span>

            <Pill className="bg-white/10 text-white">
              <ShieldCheck className="size-4" aria-hidden />
              Direct Nairobi Tenancy Network
            </Pill>

            <h1 className="font-display text-headline-lg-mobile text-white md:text-headline-lg">
              Join {verifiedOwners} verified landlords &amp; managers across Nairobi.
            </h1>

            <p className="max-w-md text-body-lg text-white/70">
              Eliminate predatory brokers, eradicate empty rental cycles, and communicate directly
              with vetted tenants over WhatsApp and direct calls.
            </p>

            <dl className="grid gap-space-md sm:grid-cols-2">
              {[
                ["0%", "Middleman Cut", "Zero hidden listing commission fees"],
                ["48 hrs", "Median Fill Rate", "Rapid tenant discovery across Kilimani & Westlands"],
              ].map(([value, label, body]) => (
                <div key={label} className="rounded-xl bg-white/5 p-space-md">
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block font-display text-headline-md text-brand">{value}</span>
                    <span className="block text-label-md text-white">{label}</span>
                    <span className="mt-space-2xs block text-body-sm text-white/60">{body}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="mt-auto space-y-space-sm rounded-xl bg-white/5 p-space-lg">
            <figcaption className="flex items-center gap-space-2xs text-label-sm uppercase tracking-wider text-white/60">
              <Quote className="size-4 text-brand" aria-hidden />
              Landlord Spotlight
            </figcaption>
            <blockquote className="text-body-lg italic text-white/90">
              &ldquo;Listing on MoveApp cut our vacancy turnaround from 3 weeks to 48 hours without
              shady commission brokers. Qualified tenants call us directly with verified
              profiles.&rdquo;
            </blockquote>
            <div className="flex items-center gap-space-sm">
              <Avatar name="Peter Kamau" className="bg-brand text-ink" />
              <span>
                <span className="flex items-center gap-space-2xs text-label-md text-white">
                  Peter Kamau
                  <BadgeCheck className="size-4 text-success" aria-hidden />
                </span>
                <span className="block text-body-sm text-white/60">
                  Kamau Properties Ltd (Westlands, Nairobi)
                </span>
              </span>
            </div>
          </figure>

          <p className="flex flex-wrap items-center justify-between gap-space-sm text-body-sm text-white/50">
            <span className="flex items-center gap-space-2xs">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              Govt. Cap 301 Compliant Platform
            </span>
            <span>Nairobi • Kiambu • Machakos</span>
          </p>
        </aside>

        {/* Form */}
        <div className="bg-bg px-gutter-mobile py-space-2xl lg:px-space-2xl">
          <div className="mx-auto w-full max-w-xl space-y-space-lg">
            <div className="space-y-space-2xs">
              <p className="text-label-sm uppercase tracking-wider text-brand-strong">
                MoveApp Kenya Partner Portal
              </p>
              <h2 className="text-headline-lg-mobile md:text-headline-lg">Create your account</h2>
              <p className="text-body-md text-muted">
                Connect directly with verified tenants across Nairobi without intermediaries.
              </p>
            </div>

            <RegisterForm initialRole={role} />

            <ul className="flex flex-wrap items-center justify-center gap-x-space-lg gap-y-space-xs rounded-xl border border-border bg-surface px-space-md py-space-sm text-body-sm text-muted">
              {[
                [<BadgeCheck key="a" className="size-4 text-success" />, "100% Anti-Fraud Protected"],
                [<Gavel key="b" className="size-4" />, "Kenyan Landlord & Tenant Act Compliant"],
                [<Lock key="c" className="size-4" />, "Encrypted Data Vault"],
              ].map(([icon, label]) => (
                <li key={label as string} className="flex items-center gap-space-2xs">
                  {icon}
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
