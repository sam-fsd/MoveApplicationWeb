"use server";

import { revalidatePath } from "next/cache";
import type { HouseType } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ESTATES, HOUSE_TYPES } from "@/lib/constants";
import type { ActionResult } from "@/app/listings/[id]/actions";

/** Create a price alert from the Saved Homes panel on screen 09. */
export async function createPriceAlert(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireRole("TENANT");

  const estate = String(formData.get("estate") ?? "");
  const houseTypeRaw = String(formData.get("houseType") ?? "");
  const maxRent = Number.parseInt(String(formData.get("maxRent") ?? ""), 10);

  if (estate && !ESTATES.includes(estate as (typeof ESTATES)[number])) {
    return { ok: false, error: "Pick an estate from the list." };
  }
  if (!Number.isFinite(maxRent) || maxRent < 1000) {
    return { ok: false, error: "Set a maximum rent of at least Ksh 1,000." };
  }

  const houseType = HOUSE_TYPES.find((t) => t.value === houseTypeRaw)?.value;
  const typeLabel = houseType
    ? HOUSE_TYPES.find((t) => t.value === houseType)!.label
    : "Any house";

  await db.priceAlert.create({
    data: {
      userId: user.id,
      label: `${typeLabel} in ${estate || "Nairobi"} under Ksh ${maxRent.toLocaleString("en-KE")}`,
      estate: estate || null,
      houseType: (houseType as HouseType) ?? null,
      maxRent,
      active: true,
    },
  });

  revalidatePath("/saved");
  return { ok: true, message: "Alert created. We will tell you when a verified match appears." };
}

export async function togglePriceAlert(id: string): Promise<void> {
  const user = await requireRole("TENANT");
  const alert = await db.priceAlert.findFirst({
    where: { id, userId: user.id },
    select: { id: true, active: true },
  });
  if (!alert) return;

  await db.priceAlert.update({ where: { id: alert.id }, data: { active: !alert.active } });
  revalidatePath("/saved");
}

export async function deletePriceAlert(id: string): Promise<void> {
  const user = await requireRole("TENANT");
  // Scoped by userId so an id from another account cannot be deleted.
  await db.priceAlert.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/saved");
}
