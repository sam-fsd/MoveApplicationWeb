import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { EnquiryList } from "@/components/owner/EnquiryList";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { Pill } from "@/components/ui/Pill";
import { requireRole } from "@/lib/auth";
import { findEnquiriesForOwner } from "@/lib/queries/notifications";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiries" };

/** The full enquiry queue behind screen 15's "View all". */
export default async function OwnerEnquiriesPage() {
  const user = await requireRole("OWNER");
  const enquiries = await findEnquiriesForOwner(user.id, 100);
  const unread = enquiries.filter((e) => !e.readAt).length;

  return (
    <OwnerShell user={user} current="enquiries">
      <div className="space-y-space-lg">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-2xs text-body-sm text-muted">
          <Link href="/dashboard" className="hover:text-ink">
            Dashboard
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">Enquiries</span>
        </nav>

        <header>
          <h1 className="flex flex-wrap items-center gap-space-sm text-headline-lg-mobile md:text-headline-lg">
            Enquiries
            {unread > 0 && <Pill tone="warning">{unread} unread</Pill>}
          </h1>
          <p className="mt-space-2xs text-body-md text-muted">
            Every tenant who has messaged you, newest first. Replying on WhatsApp is fastest.
          </p>
        </header>

        <section className="rounded-xl border border-border bg-surface p-space-lg">
          <EnquiryList enquiries={enquiries} ownerName={user.fullName} />
        </section>
      </div>
    </OwnerShell>
  );
}
