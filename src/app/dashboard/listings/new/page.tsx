import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, ChevronRight } from "lucide-react";

import { ListingWizard } from "./ListingWizard";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { Pill } from "@/components/ui/Pill";
import { canPublish, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "List a new property" };

/** Screens 17 and 18. */
export default async function NewListingPage() {
  const user = await requireRole("OWNER");

  // Rule 1, enforced at the route: an unverified owner never reaches the form.
  if (!canPublish(user)) redirect("/dashboard/verification");

  return (
    <OwnerShell user={user} current="listings">
      <div className="space-y-space-lg">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-2xs text-body-sm text-muted">
          <Link href="/dashboard" className="hover:text-ink">
            Dashboard
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link href="/dashboard/listings" className="hover:text-ink">
            My Listings
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">Create new listing</span>
        </nav>

        <header className="flex flex-wrap items-start justify-between gap-space-md">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg">List a new property</h1>
            <p className="mt-space-2xs max-w-2xl text-body-md text-muted">
              Provide accurate specifications to improve tenant match accuracy, reduce viewing
              drop-offs, and speed up vetting under Kenyan housing statutes.
            </p>
          </div>
          <Pill tone="success">
            <BadgeCheck className="size-3.5" aria-hidden />
            Verified landlord portal • Cap 296 compliant
          </Pill>
        </header>

        <ListingWizard ownerEstate={user.ownerProfile?.primaryEstate ?? ""} />
      </div>
    </OwnerShell>
  );
}
