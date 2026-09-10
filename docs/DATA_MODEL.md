# Data Model

Mirrors the original Firestore collections (admins, owners, tenants, posts,
reports) but normalised, and extended to cover what the screens actually render.
Treat this as the starting schema — extend it if a screen needs a field.

```prisma
enum Role            { TENANT OWNER ADMIN }
enum OwnerKind       { LANDLORD AGENT }
enum VerificationState { UNSUBMITTED PENDING APPROVED REJECTED }
enum ListingStatus   { PENDING_REVIEW PUBLISHED RENTED_OUT REJECTED }
enum HouseType       { BEDSITTER SINGLE_ROOM STUDIO ONE_BED TWO_BED THREE_BED MAISONETTE }
enum ReportStatus    { OPEN UNDER_REVIEW RESOLVED DISMISSED }
enum ReportSeverity  { LOW MODERATE CRITICAL }

model User {
  id            String   @id @default(cuid())
  role          Role
  fullName      String
  email         String   @unique
  phone         String            // E.164, +254...
  passwordHash  String
  avatarUrl     String?
  createdAt     DateTime @default(now())

  ownerProfile  OwnerProfile?
  tenantProfile TenantProfile?
  listings      Listing[]         @relation("OwnerListings")
  savedListings SavedListing[]
  enquiries     Enquiry[]
  reportsFiled  Report[]          @relation("Reporter")
  priceAlerts   PriceAlert[]
  notifications Notification[]
}

model OwnerProfile {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  businessName   String              // "Kamau Properties Ltd"
  kind           OwnerKind
  about          String
  primaryEstate  String              // "Westlands"
  memberSince    DateTime
  verification   Verification?
}

model Verification {
  id                 String   @id @default(cuid())
  ownerProfileId     String   @unique
  ownerProfile       OwnerProfile @relation(fields: [ownerProfileId], references: [id])
  state              VerificationState @default(UNSUBMITTED)
  certificateNumber  String?          // "#MP-NBI-2025-084", set on approval
  submittedAt        DateTime?
  reviewedAt         DateTime?
  reviewedById       String?
  adminNotes         String?
  // individual checks — screens 16 and 22 render these as separate rows
  nationalIdOk       Boolean @default(false)
  kraPinOk           Boolean @default(false)
  titleDeedOk        Boolean @default(false)
  inspectionOk       Boolean @default(false)
  feePledgeOk        Boolean @default(false)
  documents          VerificationDocument[]
}

model VerificationDocument {
  id              String @id @default(cuid())
  verificationId  String
  verification    Verification @relation(fields: [verificationId], references: [id])
  label           String        // "National ID", "Title Deed", "KRA PIN"
  fileUrl         String
  uploadedAt      DateTime @default(now())
}

model TenantProfile {
  id               String @id @default(cuid())
  userId           String @unique
  user             User   @relation(fields: [userId], references: [id])
  preferredEstates String        // JSON array, SQLite has no String[]
  budgetMin        Int?
  budgetMax        Int?
  preferredTypes   String        // JSON array of HouseType
}

model Listing {
  id            String @id @default(cuid())
  ownerId       String
  owner         User   @relation("OwnerListings", fields: [ownerId], references: [id])
  title         String            // "2 Bedroom Apartment in Westlands"
  description   String
  houseType     HouseType
  bedrooms      Int
  bathrooms     Int
  furnished     Boolean @default(false)
  rentKes       Int               // 45000
  depositMonths Int     @default(1)
  serviceCharge Boolean @default(false)  // "Service Charge Incl."
  estate        String            // "Westlands"
  roadOrLandmark String           // "Muthithi Road, near Westgate"
  latitude      Float?
  longitude     Float?
  availableFrom DateTime
  status        ListingStatus @default(PENDING_REVIEW)
  viewCount     Int     @default(0)
  createdAt     DateTime @default(now())

  images        ListingImage[]
  amenities     ListingAmenity[]
  savedBy       SavedListing[]
  enquiries     Enquiry[]
  reports       Report[]
}

model ListingImage {
  id        String @id @default(cuid())
  listingId String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  url       String
  isCover   Boolean @default(false)
  position  Int     @default(0)
}

model ListingAmenity {
  id        String @id @default(cuid())
  listingId String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  label     String  // "Borehole Water 24/7", "Prepaid KPLC Token", "Fibre Ready", "CCTV"
}

model SavedListing {
  id        String @id @default(cuid())
  userId    String
  listingId String
  user      User    @relation(fields: [userId], references: [id])
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([userId, listingId])
}

model PriceAlert {
  id        String @id @default(cuid())
  userId    String
  user      User   @relation(fields: [userId], references: [id])
  label     String        // "2 Bedroom in Kasarani under Ksh 25,000"
  estate    String?
  houseType HouseType?
  maxRent   Int?
  active    Boolean @default(true)
}

model Enquiry {
  id        String @id @default(cuid())
  listingId String
  tenantId  String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  tenant    User    @relation(fields: [tenantId], references: [id])
  message   String
  readAt    DateTime?
  createdAt DateTime @default(now())
}

model Report {
  id          String @id @default(cuid())
  listingId   String
  reporterId  String
  listing     Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  reporter    User    @relation("Reporter", fields: [reporterId], references: [id])
  reason      String         // "Illegal Viewing Fee Demanded", "Fake Photos / Middleman Broker",
                             // "Unresponsive Landlord", "Rent Price Misrepresentation"
  details     String?
  severity    ReportSeverity @default(MODERATE)
  status      ReportStatus   @default(OPEN)
  resolution  String?
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
}

model Notification {
  id        String @id @default(cuid())
  userId    String
  user      User   @relation(fields: [userId], references: [id])
  kind      String        // "SAVED_SEARCH_MATCH" | "ENQUIRY_REPLY" | "LISTING_APPROVED" | "REPORT_UPDATE"
  title     String
  body      String
  href      String?
  readAt    DateTime?
  createdAt DateTime @default(now())
}
```

## Seeding

The demo lives or dies on the seed. Aim for:

- 1 admin, 8 owners (mix of landlords and agents, 6 approved / 2 pending),
  12 tenants.
- 30–40 listings spread across Westlands, Kilimani, Ruaka, Roysambu, Kasarani,
  South B, Parklands, Ngong Road. Rents from Ksh 12,000 (bedsitter) to
  Ksh 65,000 (3-bed maisonette). Mostly PUBLISHED, a few PENDING_REVIEW and
  RENTED_OUT so the owner dashboard tabs all have content.
- 3–5 images per listing, cycling the photos in `public/seed/listings/`.
- 20+ enquiries with realistic messages — the ones in screen 15 are good models
  ("Is this unit still available for viewing this Saturday at 11am?").
- 14 reports across all four reasons and all three severities, some resolved.
- Names to reuse: Wanjiku Mwangi, Kamau Properties, Otieno Real Estate, Achieng
  Njoroge, Peter Kariuki, Faith Muthoni, Samuel Njoroge, Grace Muthoni Wambui,
  Brian Otieno, Kevin Omondi, Mercy Achieng, David Kariuki.
- Known demo logins printed at the end of the seed script, e.g.
  `tenant@moveapp.ke`, `owner@moveapp.ke`, `admin@moveapp.ke`, all with the same
  password. Put them in the README.
