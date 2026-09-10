"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ESTATES, HOUSE_TYPES } from "@/lib/constants";
import type { ActionResult } from "@/app/listings/[id]/actions";

function normalisePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  const match = digits.match(/^(?:\+?254|0)?(7\d{8}|1\d{8})$/);
  return match ? `+254${match[1]}` : null;
}

/** Screen 12 — personal details plus the search preferences that drive alerts. */
export async function updateTenantProfile(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireRole("TENANT");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const budgetMin = Number.parseInt(String(formData.get("budgetMin") ?? ""), 10);
  const budgetMax = Number.parseInt(String(formData.get("budgetMax") ?? ""), 10);

  if (fullName.length < 2) return { ok: false, error: "Enter your full name." };

  const phone = normalisePhone(phoneRaw);
  if (!phone) return { ok: false, error: "Enter a Kenyan mobile number, e.g. 0712 345 678." };

  if (Number.isFinite(budgetMin) && Number.isFinite(budgetMax) && budgetMin > budgetMax) {
    return { ok: false, error: "The minimum budget cannot be above the maximum." };
  }

  // Only values from the known vocabularies are stored, so a tampered form
  // cannot write junk into the JSON columns.
  const estates = formData
    .getAll("estates")
    .map(String)
    .filter((e) => (ESTATES as readonly string[]).includes(e));

  const types = formData
    .getAll("types")
    .map(String)
    .filter((t) => HOUSE_TYPES.some((h) => h.value === t));

  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { fullName, phone } }),
    db.tenantProfile.update({
      where: { userId: user.id },
      data: {
        preferredEstates: JSON.stringify(estates),
        preferredTypes: JSON.stringify(types),
        budgetMin: Number.isFinite(budgetMin) ? budgetMin : null,
        budgetMax: Number.isFinite(budgetMax) ? budgetMax : null,
      },
    }),
  ]);

  revalidatePath("/account");
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved. Your alerts now use these preferences." };
}
