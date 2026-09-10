"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ListingStatus, ReportStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { ActionResult } from "@/app/listings/[id]/actions";

/**
 * Compliance certificate numbers run #MP-NBI-<year>-<sequence>, matching the
 * ones the designs show (#MP-NBI-2025-084). The sequence counts certificates
 * already issued this year so numbers never collide or repeat.
 */
async function nextCertificateNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `#MP-NBI-${year}-`;
  const issued = await db.verification.count({
    where: { certificateNumber: { startsWith: prefix } },
  });
  return `${prefix}${String(issued + 1).padStart(3, "0")}`;
}

/**
 * Approving an owner is the hinge of the whole product: it flips the owner's
 * state, issues a certificate, and unblocks publishing in the owner portal.
 */
export async function approveVerification(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  const id = String(formData.get("verificationId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  const verification = await db.verification.findUnique({
    where: { id },
    select: {
      id: true,
      certificateNumber: true,
      ownerProfile: { select: { businessName: true, user: { select: { id: true } } } },
    },
  });
  if (!verification) return { ok: false, error: "That verification no longer exists." };

  const certificateNumber = verification.certificateNumber ?? (await nextCertificateNumber());

  await db.verification.update({
    where: { id },
    data: {
      state: "APPROVED",
      certificateNumber,
      reviewedAt: new Date(),
      reviewedById: admin.id,
      adminNotes: notes || null,
      // Approving the file means every check has been satisfied.
      nationalIdOk: true,
      kraPinOk: true,
      titleDeedOk: true,
      inspectionOk: true,
      feePledgeOk: true,
    },
  });

  await db.notification.create({
    data: {
      userId: verification.ownerProfile.user.id,
      kind: "VERIFICATION_APPROVED",
      title: "Your account is verified",
      body: `Compliance certificate ${certificateNumber} issued. You can now add listings.`,
      href: "/dashboard/verification",
    },
  });

  revalidatePathsForVerification(verification.ownerProfile.user.id);
  redirect("/admin/verifications?approved=1");
}

export async function rejectVerification(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  const id = String(formData.get("verificationId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (notes.length < 10) {
    return { ok: false, error: "Give the owner a reason — at least 10 characters." };
  }

  const verification = await db.verification.findUnique({
    where: { id },
    select: { id: true, ownerProfile: { select: { user: { select: { id: true } } } } },
  });
  if (!verification) return { ok: false, error: "That verification no longer exists." };

  await db.verification.update({
    where: { id },
    data: {
      state: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: admin.id,
      adminNotes: notes,
    },
  });

  await db.notification.create({
    data: {
      userId: verification.ownerProfile.user.id,
      kind: "VERIFICATION_REJECTED",
      title: "Verification needs attention",
      body: notes.slice(0, 160),
      href: "/dashboard/verification",
    },
  });

  revalidatePathsForVerification(verification.ownerProfile.user.id);
  redirect("/admin/verifications?rejected=1");
}

function revalidatePathsForVerification(ownerUserId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/verifications");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/verification");
  revalidatePath(`/owners/${ownerUserId}`);
  revalidatePath("/listings");
}

/**
 * Moderation of listings. Publishing is the admin's alone — this is the only
 * path to PUBLISHED anywhere in the app.
 */
export async function moderateListings(
  listingIds: string[],
  status: ListingStatus,
): Promise<void> {
  await requireRole("ADMIN");
  if (listingIds.length === 0) return;

  const listings = await db.listing.findMany({
    where: { id: { in: listingIds } },
    select: { id: true, title: true, ownerId: true },
  });

  await db.listing.updateMany({ where: { id: { in: listings.map((l) => l.id) } }, data: { status } });

  const message: Record<ListingStatus, string> = {
    PUBLISHED: "is now live on MoveApp",
    PENDING_REVIEW: "has been returned to review",
    REJECTED: "was rejected by moderation",
    RENTED_OUT: "was marked rented out",
  };

  await db.notification.createMany({
    data: listings.map((listing) => ({
      userId: listing.ownerId,
      kind: status === "PUBLISHED" ? "LISTING_APPROVED" : "LISTING_MODERATED",
      title: `“${listing.title}” ${message[status]}`,
      body:
        status === "PUBLISHED"
          ? "Tenants across Nairobi can now find and contact you about this unit."
          : "Open the listing in your portal to see what changed.",
      href: `/dashboard/listings/${listing.id}`,
    })),
  });

  revalidatePath("/admin/listings");
  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath("/dashboard");
  for (const listing of listings) revalidatePath(`/listings/${listing.id}`);
}

/** Bound to the bulk-action buttons on screen 21. */
export async function bulkModerate(status: ListingStatus, formData: FormData): Promise<void> {
  const ids = formData.getAll("listingIds").map(String).filter(Boolean);
  await moderateListings(ids, status);
}

/**
 * The four moderation actions on screen 23's report drawer. Taking a listing
 * down is the one that has teeth — it removes the unit from tenant search
 * immediately.
 */
export type ReportAction = "TAKE_DOWN" | "UNDER_REVIEW" | "RESOLVE" | "DISMISS";

export async function moderateReport(
  reportId: string,
  action: ReportAction,
  formData?: FormData,
): Promise<void> {
  await requireRole("ADMIN");

  const resolution = String(formData?.get("resolution") ?? "").trim();
  const report = await db.report.findUnique({
    where: { id: reportId },
    select: { id: true, listingId: true, reporterId: true, reason: true, listing: { select: { title: true, ownerId: true } } },
  });
  if (!report) return;

  const status: Record<ReportAction, ReportStatus> = {
    TAKE_DOWN: "RESOLVED",
    UNDER_REVIEW: "UNDER_REVIEW",
    RESOLVE: "RESOLVED",
    DISMISS: "DISMISSED",
  };

  const closed = action === "TAKE_DOWN" || action === "RESOLVE" || action === "DISMISS";

  await db.report.update({
    where: { id: reportId },
    data: {
      status: status[action],
      resolution: resolution || defaultResolution(action),
      resolvedAt: closed ? new Date() : null,
    },
  });

  if (action === "TAKE_DOWN") {
    // Unpublishing here is what removes it from tenant search.
    await db.listing.update({ where: { id: report.listingId }, data: { status: "REJECTED" } });
    await db.notification.create({
      data: {
        userId: report.listing.ownerId,
        kind: "LISTING_MODERATED",
        title: `“${report.listing.title}” was taken down`,
        body: `Upheld report: ${report.reason}. Contact the ops desk to appeal.`,
        href: `/dashboard/listings/${report.listingId}`,
      },
    });
  }

  await db.notification.create({
    data: {
      userId: report.reporterId,
      kind: "REPORT_UPDATE",
      title: `Your report was ${status[action].toLowerCase().replace("_", " ")}`,
      body: resolution || defaultResolution(action),
      href: `/listings/${report.listingId}`,
    },
  });

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath(`/listings/${report.listingId}`);
  revalidatePath("/dashboard");
}

function defaultResolution(action: ReportAction): string {
  switch (action) {
    case "TAKE_DOWN":
      return "Report upheld. The listing has been taken down and the owner notified.";
    case "UNDER_REVIEW":
      return "Escalated to the Nairobi ops desk for investigation.";
    case "RESOLVE":
      return "Investigated and resolved with the owner. The listing stays live.";
    case "DISMISS":
      return "Reviewed and dismissed — no breach of platform policy was found.";
  }
}
