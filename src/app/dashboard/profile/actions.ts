"use server";

import { revalidatePath } from "next/cache";
import type { OwnerKind } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ESTATES } from "@/lib/constants";
import type { ActionResult } from "@/app/listings/[id]/actions";

function normalisePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  const match = digits.match(/^(?:\+?254|0)?(7\d{8}|1\d{8})$/);
  return match ? `+254${match[1]}` : null;
}

/** Screen 14 — the public landlord profile tenants see on screen 13. */
export async function updateOwnerProfile(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireRole("OWNER");
  if (!user.ownerProfile) return { ok: false, error: "No owner profile on this account." };

  const businessName = String(formData.get("businessName") ?? "").trim();
  const about = String(formData.get("about") ?? "").trim();
  const primaryEstate = String(formData.get("primaryEstate") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "");
  const phoneRaw = String(formData.get("phone") ?? "").trim();

  if (businessName.length < 2) return { ok: false, error: "Enter a display or agency name." };
  if (about.length > 600) return { ok: false, error: "Keep the bio under 600 characters." };
  if (primaryEstate && !ESTATES.includes(primaryEstate as (typeof ESTATES)[number])) {
    return { ok: false, error: "Pick a primary estate from the list." };
  }

  const phone = normalisePhone(phoneRaw);
  if (!phone) return { ok: false, error: "Enter a Kenyan mobile number, e.g. 0712 345 678." };

  const kind: OwnerKind = kindRaw === "AGENT" ? "AGENT" : "LANDLORD";

  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { phone } }),
    db.ownerProfile.update({
      where: { id: user.ownerProfile.id },
      // badgeLabel is deliberately not editable here — it is set by admins, and
      // letting an owner type their own "Verified" string would undermine it.
      data: { businessName, about, primaryEstate, kind },
    }),
  ]);

  revalidatePath("/dashboard/profile");
  revalidatePath(`/owners/${user.id}`);
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved. Tenants see this on your public page." };
}
