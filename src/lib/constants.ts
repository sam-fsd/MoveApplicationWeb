import type {
  HouseType,
  ListingStatus,
  OwnerKind,
  ReportSeverity,
  ReportStatus,
} from "@prisma/client";

/**
 * The vocabulary the screens hardcode, in one place. Anything a filter, a pill,
 * or a seed row needs to spell consistently belongs here rather than inline.
 */

/** CLAUDE.md rule 8. Order matters — this is the filter dropdown order. */
export const ESTATES = [
  "Westlands",
  "Kilimani",
  "Parklands",
  "Ngong Road",
  "South B",
  "Roysambu",
  "Kasarani",
  "Ruaka",
  "Rongai",
  "Umoja",
  "Embakasi",
] as const;

export type Estate = (typeof ESTATES)[number];

/**
 * House type is the building, not the bedroom count — screen 04 filters the two
 * separately. Plural labels are what the filter list shows; singular labels are
 * what a card chip shows.
 */
export const HOUSE_TYPES: { value: HouseType; label: string; plural: string }[] = [
  { value: "BEDSITTER", label: "Bedsitter", plural: "Bedsitters" },
  { value: "SINGLE_ROOM", label: "Single Room", plural: "Single Rooms" },
  { value: "STUDIO", label: "Studio", plural: "Studio Units" },
  { value: "APARTMENT", label: "Apartment", plural: "Apartments" },
  { value: "MAISONETTE", label: "Maisonette", plural: "Maisonettes" },
  { value: "TOWNHOUSE", label: "Townhouse", plural: "Townhouses" },
];

export const HOUSE_TYPE_LABEL: Record<HouseType, string> = Object.fromEntries(
  HOUSE_TYPES.map((t) => [t.value, t.label]),
) as Record<HouseType, string>;

/** The utilities that carry weight in Nairobi — the "Crucial Utilities" filter block. */
export const AMENITIES = [
  "Borehole Water 24/7",
  "Prepaid KPLC Token",
  "Fibre-Optic Ready",
  "Backup Generator",
  "Dedicated Parking Bay",
  "24/7 Security Guard & CCTV",
  "Perimeter Electric Fence",
  "Modern Fitted Wardrobes",
  "Private Laundry Balcony",
  "Lift / Elevator",
] as const;

/**
 * Report reasons.
 *
 * Screen 08's modal offers six tenant-facing options; screen 20's admin queue
 * tags reports with shorter phrases. They are the same reports seen from two
 * ends, so the stored `reason` is the admin tag and the modal carries the
 * longer label and blurb. Severity is derived here rather than chosen by the
 * reporter — a demanded viewing fee is always critical.
 */
export const REPORT_REASON_OPTIONS = [
  {
    reason: "Fake Photos / Middleman Broker",
    label: "Listing is fake or a scam",
    description: "Impersonating owners, nonexistent location, or cloned photos",
    severity: "CRITICAL",
  },
  {
    reason: "House Already Taken",
    label: "House is already taken",
    description: "Unit was already rented or no longer available",
    severity: "LOW",
  },
  {
    reason: "Rent Price Misrepresentation",
    label: "Wrong price or location",
    description: "Quoted higher rent upon enquiry, or inaccurate street and neighbourhood",
    severity: "MODERATE",
  },
  {
    reason: "Illegal Viewing Fee Demanded",
    label: "Owner asked for money upfront",
    description:
      "Landlord or agent demanded a viewing fee, fuel facilitation, or a deposit prior to viewing",
    severity: "CRITICAL",
    critical: true,
  },
  {
    reason: "Offensive Content",
    label: "Offensive content",
    description: "Inappropriate images, discriminatory terms, or abusive conduct",
    severity: "MODERATE",
  },
  {
    reason: "Other",
    label: "Other",
    description: "Any other issue not covered above",
    severity: "LOW",
  },
] as const satisfies readonly {
  reason: string;
  label: string;
  description: string;
  severity: ReportSeverity;
  critical?: boolean;
}[];

/** Every reason that may be stored, including ones only the seed produces. */
export const REPORT_REASONS = [
  ...REPORT_REASON_OPTIONS.map((o) => o.reason),
  "Unresponsive Landlord",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export function severityForReason(reason: string): ReportSeverity {
  return REPORT_REASON_OPTIONS.find((o) => o.reason === reason)?.severity ?? "MODERATE";
}

export const REPORT_DETAILS_MAX = 500;

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  PENDING_REVIEW: "Pending Review",
  PUBLISHED: "Published",
  RENTED_OUT: "Rented Out",
  REJECTED: "Rejected",
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

export const REPORT_SEVERITY_LABEL: Record<ReportSeverity, string> = {
  LOW: "Low",
  MODERATE: "Moderate",
  CRITICAL: "Critical",
};

/**
 * The exports use five badge strings against two OwnerKind values, so the label
 * is kind-derived with a per-owner override on OwnerProfile.badgeLabel.
 */
export const BADGE_LABEL_BY_KIND: Record<OwnerKind, string> = {
  LANDLORD: "Verified Landlord",
  AGENT: "Verified Agent",
};

export function verifiedBadgeLabel(kind: OwnerKind, override?: string | null): string {
  return override?.trim() || BADGE_LABEL_BY_KIND[kind];
}

/** Copy that repeats verbatim across screens. */
export const TRUST_COPY = {
  noViewingFee: "Never pay viewing fees. MoveApp guarantees free direct viewings.",
  approximateLocation:
    "Approximate location shown for privacy. Exact building and unit address will be shared directly by the owner once you confirm an enquiry or schedule a viewing.",
  compliance: "Compliant with the Rent Restriction Act (Cap 296) and the Landlord and Tenant Act of the Laws of Kenya.",
} as const;
