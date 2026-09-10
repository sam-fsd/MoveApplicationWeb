/**
 * MoveApp has no WhatsApp Business API (CLAUDE.md, out of scope). Contact is a
 * `wa.me` deep link with a prefilled message, which opens the tenant's own
 * WhatsApp — the platform never sits between the two parties.
 */

/** `+254712345678` -> `254712345678`, which is the form wa.me expects. */
export function waNumber(phone: string): string {
  return phone.replace(/[^\d]/g, "").replace(/^0/, "254");
}

/** `+254712345678` -> `+254 712 345 678` for display. */
export function formatPhone(phone: string): string {
  const digits = waNumber(phone);
  const local = digits.startsWith("254") ? digits.slice(3) : digits;
  return `+254 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`.trim();
}

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string): string {
  return `tel:${phone.startsWith("+") ? phone : `+${waNumber(phone)}`}`;
}

export function mailtoLink(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * The prefilled enquiry. It names the listing and states the zero-fee policy up
 * front, so the first message in the thread is already on the record.
 */
export function enquiryMessage(opts: {
  listingTitle: string;
  estate: string;
  rentLabel: string;
  tenantName?: string;
}): string {
  const from = opts.tenantName ? ` I am ${opts.tenantName}.` : "";
  return (
    `Hello, I saw your listing on MoveApp Kenya — ${opts.listingTitle}, ` +
    `${opts.estate}, at ${opts.rentLabel} a month.${from} ` +
    `Is it still available for viewing? I understand there is no viewing fee.`
  );
}
