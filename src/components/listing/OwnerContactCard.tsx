"use client";

import Link from "next/link";
import { useState } from "react";
import { Flag, Lock, MessageSquare, Phone, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { TrustNotice } from "@/components/ui/TrustNotice";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ContactOwnerModal, type ContactOwnerData } from "./ContactOwnerModal";
import { EnquiryModal } from "./EnquiryModal";
import { ReportModal } from "./ReportModal";
import { formatMonthYear } from "@/lib/format";
import { TRUST_COPY } from "@/lib/constants";

/**
 * The sticky owner panel on screen 06. It owns the three modals so that the
 * contact sheet can hand off to the report form without the page re-rendering
 * around it.
 */
export function OwnerContactCard({
  ownerId,
  owner,
  listingId,
  listingTitle,
  listingLocation,
  waMessage,
  emailSubject,
  signedIn,
}: {
  ownerId: string;
  owner: ContactOwnerData;
  listingId: string;
  listingTitle: string;
  listingLocation: string;
  waMessage: string;
  emailSubject: string;
  signedIn: boolean;
}) {
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  return (
    <>
      <div className="space-y-space-md rounded-xl border border-border bg-surface p-space-lg shadow-card">
        <div className="flex items-start gap-space-sm">
          <Avatar name={owner.businessName} src={owner.avatarUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <Link
              href={`/owners/${ownerId}`}
              className="block truncate text-headline-sm hover:text-brand-strong"
            >
              {owner.businessName}
            </Link>
            <VerifiedBadge kind={owner.kind} label={owner.badgeLabel} />
            <p className="mt-space-2xs text-body-sm text-muted">
              Member since {formatMonthYear(owner.memberSince)} • {owner.activeListings} active{" "}
              {owner.activeListings === 1 ? "listing" : "listings"}
            </p>
          </div>
        </div>

        {owner.about && <p className="text-body-md text-muted">{owner.about}</p>}

        {/* Contact details stay hidden until asked for — CLAUDE.md rule 4. */}
        <Button size="lg" className="w-full" onClick={() => setContactOpen(true)}>
          <Phone />
          Show contact (WhatsApp / call)
        </Button>

        <Button variant="secondary" className="w-full" onClick={() => setEnquiryOpen(true)}>
          <MessageSquare />
          Send direct message
        </Button>

        <TrustNotice>{TRUST_COPY.noViewingFee}</TrustNotice>

        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="flex w-full items-center justify-center gap-space-2xs rounded-lg py-space-xs text-label-sm text-muted transition-colors hover:bg-danger-bg hover:text-danger"
        >
          <Flag className="size-4" aria-hidden />
          Report this listing
        </button>

        <div className="flex flex-wrap items-center justify-between gap-space-xs border-t border-border pt-space-sm">
          <span className="flex items-center gap-space-2xs text-body-sm text-muted">
            <Lock className="size-4" aria-hidden />
            No hidden tenancy charges
          </span>
          <Pill tone="success">
            <ShieldCheck className="size-3.5" aria-hidden />
            Cap 296 Compliant
          </Pill>
        </div>
      </div>

      <ContactOwnerModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        owner={owner}
        waMessage={waMessage}
        emailSubject={emailSubject}
        onReport={() => setReportOpen(true)}
      />

      <EnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        listingId={listingId}
        listingTitle={listingTitle}
        defaultMessage={waMessage}
        signedIn={signedIn}
      />

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        listingId={listingId}
        listingTitle={listingTitle}
        listingLocation={listingLocation}
        signedIn={signedIn}
      />
    </>
  );
}
