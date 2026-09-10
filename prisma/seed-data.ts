import type { HouseType, OwnerKind, ReportSeverity, ReportStatus } from "@prisma/client";

/**
 * The cast and the catalogue. Kept apart from seed.ts so the writing logic
 * stays readable and the data reads like a table you can check against the
 * screens.
 *
 * Names come from the pool in docs/DATA_MODEL.md plus the ones the designs put
 * on screen. Where a screen names a person, that person exists here with the
 * same role, estate, and business.
 */

export const DEMO_PASSWORD = "moveapp123";

export interface OwnerSeed {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  kind: OwnerKind;
  about: string;
  primaryEstate: string;
  badgeLabel: string | null;
  memberSince: string;
  avatarUrl?: string;
  /** APPROVED owners carry a certificate number; PENDING ones do not. */
  certificateNumber?: string;
  /** Documents on file — screen 20 lists these as chips under each pending row. */
  documents: string[];
  /** PENDING owners only: how long ago the file was submitted, in hours. */
  submittedHoursAgo?: number;
}

export const APPROVED_OWNERS: OwnerSeed[] = [
  {
    // The dashboard on screen 15 is this account. Demo login: owner@moveapp.ke
    fullName: "Samuel Njoroge",
    email: "owner@moveapp.ke",
    phone: "+254712345678",
    businessName: "Kamau Properties Ltd",
    kind: "LANDLORD",
    about:
      "Managing verified, scam-free residential apartments across Westlands and Kilimani with zero middleman fees.",
    primaryEstate: "Westlands",
    badgeLabel: "Verified Landlord",
    memberSince: "2023-05-14",
    avatarUrl: "/seed/avatars/owner-headshot.png",
    certificateNumber: "#MP-NBI-2025-084",
    documents: ["National ID", "KRA PIN", "Title Deed"],
  },
  {
    fullName: "Achieng Njoroge",
    email: "achieng@otienorealestate.co.ke",
    phone: "+254720114477",
    businessName: "Otieno Real Estate",
    kind: "AGENT",
    about:
      "Registered estate agency letting vetted units in Kilimani and Ngong Road. Every unit is inspected before it is listed.",
    primaryEstate: "Kilimani",
    badgeLabel: "Verified Agent",
    memberSince: "2022-11-02",
    certificateNumber: "#MP-NBI-2025-061",
    documents: ["National ID", "KRA PIN", "Agency Mandate"],
  },
  {
    fullName: "David Ochieng",
    email: "david.ochieng@moveapp.ke",
    phone: "+254733220981",
    businessName: "Ochieng Family Properties",
    kind: "LANDLORD",
    about:
      "Family-owned maisonettes and townhouses in quiet Westlands pockets. Direct landlord, no agents involved.",
    primaryEstate: "Westlands",
    badgeLabel: "Verified Landlord",
    memberSince: "2021-08-19",
    certificateNumber: "#MP-NBI-2025-072",
    documents: ["National ID", "KRA PIN", "Title Deed"],
  },
  {
    fullName: "Faith Muthoni",
    email: "faith@primehaven.co.ke",
    phone: "+254701556320",
    businessName: "Prime Haven Agencies",
    kind: "AGENT",
    about:
      "Parklands and Westlands specialists. We hold the keys, so viewings are same-day and always free.",
    primaryEstate: "Parklands",
    badgeLabel: "Verified Agent",
    memberSince: "2023-02-07",
    certificateNumber: "#MP-NBI-2025-055",
    documents: ["National ID", "KRA PIN", "Agency Mandate"],
  },
  {
    fullName: "Hassan Noor",
    email: "hassan.noor@moveapp.ke",
    phone: "+254724889012",
    businessName: "Noor Residences",
    kind: "LANDLORD",
    about:
      "Executive studios and one-bedrooms along Parklands 4th Avenue, walking distance to MP Shah.",
    primaryEstate: "Parklands",
    badgeLabel: "Verified Owner",
    memberSince: "2024-01-22",
    certificateNumber: "#MP-NBI-2025-090",
    documents: ["National ID", "KRA PIN", "Title Deed"],
  },
  {
    fullName: "Jane Muthoni",
    email: "jane.muthoni@moveapp.ke",
    phone: "+254715003344",
    businessName: "Woodvale Grove Rentals",
    kind: "LANDLORD",
    about: "Two-bedroom classics around Woodvale Grove with high ceilings and mature gardens.",
    primaryEstate: "Westlands",
    badgeLabel: "Verified Landlord",
    memberSince: "2023-09-11",
    certificateNumber: "#MP-NBI-2025-093",
    documents: ["National ID", "KRA PIN", "Title Deed"],
  },
];

/** The four rows in the Pending Owner Verifications panel on screen 20. */
export const PENDING_OWNERS: OwnerSeed[] = [
  {
    fullName: "Grace Muthoni Wambui",
    email: "grace@kilimaniheights.co.ke",
    phone: "+254706221345",
    businessName: "Kilimani Heights Ltd",
    kind: "AGENT",
    about: "New agency bringing serviced Kilimani apartments onto MoveApp.",
    primaryEstate: "Kilimani",
    badgeLabel: null,
    memberSince: "2026-08-30",
    documents: ["Title Deed", "Mandate"],
    submittedHoursAgo: 19,
  },
  {
    fullName: "Peter Kiprono Langat",
    email: "peter.langat@southbresidentials.co.ke",
    phone: "+254799442100",
    businessName: "South B Residentials",
    kind: "LANDLORD",
    about: "Affordable family units in South B and Nairobi South.",
    primaryEstate: "South B",
    badgeLabel: null,
    memberSince: "2026-09-06",
    documents: ["National ID", "KPLC Meter Bill"],
    submittedHoursAgo: 52,
  },
  {
    fullName: "Amina Hassan Noor",
    email: "amina@parklandsexec.co.ke",
    phone: "+254788310277",
    businessName: "Parklands Executive Suites",
    kind: "LANDLORD",
    about: "Furnished executive suites for short and long stays in Parklands.",
    primaryEstate: "Parklands",
    badgeLabel: null,
    memberSince: "2026-09-05",
    documents: ["Cert of Lease", "Passport"],
    submittedHoursAgo: 74,
  },
  {
    fullName: "Peter Kariuki",
    email: "peter.kariuki@roysambugroup.co.ke",
    phone: "+254711908654",
    businessName: "Roysambu Property Group",
    kind: "AGENT",
    about: "Bedsitters and one-bedrooms around Roysambu, Kasarani, and Thome.",
    primaryEstate: "Roysambu",
    badgeLabel: null,
    memberSince: "2026-09-08",
    documents: ["National ID", "KRA PIN"],
    submittedHoursAgo: 6,
  },
];

