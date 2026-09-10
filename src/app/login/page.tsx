import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, Building2, Quote, UserRound } from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { getCurrentUser, homePathForRole } from "@/lib/auth";
import { formatCount } from "@/lib/format";
import { db } from "@/lib/db";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

/** Screen 02 — split layout, testimonial and proof on the left, form on the right. */
export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  const [published, estates] = await Promise.all([
    db.listing.count({ where: { status: "PUBLISHED" } }),
    db.listing.findMany({
      where: { status: "PUBLISHED" },
      distinct: ["estate"],
      select: { estate: true },
    }),
  ]);

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left: proof panel */}
      <aside className="relative hidden overflow-hidden bg-ink lg:block">
        <Image
          src="/seed/listings/living-room-kilimani.png"
          alt=""
          fill
          sizes="50vw"
          className="object-cover opacity-40 grayscale"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />

        <div className="relative flex h-full flex-col justify-between gap-space-lg overflow-y-auto p-space-xl 2xl:p-space-2xl">
          <div className="flex items-center justify-between gap-space-md">
            <span className="rounded-full bg-ink/70 px-space-sm py-space-xs backdrop-blur-sm">
              <Logo href={null} tone="light" />
            </span>
            <Link
              href="/listings"
              className="inline-flex items-center gap-space-2xs rounded-full bg-white/10 px-space-md py-space-xs text-label-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Browse listings
            </Link>
          </div>

          <div className="space-y-space-lg">
            <Pill tone="success" className="bg-success-bg/90">
              <BadgeCheck className="size-4" aria-hidden />
              100% Anti-Fraud Verified Properties
            </Pill>

            <blockquote className="max-w-xl space-y-space-md">
              <Quote className="size-6 text-brand" aria-hidden />
              <p className="font-display text-headline-md text-white 2xl:text-headline-lg">
                &ldquo;I found my 2-bedroom in Kilimani in two days. No fake agent fees, no walking
                under the hot sun, straight key handover.&rdquo;
              </p>
              <footer className="flex items-center gap-space-sm">
                <Avatar name="Njeri Mwangi" className="bg-brand text-ink" />
                <span>
                  <span className="block text-label-md text-white">Njeri Mwangi</span>
                  <span className="block text-body-sm text-white/60">
                    Tenant in Kilimani • Verified Lease
                  </span>
                </span>
              </footer>
            </blockquote>

            <dl className="grid grid-cols-3 gap-space-md border-t border-white/15 pt-space-lg">
              {[
                [formatCount(published), "Vetted Rentals"],
                ["Ksh 0", "Viewing Fees"],
                [`${estates.length} Nairobi`, "Prime Estates"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block font-display text-headline-md text-brand">{value}</span>
                    <span className="block text-body-sm text-white/60">{label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </aside>

      {/* Right: form */}
      <main className="flex flex-col justify-center bg-bg px-gutter-mobile py-space-2xl lg:px-space-3xl">
        <div className="mx-auto w-full max-w-md space-y-space-lg">
          <div className="space-y-space-xs text-center">
            <span className="inline-flex lg:hidden">
              <Logo href="/" />
            </span>
            <h1 className="text-headline-lg">Welcome back</h1>
            <p className="text-body-md text-muted">
              Sign in to access your saved houses, direct chats, and listings
            </p>
          </div>

          <LoginForm />

          <div className="space-y-space-sm">
            <p className="flex items-center gap-space-sm text-caption uppercase tracking-wider text-muted-subtle">
              <span className="h-px flex-1 bg-border" aria-hidden />
              or
              <span className="h-px flex-1 bg-border" aria-hidden />
            </p>
            <p className="text-center text-body-md text-muted">New to MoveApp?</p>
            <div className="grid gap-space-sm sm:grid-cols-2">
              <SignUpCard
                href="/register?role=tenant"
                icon={<UserRound />}
                title="Sign up as a Tenant"
                body="Find & rent verified homes"
              />
              <SignUpCard
                href="/register?role=owner"
                icon={<Building2 />}
                title="Sign up as an Owner"
                body="List rentals & get vetted"
              />
            </div>
          </div>

          <p className="text-center text-body-sm text-muted">
            Compliant with the Kenyan Cap 301 Landlord &amp; Tenant Act. Direct contact, zero
            unverified fees.
          </p>
        </div>
      </main>
    </div>
  );
}

function SignUpCard({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-surface p-space-md text-center transition-colors hover:border-ink/30 hover:bg-surface-low"
    >
      <span className="mb-space-2xs flex items-center justify-center gap-space-2xs text-label-md text-ink [&_svg]:size-4">
        {icon}
        {title}
      </span>
      <span className="block text-body-sm text-muted">{body}</span>
    </Link>
  );
}
