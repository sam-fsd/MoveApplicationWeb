"use server";

import { revalidatePath } from "next/cache";
import type { ListingStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

/**
 * Owner-side status changes. An owner may take a unit off the market or put it
 * back, but may never move it to PUBLISHED themselves — only an admin can do
 * that, per CLAUDE.md rule 1.
 */
const OWNER_ALLOWED: ListingStatus[] = ["RENTED_OUT", "PENDING_REVIEW"];

export async function setListingStatus(listingId: string, status: ListingStatus): Promise<void> {
  const user = await requireRole("OWNER");
  if (!OWNER_ALLOWED.includes(status)) return;

  // Scoped by ownerId so an id from another account cannot be touched.
  await db.listing.updateMany({
    where: { id: listingId, ownerId: user.id },
    data: { status },
  });

  revalidatePath(`/dashboard/listings/${listingId}`);
  revalidatePath("/dashboard");
  revalidatePath("/listings");
}

export async function markEnquiryRead(enquiryId: string): Promise<void> {
  const user = await requireRole("OWNER");
  await db.enquiry.updateMany({
    where: { id: enquiryId, listing: { ownerId: user.id }, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/enquiries");
}
