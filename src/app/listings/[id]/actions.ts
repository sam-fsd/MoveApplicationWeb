"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { REPORT_DETAILS_MAX, REPORT_REASON_OPTIONS, severityForReason } from "@/lib/constants";

export interface ActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  reference?: string;
}

/**
 * Toggle a listing in the tenant's saved list. Returns the resulting state so
 * an optimistic heart can reconcile rather than guess.
 */
export async function toggleSaveListing(listingId: string): Promise<ActionResult & { saved?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to save a house." };

  const existing = await db.savedListing.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
    select: { id: true },
  });

  if (existing) {
    await db.savedListing.delete({ where: { id: existing.id } });
  } else {
    // A listing that no longer exists must not create a dangling save.
    const listing = await db.listing.findUnique({ where: { id: listingId }, select: { id: true } });
    if (!listing) return { ok: false, error: "That listing is no longer available." };
    await db.savedListing.create({ data: { userId: user.id, listingId } });
  }

  revalidatePath("/saved");
  revalidatePath(`/listings/${listingId}`);
  return { ok: true, saved: !existing };
}

/**
 * File a report. Severity comes from the reason rather than the reporter, so a
 * demanded viewing fee always lands in the admin queue as critical.
 */
export async function submitReport(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to report a listing." };

  const listingId = String(formData.get("listingId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const details = String(formData.get("details") ?? "").trim();

  if (!REPORT_REASON_OPTIONS.some((o) => o.reason === reason)) {
    return { ok: false, error: "Choose a reason for the report." };
  }
  if (details.length > REPORT_DETAILS_MAX) {
    return { ok: false, error: `Keep the details under ${REPORT_DETAILS_MAX} characters.` };
  }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true },
  });
  if (!listing) return { ok: false, error: "That listing is no longer available." };

  const report = await db.report.create({
    data: {
      listingId,
      reporterId: user.id,
      reason,
      details: details || null,
      severity: severityForReason(reason),
      status: "OPEN",
    },
    select: { id: true, createdAt: true },
  });

  // Admins see it in their queue immediately; the tenant gets a receipt.
  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await db.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      kind: "REPORT_UPDATE",
      title: `New report: ${reason}`,
      body: `${user.fullName} reported ${listing.title}.`,
      href: "/admin/reports",
    })),
  });

  revalidatePath("/admin/reports");
  revalidatePath("/admin");

  return {
    ok: true,
    message: "Report submitted",
    reference: referenceNumber(report.id, report.createdAt),
  };
}

/** The in-app enquiry — CLAUDE.md rule 4's third contact channel. */
export async function sendEnquiry(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to message an owner." };

  const listingId = String(formData.get("listingId") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (message.length < 5) return { ok: false, error: "Write a short message first." };
  if (message.length > 1000) return { ok: false, error: "Keep the message under 1000 characters." };

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, ownerId: true },
  });
  if (!listing) return { ok: false, error: "That listing is no longer available." };

  await db.enquiry.create({ data: { listingId, tenantId: user.id, message } });

  await db.notification.create({
    data: {
      userId: listing.ownerId,
      kind: "ENQUIRY_RECEIVED",
      title: `New enquiry from ${user.fullName}`,
      body: message.slice(0, 140),
      href: "/dashboard",
    },
  });

  revalidatePath("/dashboard");
  return { ok: true, message: "Message sent. The owner will reply on WhatsApp or in-app." };
}

/** Records a view. Feeds Listing.viewCount and the daily series behind the charts. */
export async function recordListingView(listingId: string): Promise<void> {
  const today = new Date();
  const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  await db.$transaction([
    db.listing.update({ where: { id: listingId }, data: { viewCount: { increment: 1 } } }),
    db.listingViewDaily.upsert({
      where: { listingId_date: { listingId, date } },
      create: { listingId, date, views: 1 },
      update: { views: { increment: 1 } },
    }),
  ]);
}

/** `#REP-2026-0042` — the reference shown on the confirmation state. */
function referenceNumber(id: string, createdAt: Date): string {
  const tail = id.slice(-4).toUpperCase();
  return `#REP-${createdAt.getFullYear()}-${tail}`;
}
