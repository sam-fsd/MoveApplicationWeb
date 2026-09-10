"use client";

import { useState } from "react";
import { Copy, Check, Mail, MessageSquare, Phone, ShieldAlert } from "lucide-react";
import type { OwnerKind } from "@prisma/client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { formatMonthYear } from "@/lib/format";
import { mailtoLink, telLink, whatsappLink } from "@/lib/whatsapp";

export interface ContactOwnerData {
  businessName: string;
  kind: OwnerKind;
  badgeLabel: string | null;
  about: string;
  avatarUrl: string | null;
  phone: string;
  displayPhone: string;
  email: string;
  memberSince: Date;
  activeListings: number;
}

/**
 * Screen 07. Contact details stay hidden until the tenant asks for them
 * (CLAUDE.md rule 4), and WhatsApp leads because that is how Nairobi actually
 * reaches a landlord. The safety advisory rides along every time.
 */
export function ContactOwnerModal({
  open,
  onClose,
  owner,
  waMessage,
  emailSubject,
  onReport,
}: {
  open: boolean;
  onClose: () => void;
  owner: ContactOwnerData;
  waMessage: string;
  emailSubject: string;
  onReport: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex flex-wrap items-center gap-space-xs">
          {owner.businessName}
          <VerifiedBadge kind={owner.kind} label={owner.badgeLabel} variant="pill" />
        </span>
      }
      subtitle={`Member since ${formatMonthYear(owner.memberSince)} • ${owner.activeListings} active ${
        owner.activeListings === 1 ? "listing" : "listings"
      }`}
      icon={<Avatar name={owner.businessName} src={owner.avatarUrl} />}
    >
      <div className="space-y-space-md">
        {owner.about && <p className="text-body-md text-muted">{owner.about}</p>}

        <ContactRow
          icon={<MessageSquare />}
          label="Direct phone / WhatsApp"
          value={owner.displayPhone}
          copyValue={owner.phone}
          primary={{
            href: whatsappLink(owner.phone, waMessage),
            label: "WhatsApp",
            variant: "whatsapp",
            icon: <MessageSquare />,
          }}
          secondary={{ href: telLink(owner.phone), label: "Call", icon: <Phone /> }}
        />

        <ContactRow
          icon={<Mail />}
          label="Email address"
          value={owner.email}
          copyValue={owner.email}
          primary={{
            href: mailtoLink(owner.email, emailSubject, waMessage),
            label: "Email",
            variant: "secondary",
            icon: <Mail />,
          }}
        />

        <p className="flex items-start gap-space-xs rounded-lg bg-warning-bg px-space-sm py-space-xs text-body-sm text-ink">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <span>
            <strong>Safety advisory:</strong> never send money or pay a deposit or viewing fee
            before physically viewing the house in person with the verified owner or caretaker.
          </span>
        </p>

        <button
          type="button"
          onClick={() => {
            onClose();
            onReport();
          }}
          className="text-label-sm text-danger underline-offset-2 hover:underline"
        >
          Report this listing
        </button>
      </div>
    </Modal>
  );
}

function ContactRow({
  icon,
  label,
  value,
  copyValue,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyValue: string;
  primary: { href: string; label: string; variant: "whatsapp" | "secondary"; icon: React.ReactNode };
  secondary?: { href: string; label: string; icon: React.ReactNode };
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-space-sm rounded-xl border border-border bg-surface-low p-space-sm">
      <span className="shrink-0 text-muted [&_svg]:size-4" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-caption uppercase tracking-wider text-muted">{label}</span>
        <span className="block truncate text-label-md text-ink">{value}</span>
      </span>

      <span className="flex shrink-0 items-center gap-space-2xs">
        {secondary && (
          <a href={secondary.href}>
            <Button size="sm" variant="secondary">
              {secondary.icon}
              {secondary.label}
            </Button>
          </a>
        )}
        <a href={primary.href} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant={primary.variant}>
            {primary.icon}
            {primary.label}
          </Button>
        </a>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(copyValue);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              // Clipboard is unavailable in some browsers without permission;
              // the value is on screen and selectable either way.
            }
          }}
          className="rounded-lg p-space-2xs text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
          <span className="sr-only">{copied ? "Copied" : `Copy ${label}`}</span>
        </button>
      </span>
    </div>
  );
}