export interface TenantSeed {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  preferredEstates: string[];
  budgetMin: number;
  budgetMax: number;
  preferredTypes: HouseType[];
}

export const TENANTS: TenantSeed[] = [
  {
    // Demo login: tenant@moveapp.ke
    fullName: "Wanjiku Mwangi",
    email: "tenant@moveapp.ke",
    phone: "+254701234567",
    avatarUrl: "/seed/avatars/tenant-portrait.png",
    preferredEstates: ["Westlands", "Parklands"],
    budgetMin: 20000,
    budgetMax: 95000,
    preferredTypes: ["APARTMENT", "STUDIO"],
  },
  {
    fullName: "Brian Otieno",
    email: "brian.otieno@example.co.ke",
    phone: "+254702345671",
    preferredEstates: ["Westlands", "Kilimani"],
    budgetMin: 30000,
    budgetMax: 60000,
    preferredTypes: ["APARTMENT"],
  },
  {
    fullName: "Kevin Omondi",
    email: "kevin.omondi@example.co.ke",
    phone: "+254703345672",
    preferredEstates: ["Westlands"],
    budgetMin: 40000,
    budgetMax: 70000,
    preferredTypes: ["APARTMENT", "MAISONETTE"],
  },
  {
    fullName: "Mercy Achieng",
    email: "mercy.achieng@example.co.ke",
    phone: "+254704345673",
    preferredEstates: ["Parklands", "Ngong Road"],
    budgetMin: 20000,
    budgetMax: 35000,
    preferredTypes: ["STUDIO", "BEDSITTER"],
  },
  {
    fullName: "David Kariuki",
    email: "david.kariuki@example.co.ke",
    phone: "+254705345674",
    preferredEstates: ["Kilimani", "Kileleshwa"],
    budgetMin: 45000,
    budgetMax: 90000,
    preferredTypes: ["TOWNHOUSE", "MAISONETTE"],
  },
  {
    fullName: "Faith Chebet",
    email: "faith.chebet@example.co.ke",
    phone: "+254706345675",
    preferredEstates: ["Kilimani"],
    budgetMin: 25000,
    budgetMax: 45000,
    preferredTypes: ["APARTMENT"],
  },
  {
    fullName: "Cynthia Wairimu",
    email: "cynthia.wairimu@example.co.ke",
    phone: "+254707345676",
    preferredEstates: ["Kasarani", "Roysambu"],
    budgetMin: 12000,
    budgetMax: 25000,
    preferredTypes: ["BEDSITTER", "SINGLE_ROOM"],
  },
  {
    fullName: "Dennis Mutua",
    email: "dennis.mutua@example.co.ke",
    phone: "+254708345677",
    preferredEstates: ["South B", "Embakasi"],
    budgetMin: 15000,
    budgetMax: 30000,
    preferredTypes: ["APARTMENT", "BEDSITTER"],
  },
  {
    fullName: "Joyce Nyambura",
    email: "joyce.nyambura@example.co.ke",
    phone: "+254709345678",
    preferredEstates: ["Ruaka", "Roysambu"],
    budgetMin: 18000,
    budgetMax: 32000,
    preferredTypes: ["APARTMENT", "STUDIO"],
  },
  {
    fullName: "Collins Barasa",
    email: "collins.barasa@example.co.ke",
    phone: "+254710345679",
    preferredEstates: ["Umoja", "Embakasi"],
    budgetMin: 10000,
    budgetMax: 20000,
    preferredTypes: ["SINGLE_ROOM", "BEDSITTER"],
  },
  {
    fullName: "Esther Wanjiru",
    email: "esther.wanjiru@example.co.ke",
    phone: "+254711345680",
    preferredEstates: ["Ngong Road", "Kilimani"],
    budgetMin: 28000,
    budgetMax: 50000,
    preferredTypes: ["APARTMENT"],
  },
  {
    fullName: "Victor Kiptoo",
    email: "victor.kiptoo@example.co.ke",
    phone: "+254712345681",
    preferredEstates: ["Rongai", "Ngong Road"],
    budgetMin: 15000,
    budgetMax: 28000,
    preferredTypes: ["BEDSITTER", "APARTMENT"],
  },
];

export const ADMIN = {
  fullName: "Aisha Karanja",
  email: "admin@moveapp.ke",
  phone: "+254700000001",
  title: "Admin — Nairobi Ops",
};

export interface ListingSeed {
  /** Index into APPROVED_OWNERS. */
  owner: number;
  title: string;
  houseType: HouseType;
  bedrooms: number;
  bathrooms: number;
  rentKes: number;
  depositMonths: number;
  serviceCharge: boolean;
  furnished: boolean;
  estate: string;
  roadOrLandmark: string;
  status: "PENDING_REVIEW" | "PUBLISHED" | "RENTED_OUT" | "REJECTED";
  amenities: [string, string?][];
  floorAreaSqft?: number;
  parkingSpaces?: number;
  highlight?: string;
  bedroomsNote?: string;
  bathroomsNote?: string;
  furnishedNote?: string;
  /** Days before "today" the listing was created. Drives sort-by-newest. */
  ageDays: number;
  description: string;
}

