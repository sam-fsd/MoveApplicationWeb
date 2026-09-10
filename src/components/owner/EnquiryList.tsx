import Link from "next/link";
import { MessageSquare, Phone } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { formatRelative } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

export interface EnquiryRow {
  id: string;
  message: string;
  createdAt: Date;
  readAt: Date | null;
  reply: string | null;
  tenant: { id: string; fullName: string; phone: string; avatarUrl: string | null };
  listing: { id: string; title: string };
}

/** Recent Enquiries on screen 15 and Tenant Enquiries on screen 19. */
export function EnquiryList({ enquiries, ownerName }: { enquiries: EnquiryRow[]; ownerName: string }) {
  if (enquiries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-space-lg py-space-xl text-center text-body-md text-muted">
        No enquiries yet. They arrive here the moment a tenant messages you.
      </p>
    );
  }

  return (
    <ul className="space-y-space-sm">
      {enquiries.map((enquiry) => (
        <li key={enquiry.id} className="rounded-xl bg-surface-low p-space-md">
          <div className="flex items-start gap-space-sm">
            <Avatar name={enquiry.tenant.fullName} src={enquiry.tenant.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-space-xs">
                <span className="text-label-md text-ink">{enquiry.tenant.fullName}</span>
                {!enquiry.readAt && <Pill tone="warning">Unread</Pill>}
                <span className="ml-auto text-body-sm text-muted">
                  {formatRelative(enquiry.createdAt)}
                </span>
              </p>
              <p className="mt-space-2xs text-body-sm text-muted">
                Interested in{" "}
                <Link href={`/dashboard/listings/${enquiry.listing.id}`} className="text-ink hover:underline">
                  {enquiry.listing.title}
                </Link>
              </p>
              <blockquote className="mt-space-xs rounded-lg bg-surface px-space-sm py-space-xs text-body-md italic text-ink">
                &ldquo;{enquiry.message}&rdquo;
              </blockquote>
              {enquiry.reply && (
                <p className="mt-space-2xs text-body-sm text-success">
                  Replied: &ldquo;{enquiry.reply}&rdquo;
                </p>
              )}
            </div>
          </div>

          <div className="mt-space-sm flex flex-wrap justify-end gap-space-xs">
            <a href={`tel:${enquiry.tenant.phone}`}>
              <Button size="sm" variant="secondary">
                <Phone />
                <span className="sr-only">Call {enquiry.tenant.fullName}</span>
              </Button>
            </a>
            <a
              href={whatsappLink(
                enquiry.tenant.phone,
                `Hello ${enquiry.tenant.fullName.split(" ")[0]}, this is ${ownerName} from MoveApp Kenya about "${enquiry.listing.title}". Viewings are always free — when would suit you?`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="whatsapp">
                <MessageSquare />
                WhatsApp
              </Button>
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
