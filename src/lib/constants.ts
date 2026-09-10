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

/** The four reasons the report modal on screen 08 offers. */
export const REPORT_REASONS = [
  "Illegal Viewing Fee Demanded",
  "Fake Photos / Middleman Broker",
  "Unresponsive Landlord",
  "Rent Price Misrepresentation",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

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
