"use server";

import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { HouseType } from "@prisma/client";

import { db } from "@/lib/db";
import { canPublish, requireRole } from "@/lib/auth";
import { AMENITIES, ESTATES, HOUSE_TYPES } from "@/lib/constants";

export interface CreateListingState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const MAX_PHOTOS = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Creates a listing from the wizard on screens 17 and 18.
 *
 * CLAUDE.md rule 1 is enforced twice over: an owner whose verification is not
 * APPROVED cannot get here at all, and a listing from a verified owner still
 * enters PENDING_REVIEW rather than going live.
 */
export async function createListing(
  _prev: CreateListingState,
  formData: FormData,
): Promise<CreateListingState> {
  const user = await requireRole("OWNER");

  if (!canPublish(user)) {
    return {
      error: "Your account is still being verified. You cannot add listings until an admin approves it.",
    };
  }

  const fieldErrors: Record<string, string> = {};
  const str = (key: string) => String(formData.get(key) ?? "").trim();
  const int = (key: string) => Number.parseInt(String(formData.get(key) ?? ""), 10);

  const title = str("title");
  const description = str("description");
  const houseTypeRaw = str("houseType");
  const estate = str("estate");
  const roadOrLandmark = str("roadOrLandmark");
  const bedrooms = int("bedrooms");
  const bathrooms = Number.parseFloat(String(formData.get("bathrooms") ?? ""));
  const rentKes = int("rentKes");
  const depositMonths = int("depositMonths");
  const availableFromRaw = str("availableFrom");

  if (title.length < 8) fieldErrors.title = "Give the listing a descriptive title (8+ characters).";
  if (title.length > 80) fieldErrors.title = "Keep the title under 80 characters.";
  if (description.length < 40) fieldErrors.description = "Describe the unit in at least 40 characters.";
  if (description.length > 2000) fieldErrors.description = "Keep the description under 2000 characters.";
  if (!HOUSE_TYPES.some((t) => t.value === houseTypeRaw)) fieldErrors.houseType = "Pick a house type.";
  if (!ESTATES.includes(estate as (typeof ESTATES)[number])) fieldErrors.estate = "Pick an estate.";
  if (roadOrLandmark.length < 3) fieldErrors.roadOrLandmark = "Add a road or landmark.";
  if (!Number.isFinite(bedrooms) || bedrooms < 0 || bedrooms > 10) fieldErrors.bedrooms = "Bedrooms must be 0–10.";
  if (!Number.isFinite(bathrooms) || bathrooms < 0.5 || bathrooms > 10) fieldErrors.bathrooms = "Bathrooms must be 0.5–10.";
  if (!Number.isFinite(rentKes) || rentKes < 1000) fieldErrors.rentKes = "Rent must be at least Ksh 1,000.";
  if (!Number.isFinite(depositMonths) || depositMonths < 0 || depositMonths > 6) {
    fieldErrors.depositMonths = "Deposit must be 0–6 months.";
  }

  const availableFrom = availableFromRaw ? new Date(availableFromRaw) : new Date();
  if (Number.isNaN(availableFrom.getTime())) fieldErrors.availableFrom = "Pick a valid date.";

  // Node 18 has no global `File`, so duck-type the upload rather than relying
  // on `instanceof File` — that throws a ReferenceError on this runtime.
  const photos = formData
    .getAll("photos")
    .filter((entry): entry is File => typeof entry === "object" && entry !== null && "arrayBuffer" in entry)
    .filter((file) => file.size > 0);
  if (photos.length === 0) fieldErrors.photos = "Add at least one photo of the unit.";
  if (photos.length > MAX_PHOTOS) fieldErrors.photos = `Upload at most ${MAX_PHOTOS} photos.`;
  for (const photo of photos) {
    if (!ALLOWED.has(photo.type)) fieldErrors.photos = "Photos must be JPG, PNG, or WebP.";
    if (photo.size > MAX_BYTES) fieldErrors.photos = "Each photo must be under 10MB.";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // Only amenities from the known catalogue are stored.
  const amenities = formData
    .getAll("amenities")
    .map(String)
    .filter((a) => (AMENITIES as readonly string[]).includes(a));

  // Files are written before the row so a failed write never leaves a listing
  // pointing at images that do not exist.
  await mkdir(UPLOAD_DIR, { recursive: true });
  const urls: string[] = [];
  for (const photo of photos) {
    const name = `${randomUUID()}${ALLOWED.get(photo.type)}`;
    await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await photo.arrayBuffer()));
    urls.push(`/uploads/${name}`);
  }

  const coverIndex = Math.min(Math.max(int("coverIndex") || 0, 0), urls.length - 1);

  const listing = await db.listing.create({
    data: {
      ownerId: user.id,
      title,
      description,
      houseType: houseTypeRaw as HouseType,
      bedrooms,
      bathrooms,
      furnished: formData.get("furnished") === "on" || str("furnishing") === "FURNISHED",
      rentKes,
      depositMonths,
      serviceCharge: formData.get("serviceCharge") === "on",
      estate,
      roadOrLandmark,
      availableFrom,
      floorAreaSqft: Number.isFinite(int("floorAreaSqft")) ? int("floorAreaSqft") : null,
      parkingSpaces: Number.isFinite(int("parkingSpaces")) ? int("parkingSpaces") : 0,
      // Rule 1: even a verified owner's new listing waits for review.
      status: "PENDING_REVIEW",
      images: {
        create: urls.map((url, index) => ({ url, isCover: index === coverIndex, position: index })),
      },
      amenities: { create: amenities.map((label) => ({ label })) },
    },
    select: { id: true, title: true },
  });

  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await db.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      kind: "LISTING_SUBMITTED",
      title: "New listing awaiting review",
      body: `${user.ownerProfile?.businessName ?? user.fullName} submitted “${listing.title}”.`,
      href: "/admin/listings",
    })),
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin/listings");
  redirect(`/dashboard/listings/${listing.id}?created=1`);
}