const BOREHOLE: [string, string] = ["Borehole Water 24/7", "Zero water rationing"];
const TOKEN: [string, string] = ["Prepaid KPLC Token", "Individual unit meter"];
const FIBRE: [string, string] = ["Fibre-Optic Ready", "Zuku / Safaricom wired"];

/**
 * The first six belong to Samuel Njoroge and reproduce his dashboard on screen
 * 15 exactly — four published, one pending review, one rented out.
 */
export const LISTINGS: ListingSeed[] = [
  {
    owner: 0,
    title: "2 Bedroom Apartment in Westlands",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 1,
    rentKes: 45000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: true,
    estate: "Westlands",
    roadOrLandmark: "Muthithi Road, near Westgate & Sarit Centre",
    status: "PUBLISHED",
    amenities: [BOREHOLE, TOKEN, FIBRE, ["Backup Generator", "Elevator"], ["Dedicated Parking Bay", "1 Car"], ["24/7 Security Guard & CCTV"], ["Perimeter Electric Fence"], ["Modern Fitted Wardrobes"], ["Private Laundry Balcony"]],
    floorAreaSqft: 900,
    parkingSpaces: 1,
    bedroomsNote: "Master Ensuite",
    bathroomsNote: "Hot Instant Shower",
    furnishedNote: "L-Couch & Dining",
    ageDays: 3,
    description:
      "This meticulously kept 2-bedroom home on Muthithi Road offers an optimal balance of Nairobi city vibrance and compound quietude. The open-concept living room opens through expansive sliding glass doors onto a leafy private balcony overlooking tree-lined Westlands views. Fitted with natural parquet flooring, a modern breakfast bar kitchen with granite slabs, and built-in mahogany bedroom wardrobes, this apartment provides an exceptional turnkey living standard.\n\nThe compound is professionally managed with around-the-clock uniformed guards, perimeter electric fencing, and continuous CCTV surveillance. High-capacity borehole backup ensures you never face Nairobi city council water disruptions, while an automatic standby generator powers the high-speed elevator and common areas during outages. Enjoy seamless 5-minute walks to Sarit Centre, Westgate Mall, leading commercial banks, and multiple transit links along Waiyaki Way and Parklands.",
  },
  {
    owner: 0,
    title: "Executive Studio on 4th Avenue",
    houseType: "STUDIO",
    bedrooms: 0,
    bathrooms: 1,
    rentKes: 28000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: true,
    estate: "Parklands",
    roadOrLandmark: "Parklands 4th Ave, near MP Shah",
    status: "PUBLISHED",
    amenities: [["Biometric Access", "Fingerprint entry"], TOKEN, FIBRE, ["Lift / Elevator"], ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 480,
    parkingSpaces: 0,
    highlight: "All-Inc Water",
    bathroomsNote: "Hot Instant Shower",
    furnishedNote: "Fully furnished",
    ageDays: 12,
    description:
      "A high-floor executive studio built for a professional who wants zero commute friction. Biometric lobby access, a dedicated fibre line, and prepaid tokens so you only pay for what you use. MP Shah Hospital, Diamond Plaza, and the Parklands business strip are all inside a ten-minute walk.",
  },
  {
    owner: 0,
    title: "Spacious 2 Bed Master Ensuite",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 2,
    rentKes: 52000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "Westlands",
    roadOrLandmark: "Rhapta Road, Westlands",
    status: "PENDING_REVIEW",
    amenities: [BOREHOLE, ["Backup Generator", "Standby Gen"], TOKEN, ["Dedicated Parking Bay", "1 Bay"], ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 1050,
    parkingSpaces: 1,
    highlight: "Dep: 1 Mo",
    bedroomsNote: "Master Ensuite",
    ageDays: 1,
    description:
      "Corner unit on Rhapta Road with two full bathrooms and a standby generator that carries the whole apartment, not just the corridors. Unfurnished so you can bring your own, with generous built-in wardrobes in both bedrooms.",
  },
  {
    owner: 0,
    title: "Modern 1 Bed with Private Balcony",
    houseType: "APARTMENT",
    bedrooms: 1,
    bathrooms: 1,
    rentKes: 38000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: false,
    estate: "Westlands",
    roadOrLandmark: "Mpaka Road, Westlands",
    status: "RENTED_OUT",
    amenities: [FIBRE, TOKEN, ["Dedicated Parking Bay"], ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 650,
    parkingSpaces: 1,
    ageDays: 46,
    description:
      "One-bedroom on Mpaka Road with a private balcony facing away from the road. Currently tenanted — kept on the platform so returning tenants can see the unit history.",
  },
  {
    owner: 0,
    title: "Sunlit 1-Bedroom with Scenic City Views",
    houseType: "APARTMENT",
    bedrooms: 1,
    bathrooms: 1,
    rentKes: 42000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: true,
    estate: "Westlands",
    roadOrLandmark: "Muthithi Road, Westlands Hub",
    status: "PUBLISHED",
    amenities: [["Lift / Elevator", "Lift & Backup Gen"], ["Backup Generator"], TOKEN, FIBRE],
    floorAreaSqft: 680,
    parkingSpaces: 1,
    highlight: "Token Meter",
    ageDays: 8,
    description:
      "North-facing one-bedroom on the Westlands hub with an unbroken city skyline from the living room. Lift and backup generator on the block, prepaid token metering per unit.",
  },
  {
    owner: 0,
    title: "Garden Court 2 Bed near Sarit",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 2,
    rentKes: 56000,
    depositMonths: 2,
    serviceCharge: true,
    furnished: false,
    estate: "Westlands",
    roadOrLandmark: "Church Road, near Sarit Centre",
    status: "PUBLISHED",
    amenities: [BOREHOLE, ["Dedicated Parking Bay", "2 Cars"], ["24/7 Security Guard & CCTV"], ["Private Laundry Balcony"], FIBRE],
    floorAreaSqft: 1120,
    parkingSpaces: 2,
    highlight: "Gated Court",
    bedroomsNote: "Both Ensuite",
    ageDays: 21,
    description:
      "Ground-floor unit in a six-house gated court off Church Road, with a shared lawn and two dedicated parking bays. Two ensuite bedrooms and a separate laundry balcony.",
  },

  // Achieng Njoroge — Otieno Real Estate (Kilimani, Ngong Road)
  {
    owner: 1,
    title: "1 Bed Furnished in Kilimani",
    houseType: "APARTMENT",
    bedrooms: 1,
    bathrooms: 1,
    rentKes: 47000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: true,
    estate: "Kilimani",
    roadOrLandmark: "Ring Road Kilimani, near Yaya Centre",
    status: "PUBLISHED",
    amenities: [BOREHOLE, FIBRE, ["Lift / Elevator"], ["24/7 Security Guard & CCTV"], ["Modern Fitted Wardrobes"]],
    floorAreaSqft: 700,
    parkingSpaces: 1,
    ageDays: 5,
    description:
      "Fully furnished one-bedroom five minutes from Yaya Centre. Comes with a workstation, fibre, and borehole backup — set up for someone working from home.",
  },
  {
    owner: 1,
    title: "Serviced 2 Bed in Kilimani Heights",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 2,
    rentKes: 62000,
    depositMonths: 2,
    serviceCharge: true,
    furnished: true,
    estate: "Kilimani",
    roadOrLandmark: "Dennis Pritt Road, Kilimani",
    status: "PUBLISHED",
    amenities: [BOREHOLE, ["Backup Generator"], ["Lift / Elevator"], ["24/7 Security Guard & CCTV"], FIBRE, ["Dedicated Parking Bay"]],
    floorAreaSqft: 1180,
    parkingSpaces: 1,
    highlight: "Service Incl.",
    bedroomsNote: "Master Ensuite",
    ageDays: 15,
    description:
      "Serviced two-bedroom on Dennis Pritt with weekly common-area cleaning included in the service charge. Gym and rooftop terrace in the block.",
  },
  {
    owner: 1,
    title: "3 Bed Townhouse in Kileleshwa",
    houseType: "TOWNHOUSE",
    bedrooms: 3,
    bathrooms: 3,
    rentKes: 78000,
    depositMonths: 2,
    serviceCharge: false,
    furnished: false,
    estate: "Kilimani",
    roadOrLandmark: "Laikipia Road, Kileleshwa",
    status: "PUBLISHED",
    amenities: [BOREHOLE, ["Private Garden"], ["Dedicated Parking Bay", "2 Cars"], ["24/7 Security Guard & CCTV"], ["Backup Generator"]],
    floorAreaSqft: 2100,
    parkingSpaces: 2,
    bedroomsNote: "All Ensuite",
    ageDays: 33,
    description:
      "Three-bedroom townhouse on Laikipia Road with a private walled garden and a domestic-staff quarter. All bedrooms ensuite, DSQ separate.",
  },
  {
    owner: 1,
    title: "Bedsitter off Ngong Road",
    houseType: "BEDSITTER",
    bedrooms: 0,
    bathrooms: 1,
    rentKes: 16500,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "Ngong Road",
    roadOrLandmark: "Off Ngong Road, near Prestige Plaza",
    status: "PUBLISHED",
    amenities: [TOKEN, ["24/7 Security Guard & CCTV"], ["Borehole Water 24/7"]],
    floorAreaSqft: 320,
    parkingSpaces: 0,
    ageDays: 9,
    description:
      "Clean bedsitter within walking distance of Prestige Plaza and the Ngong Road matatu stage. Prepaid token metering, water included in rent.",
  },
  {
    owner: 1,
    title: "Compact 2 Bed on Ngong Road",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 1,
    rentKes: 34000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "Ngong Road",
    roadOrLandmark: "Ngong Road, near Adams Arcade",
    status: "PUBLISHED",
    amenities: [TOKEN, FIBRE, ["Dedicated Parking Bay"], ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 780,
    parkingSpaces: 1,
    ageDays: 27,
    description:
      "Two-bedroom near Adams Arcade with quick access to the Southern Bypass. Sensible rent for the location, no service charge.",
  },
  {
    owner: 1,
    title: "Studio Apartment in Kilimani",
    houseType: "STUDIO",
    bedrooms: 0,
    bathrooms: 1,
    rentKes: 26000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: true,
    estate: "Kilimani",
    roadOrLandmark: "Argwings Kodhek Road, Kilimani",
    status: "PENDING_REVIEW",
    amenities: [FIBRE, ["Lift / Elevator"], ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 420,
    parkingSpaces: 0,
    ageDays: 2,
    description:
      "Furnished studio on Argwings Kodhek with a Murphy bed and a full kitchenette. Walking distance to Kilimani's restaurant strip.",
  },

  // David Ochieng — Ochieng Family Properties (Westlands)
  {
    owner: 2,
    title: "Modern Maisonette with Private Garden",
    houseType: "MAISONETTE",
    bedrooms: 3,
    bathrooms: 3.5,
    rentKes: 85000,
    depositMonths: 2,
    serviceCharge: false,
    furnished: false,
    estate: "Westlands",
    roadOrLandmark: "School Lane, Quiet Westlands Pocket",
    status: "PUBLISHED",
    amenities: [BOREHOLE, ["Private Garden"], ["Dedicated Parking Bay", "2 Cars"], ["24/7 Security Guard & CCTV"], ["Backup Generator"], ["Perimeter Electric Fence"]],
    floorAreaSqft: 2400,
    parkingSpaces: 2,
    highlight: "Private Garden",
    bedroomsNote: "All Ensuite",
    ageDays: 6,
    description:
      "Detached maisonette on School Lane with a mature private garden, a double carport, and a separate DSQ. One of the quietest pockets in Westlands.",
  },
  {
    owner: 2,
    title: "4 Bed Family Maisonette in Westlands",
    houseType: "MAISONETTE",
    bedrooms: 4,
    bathrooms: 3,
    rentKes: 92000,
    depositMonths: 2,
    serviceCharge: false,
    furnished: false,
    estate: "Westlands",
    roadOrLandmark: "Peponi Road, Westlands",
    status: "PUBLISHED",
    amenities: [BOREHOLE, ["Private Garden"], ["Dedicated Parking Bay", "2 Cars"], ["Backup Generator"], ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 2800,
    parkingSpaces: 2,
    ageDays: 40,
    description:
      "Four-bedroom family maisonette on Peponi Road, walking distance to two international schools. Large lawn, borehole, and a generator that runs the whole house.",
  },
  {
    owner: 2,
    title: "2 Bed Ensuite in Westlands Triangle",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 2,
    rentKes: 60000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: true,
    estate: "Westlands",
    roadOrLandmark: "Sports Road, Westlands Triangle",
    status: "PUBLISHED",
    amenities: [["24/7 Security Guard & CCTV", "24/7 CCTV"], ["Lift / Elevator", "Fast Lift"], BOREHOLE, FIBRE],
    floorAreaSqft: 1090,
    parkingSpaces: 1,
    highlight: "Service Incl.",
    bedroomsNote: "Both Ensuite",
    ageDays: 11,
    description:
      "Contemporary two-bedroom in the Westlands Triangle with both bedrooms ensuite and a fast lift. Service charge covers water, security, and common-area power.",
  },
  {
    owner: 2,
    title: "Townhouse with DSQ in Westlands",
    houseType: "TOWNHOUSE",
    bedrooms: 3,
    bathrooms: 2.5,
    rentKes: 72000,
    depositMonths: 2,
    serviceCharge: true,
    furnished: false,
    estate: "Westlands",
    roadOrLandmark: "Brookside Drive, Westlands",
    status: "RENTED_OUT",
    amenities: [BOREHOLE, ["Dedicated Parking Bay", "2 Cars"], ["24/7 Security Guard & CCTV"], ["Private Garden"]],
    floorAreaSqft: 1950,
    parkingSpaces: 2,
    ageDays: 88,
    description:
      "Three-bedroom townhouse on Brookside Drive with a domestic-staff quarter and a small private yard. Currently tenanted.",
  },

  // Faith Muthoni — Prime Haven Agencies (Parklands)
  {
    owner: 3,
    title: "Executive High-Floor Studio Suite",
    houseType: "STUDIO",
    bedrooms: 0,
    bathrooms: 1,
    rentKes: 28000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: true,
    estate: "Parklands",
    roadOrLandmark: "4th Parklands Ave, near MP Shah",
    status: "PUBLISHED",
    amenities: [["Biometric Access", "Biometric"], FIBRE, ["Lift / Elevator"], ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 500,
    parkingSpaces: 0,
    highlight: "All-Inc Water",
    ageDays: 4,
    description:
      "High-floor studio suite on 4th Parklands Avenue with biometric entry and all-inclusive water. Managed by an agency that holds the keys, so viewings are same-day.",
  },
  {
    owner: 3,
    title: "1 Bed with Fibre in Parklands",
    houseType: "APARTMENT",
    bedrooms: 1,
    bathrooms: 1,
    rentKes: 36000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: false,
    estate: "Parklands",
    roadOrLandmark: "3rd Parklands Ave, Parklands",
    status: "PUBLISHED",
    amenities: [FIBRE, TOKEN, ["Lift / Elevator"], ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 620,
    parkingSpaces: 1,
    ageDays: 18,
    description:
      "One-bedroom on 3rd Parklands Avenue with fibre already wired and prepaid tokens. Close to Diamond Plaza and the Parklands shops.",
  },
  {
    owner: 3,
    title: "2 Bed Apartment in Parklands",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 2,
    rentKes: 55000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: false,
    estate: "Parklands",
    roadOrLandmark: "1st Parklands Ave, Parklands",
    status: "PUBLISHED",
    amenities: [BOREHOLE, ["Lift / Elevator"], ["Backup Generator"], ["Dedicated Parking Bay"], ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 1040,
    parkingSpaces: 1,
    ageDays: 30,
    description:
      "Two-bedroom on 1st Parklands Avenue with a lift, generator, and dedicated parking. Quiet block, mostly long-stay tenants.",
  },
  {
    owner: 3,
    title: "Furnished Studio near Diamond Plaza",
    houseType: "STUDIO",
    bedrooms: 0,
    bathrooms: 1,
    rentKes: 24000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: true,
    estate: "Parklands",
    roadOrLandmark: "Masari Road, near Diamond Plaza",
    status: "PUBLISHED",
    amenities: [FIBRE, ["24/7 Security Guard & CCTV"], TOKEN],
    floorAreaSqft: 400,
    parkingSpaces: 0,
    ageDays: 23,
    description:
      "Compact furnished studio a two-minute walk from Diamond Plaza. Suits a single professional or a student at the nearby campuses.",
  },

  // Hassan Noor — Noor Residences (Parklands, Roysambu)
  {
    owner: 4,
    title: "Spacious Ensuite Haven with Balcony",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 2,
    rentKes: 55000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: true,
    estate: "Westlands",
    roadOrLandmark: "Rhapta Rd, Westlands (near Sarit)",
    status: "PUBLISHED",
    amenities: [["Borehole Water 24/7", "Borehole"], ["Dedicated Parking Bay", "1 Bay"], FIBRE, ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 1080,
    parkingSpaces: 1,
    highlight: "Borehole",
    bedroomsNote: "Master Ensuite",
    ageDays: 7,
    description:
      "Two-bedroom master-ensuite on Rhapta Road with a wraparound balcony and uninterrupted borehole water. Five minutes from Sarit Centre on foot.",
  },
  {
    owner: 4,
    title: "Bedsitter in Roysambu near TRM",
    houseType: "BEDSITTER",
    bedrooms: 0,
    bathrooms: 1,
    rentKes: 14000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "Roysambu",
    roadOrLandmark: "Lumumba Drive, near TRM Mall",
    status: "PUBLISHED",
    amenities: [TOKEN, ["24/7 Security Guard & CCTV"], ["Borehole Water 24/7"]],
    floorAreaSqft: 300,
    parkingSpaces: 0,
    ageDays: 14,
    description:
      "Bedsitter on Lumumba Drive within walking distance of TRM Mall and the Thika Road superhighway stages. Water included, power on prepaid token.",
  },
  {
    owner: 4,
    title: "1 Bed in Roysambu",
    houseType: "APARTMENT",
    bedrooms: 1,
    bathrooms: 1,
    rentKes: 22000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "Roysambu",
    roadOrLandmark: "Mirema Drive, Roysambu",
    status: "PUBLISHED",
    amenities: [TOKEN, ["Borehole Water 24/7"], ["24/7 Security Guard & CCTV"], ["Dedicated Parking Bay"]],
    floorAreaSqft: 560,
    parkingSpaces: 1,
    ageDays: 25,
    description:
      "One-bedroom on Mirema Drive with a dedicated parking slot and borehole backup. Popular with young families and USIU staff.",
  },
  {
    owner: 4,
    title: "Studio Unit in Kasarani",
    houseType: "STUDIO",
    bedrooms: 0,
    bathrooms: 1,
    rentKes: 18000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "Kasarani",
    roadOrLandmark: "Sunton, off Thika Road, Kasarani",
    status: "PUBLISHED",
    amenities: [TOKEN, ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 380,
    parkingSpaces: 0,
    ageDays: 36,
    description:
      "Studio in Sunton with quick access to Thika Road. Water tank on site, prepaid electricity.",
  },
  {
    owner: 4,
    title: "Single Room in Kasarani",
    houseType: "SINGLE_ROOM",
    bedrooms: 0,
    bathrooms: 1,
    rentKes: 9000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "Kasarani",
    roadOrLandmark: "Hunters, Kasarani",
    status: "PUBLISHED",
    amenities: [TOKEN, ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 220,
    parkingSpaces: 0,
    ageDays: 52,
    description:
      "Single room in Hunters with shared water points and a resident caretaker. Cheapest verified unit on the platform.",
  },
  {
    owner: 4,
    title: "2 Bed in Ruaka near Two Rivers",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 2,
    rentKes: 38000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: false,
    estate: "Ruaka",
    roadOrLandmark: "Limuru Road, near Two Rivers Mall",
    status: "PUBLISHED",
    amenities: [BOREHOLE, ["Lift / Elevator"], ["Dedicated Parking Bay"], ["24/7 Security Guard & CCTV"], FIBRE],
    floorAreaSqft: 950,
    parkingSpaces: 1,
    ageDays: 19,
    description:
      "Two-bedroom in Ruaka a short drive from Two Rivers Mall, with a lift, borehole, and covered parking. Fast access to the Northern Bypass.",
  },
  {
    owner: 4,
    title: "1 Bed in Ruaka",
    houseType: "APARTMENT",
    bedrooms: 1,
    bathrooms: 1,
    rentKes: 25000,
    depositMonths: 1,
    serviceCharge: true,
    furnished: false,
    estate: "Ruaka",
    roadOrLandmark: "Gacharage Road, Ruaka",
    status: "REJECTED",
    amenities: [TOKEN, ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 540,
    parkingSpaces: 0,
    ageDays: 29,
    description:
      "One-bedroom in Ruaka. Rejected during review — the submitted photographs did not match the physical inspection report.",
  },

  // Jane Muthoni — Woodvale Grove Rentals (Westlands)
  {
    owner: 5,
    title: "Charming 2-Bed with Jacaranda Views",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 1.5,
    rentKes: 48000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: true,
    estate: "Westlands",
    roadOrLandmark: "Woodvale Grove, Westlands",
    status: "PUBLISHED",
    amenities: [["High Ceilings", "3.4m ceilings"], BOREHOLE, ["Dedicated Parking Bay", "1 Car"], ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 980,
    parkingSpaces: 1,
    highlight: "High Ceilings",
    ageDays: 10,
    description:
      "Two-bedroom on Woodvale Grove in an older block with 3.4-metre ceilings and jacaranda trees along the frontage. Character you do not get in new builds.",
  },
  {
    owner: 5,
    title: "3 Bed Apartment on Waiyaki Way",
    houseType: "APARTMENT",
    bedrooms: 3,
    bathrooms: 2,
    rentKes: 65000,
    depositMonths: 2,
    serviceCharge: true,
    furnished: false,
    estate: "Westlands",
    roadOrLandmark: "Off Waiyaki Way, Westlands",
    status: "PUBLISHED",
    amenities: [BOREHOLE, ["Backup Generator"], ["Lift / Elevator"], ["Dedicated Parking Bay"], ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 1400,
    parkingSpaces: 1,
    bedroomsNote: "Master Ensuite",
    ageDays: 44,
    description:
      "Three-bedroom off Waiyaki Way with a master ensuite and a family-sized kitchen. Generator and borehole on the block.",
  },
  {
    owner: 5,
    title: "2 Bed in South B",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 1,
    rentKes: 30000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "South B",
    roadOrLandmark: "Mariakani, South B",
    status: "PUBLISHED",
    amenities: [TOKEN, ["24/7 Security Guard & CCTV"], ["Borehole Water 24/7"]],
    floorAreaSqft: 820,
    parkingSpaces: 1,
    ageDays: 31,
    description:
      "Two-bedroom in Mariakani, South B, with borehole water and a secure gate. Quick run to the CBD along Mombasa Road.",
  },
  {
    owner: 5,
    title: "Bedsitter in South B",
    houseType: "BEDSITTER",
    bedrooms: 0,
    bathrooms: 1,
    rentKes: 15000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "South B",
    roadOrLandmark: "Balozi Estate, South B",
    status: "PUBLISHED",
    amenities: [TOKEN, ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 310,
    parkingSpaces: 0,
    ageDays: 38,
    description: "Bedsitter in Balozi Estate with a resident caretaker and secure parking for a motorbike.",
  },
  {
    owner: 5,
    title: "1 Bed in Umoja",
    houseType: "APARTMENT",
    bedrooms: 1,
    bathrooms: 1,
    rentKes: 17000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "Umoja",
    roadOrLandmark: "Umoja 2, Nairobi East",
    status: "PUBLISHED",
    amenities: [TOKEN, ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 480,
    parkingSpaces: 0,
    ageDays: 49,
    description: "One-bedroom in Umoja 2 with prepaid tokens and a gated compound. Matatu stage two minutes away.",
  },
  {
    owner: 5,
    title: "Bedsitter in Embakasi",
    houseType: "BEDSITTER",
    bedrooms: 0,
    bathrooms: 1,
    rentKes: 12000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "Embakasi",
    roadOrLandmark: "Pipeline, Embakasi",
    status: "PUBLISHED",
    amenities: [TOKEN, ["24/7 Security Guard & CCTV"]],
    floorAreaSqft: 280,
    parkingSpaces: 0,
    ageDays: 55,
    description: "Bedsitter in Pipeline with 24-hour lighting in the compound and a resident caretaker.",
  },
  {
    owner: 5,
    title: "2 Bed in Rongai",
    houseType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 1,
    rentKes: 21000,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "Rongai",
    roadOrLandmark: "Ongata Rongai, near Maasai Mall",
    status: "PUBLISHED",
    amenities: [TOKEN, ["Borehole Water 24/7"], ["24/7 Security Guard & CCTV"], ["Dedicated Parking Bay"]],
    floorAreaSqft: 760,
    parkingSpaces: 1,
    ageDays: 41,
    description: "Two-bedroom in Ongata Rongai near Maasai Mall, with borehole water and a parking slot.",
  },
  {
    owner: 5,
    title: "Single Room in Rongai",
    houseType: "SINGLE_ROOM",
    bedrooms: 0,
    bathrooms: 1,
    rentKes: 8500,
    depositMonths: 1,
    serviceCharge: false,
    furnished: false,
    estate: "Rongai",
    roadOrLandmark: "Nkoroi, Ongata Rongai",
    status: "PENDING_REVIEW",
    amenities: [TOKEN],
    floorAreaSqft: 200,
    parkingSpaces: 0,
    ageDays: 1,
    description: "Single room in Nkoroi with shared water points. Awaiting physical inspection.",
  },
];

export interface EnquirySeed {
  listing: number;
  tenant: number;
  message: string;
  hoursAgo: number;
  read?: boolean;
  reply?: string;
}

/** The first three are the Recent Enquiries panel on screen 15, verbatim. */
export const ENQUIRIES: EnquirySeed[] = [
  { listing: 0, tenant: 1, message: "Hello Samuel, is this unit still available for viewing this Saturday at 11am?", hoursAgo: 0.25 },
  { listing: 1, tenant: 0, message: "Hi! Is borehole water included in the service charge?", hoursAgo: 2 },
  { listing: 2, tenant: 2, message: "Can I pay deposit in two installments via M-Pesa escrow?", hoursAgo: 5 },
  { listing: 0, tenant: 5, message: "Does the apartment come with the wardrobes in the photos, or are those staged?", hoursAgo: 27, read: true, reply: "They are built in and stay with the unit. Happy to show you on a viewing." },
  { listing: 4, tenant: 2, message: "Which floor is this on? I would prefer above the 4th for the view.", hoursAgo: 30, read: true },
  { listing: 5, tenant: 4, message: "Are both parking bays covered, or is one of them open?", hoursAgo: 49, read: true, reply: "Both are covered, side by side." },
  { listing: 6, tenant: 5, message: "Is the workstation included, and is the fibre already active?", hoursAgo: 8 },
  { listing: 7, tenant: 10, message: "Good afternoon. What exactly does the service charge cover each month?", hoursAgo: 12, read: true },
  { listing: 8, tenant: 4, message: "Is the DSQ self-contained with its own bathroom?", hoursAgo: 20, read: true, reply: "Yes, self-contained with its own shower and toilet." },
  { listing: 9, tenant: 6, message: "Is the bedsitter available from the 1st of next month?", hoursAgo: 34, read: true },
  { listing: 12, tenant: 4, message: "Would the landlord consider a two-year lease at a slightly lower rent?", hoursAgo: 16 },
  { listing: 13, tenant: 2, message: "How far is the nearest primary school from the house?", hoursAgo: 58, read: true, reply: "Two international schools are within a ten-minute walk." },
  { listing: 14, tenant: 1, message: "Is the lift backed by the generator during outages?", hoursAgo: 6, read: true },
  { listing: 17, tenant: 3, message: "Does the biometric access work with a phone, or is it fingerprint only?", hoursAgo: 3 },
  { listing: 18, tenant: 10, message: "Is the fibre line Zuku or Safaricom? I already have a Safaricom router.", hoursAgo: 22, read: true },
  { listing: 19, tenant: 5, message: "Can I view this evening after 6pm? I work in Upper Hill.", hoursAgo: 9 },
  { listing: 21, tenant: 0, message: "Is the balcony enclosed? I have a small child.", hoursAgo: 11 },
  { listing: 22, tenant: 6, message: "Is water metered separately or included in the rent?", hoursAgo: 40, read: true, reply: "Included in the rent. Only power is on a prepaid token." },
  { listing: 23, tenant: 8, message: "Is there space to park a motorbike inside the compound?", hoursAgo: 44, read: true },
  { listing: 26, tenant: 8, message: "How reliable is the water in Ruaka? I have had issues before.", hoursAgo: 15 },
  { listing: 28, tenant: 10, message: "Are the high ceilings in the bedrooms too, or only in the living room?", hoursAgo: 7 },
  { listing: 30, tenant: 7, message: "Is the compound gated at night? I get home late from shift work.", hoursAgo: 26, read: true },
  { listing: 32, tenant: 9, message: "Is the caretaker on site, and what is the notice period?", hoursAgo: 61, read: true, reply: "Caretaker lives on site. One month's notice." },
  { listing: 34, tenant: 11, message: "Is the borehole water treated? Asking for drinking use.", hoursAgo: 18 },
];

export interface ReportSeed {
  listing: number;
  reporter: number;
  reason: string;
  details: string;
  severity: ReportSeverity;
  status: ReportStatus;
  hoursAgo: number;
  resolution?: string;
}

/** Fourteen reports across all four reasons and all three severities. */
export const REPORTS: ReportSeed[] = [
  { listing: 0, reporter: 1, reason: "Illegal Viewing Fee Demanded", details: "The caretaker asked for Ksh 500 at the gate before he would open the unit. The listing says viewings are free.", severity: "CRITICAL", status: "OPEN", hoursAgo: 0.4 },
  { listing: 17, reporter: 3, reason: "Fake Photos / Middleman Broker", details: "The photos show a furnished suite but the unit I was shown was bare and on a lower floor.", severity: "MODERATE", status: "OPEN", hoursAgo: 2 },
  { listing: 8, reporter: 4, reason: "Unresponsive Landlord", details: "No reply on WhatsApp or phone for six days after I confirmed interest.", severity: "LOW", status: "OPEN", hoursAgo: 5 },
  { listing: 6, reporter: 5, reason: "Rent Price Misrepresentation", details: "Listed at Ksh 47,000 but the agent quoted Ksh 52,000 plus a separate service charge on the call.", severity: "CRITICAL", status: "OPEN", hoursAgo: 26 },
  { listing: 26, reporter: 8, reason: "Fake Photos / Middleman Broker", details: "The interior photos are the same ones used on another listing in Roysambu.", severity: "CRITICAL", status: "UNDER_REVIEW", hoursAgo: 31 },
  { listing: 22, reporter: 6, reason: "Illegal Viewing Fee Demanded", details: "Was asked for a Ksh 300 gate pass before viewing.", severity: "MODERATE", status: "UNDER_REVIEW", hoursAgo: 40 },
  { listing: 13, reporter: 2, reason: "Unresponsive Landlord", details: "Called four times over two days, no answer and no callback.", severity: "LOW", status: "UNDER_REVIEW", hoursAgo: 52 },
  { listing: 30, reporter: 7, reason: "Rent Price Misrepresentation", details: "Rent went up by Ksh 3,000 between the listing and the lease draft.", severity: "MODERATE", status: "UNDER_REVIEW", hoursAgo: 61 },
  { listing: 19, reporter: 10, reason: "Illegal Viewing Fee Demanded", details: "A man claiming to be the agent asked for a viewing fee on M-Pesa before giving the location.", severity: "CRITICAL", status: "RESOLVED", hoursAgo: 96, resolution: "Confirmed. The individual was not the registered agent. Listing owner warned and the impersonator's number blocked." },
  { listing: 9, reporter: 6, reason: "Fake Photos / Middleman Broker", details: "The bedsitter shown was smaller than the photos suggest.", severity: "MODERATE", status: "RESOLVED", hoursAgo: 120, resolution: "Owner re-photographed the unit and the listing was updated. Report closed." },
  { listing: 23, reporter: 9, reason: "Unresponsive Landlord", details: "No response for over a week.", severity: "LOW", status: "RESOLVED", hoursAgo: 144, resolution: "Owner had travelled. Contact restored and the tenant has since viewed the unit." },
  { listing: 14, reporter: 4, reason: "Rent Price Misrepresentation", details: "The advertised rent excluded a mandatory Ksh 8,000 service charge.", severity: "MODERATE", status: "RESOLVED", hoursAgo: 168, resolution: "Listing corrected to show the service charge inline. Owner reminded of the disclosure rule." },
  { listing: 28, reporter: 11, reason: "Fake Photos / Middleman Broker", details: "I think the photos are of a different unit in the same block.", severity: "LOW", status: "DISMISSED", hoursAgo: 200, resolution: "Physical inspection confirmed the photos match the advertised unit. No action taken." },
  { listing: 34, reporter: 8, reason: "Unresponsive Landlord", details: "Landlord did not reply the same day.", severity: "LOW", status: "DISMISSED", hoursAgo: 240, resolution: "Owner replied within 24 hours, which is inside the platform's response window. Dismissed." },
];

export const LISTING_PHOTOS = [
  "/seed/listings/apartment-interior-daylight.png",
  "/seed/listings/living-room-kilimani.png",
  "/seed/listings/apartment-interior-warm.png",
];
