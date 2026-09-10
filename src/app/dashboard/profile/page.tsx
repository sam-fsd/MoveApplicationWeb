import Link from "next/link";
import { BadgeCheck, ChevronRight, ExternalLink } from "lucide-react";

import { ProfileForm } from "./ProfileForm";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit public profile" };

/** Screen 14. */
export default async function OwnerProfilePage() {
  const user = await requireRole("OWNER");
  const profile = user.ownerProfile;
  if (!profile) throw new Error("Owner account is missing its profile.");

  const [full, listings] = await Promise.all([
    db.ownerProfile.findUniqueOrThrow({
      where: { id: profile.id },
      select: { about: true, memberSince: true },
    }),
    db.listing.count({ where: { ownerId: user.id, status: "PUBLISHED" } }),
  ]);

  const approved = profile.verification?.state === "APPROVED";

  return (
    <OwnerShell user={user} current="profile">
      <div className="space-y-space-lg">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-2xs text-body-sm text-muted">
          <Link href="/dashboard" className="hover:text-ink">
            Dashboard
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">Edit profile</span>
        </nav>

        <header className="flex flex-wrap items-start justify-between gap-space-md">
          <div className="max-w-2xl">
            <p className="mb-space-xs flex flex-wrap items-center gap-space-xs">
              <Pill tone={approved ? "success" : "warning"} dot>
                {approved ? "Public profile live" : "Not public until verified"}
              </Pill>
              {approved && (
                <Pill tone="success">
                  <BadgeCheck className="size-3.5" aria-hidden />
                  Cap 296 verified landlord
                </Pill>
              )}
            </p>
            <h1 className="text-headline-lg-mobile md:text-headline-lg">
              Edit public landlord profile
            </h1>
            <p className="mt-space-2xs text-body-md text-muted">
              Customise how your identity, licensing credentials, and portfolio appear to
              prospective Nairobi tenants across discovery searches and listing cards.
            </p>
          </div>

          {approved && (
            <Link href={`/owners/${user.id}`} target="_blank">
              <Button variant="secondary">
                <ExternalLink />
                View live profile
              </Button>
            </Link>
          )}
        </header>

        <ProfileForm
          initial={{
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            businessName: profile.businessName,
            about: full.about,
            primaryEstate: profile.primaryEstate,
            kind: profile.kind,
            badgeLabel: profile.badgeLabel,
            memberSince: full.memberSince,
            listings,
            approved,
          }}
        />
      </div>
    </OwnerShell>
  );
}
