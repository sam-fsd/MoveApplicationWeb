"use server";

import { redirect } from "next/navigation";
import type { OwnerKind } from "@prisma/client";
import { db } from "@/lib/db";
import { homePathForRole } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";

export interface RegisterState {
  error?: string;
  fieldErrors?: Partial<Record<"fullName" | "email" | "phone" | "password" | "businessName", string>>;
  values?: Record<string, string>;
}

/** Kenyan mobile numbers, normalised to E.164: 0712…, 712…, +254712… */
function normalisePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  const match = digits.match(/^(?:\+?254|0)?(7\d{8}|1\d{8})$/);
  return match ? `+254${match[1]}` : null;
}

/**
 * Registration for both branches of screen 03. An owner lands with an
 * UNSUBMITTED verification and cannot publish until an admin approves it
 * (CLAUDE.md rule 1) — the account is created, the ability to list is not.
 */
export async function register(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const role = formData.get("role") === "owner" ? "OWNER" : "TENANT";
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const businessName = String(formData.get("businessName") ?? "").trim();
  const kind: OwnerKind = formData.get("kind") === "AGENT" ? "AGENT" : "LANDLORD";

  const values = { fullName, email, phone: phoneRaw, businessName, role: role.toLowerCase() };
  const fieldErrors: RegisterState["fieldErrors"] = {};

  if (fullName.length < 2) fieldErrors.fullName = "Enter your full name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fieldErrors.email = "Enter a valid email address.";

  const phone = normalisePhone(phoneRaw);
  if (!phone) fieldErrors.phone = "Enter a Kenyan mobile number, e.g. 0712 345 678.";

  if (password.length < 8) {
    fieldErrors.password = "Use at least 8 characters.";
  } else if (!/\d|[^A-Za-z0-9]/.test(password)) {
    fieldErrors.password = "Include a number or a symbol.";
  } else if (password !== confirm) {
    fieldErrors.password = "The two passwords do not match.";
  }

  if (role === "OWNER" && businessName.length < 2) {
    fieldErrors.businessName = "Owners need a business or agency name.";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return {
      error: "An account with that email already exists. Sign in instead.",
      fieldErrors: { email: "Already registered." },
      values,
    };
  }

  const user = await db.user.create({
    data: {
      role,
      fullName,
      email,
      phone: phone!,
      passwordHash: await hashPassword(password),
      ...(role === "OWNER"
        ? {
            ownerProfile: {
              create: {
                businessName,
                kind,
                about: "",
                primaryEstate: "",
                memberSince: new Date(),
                // Nothing is verified yet, so nothing can be published.
                verification: { create: { state: "UNSUBMITTED" } },
              },
            },
          }
        : {
            tenantProfile: {
              create: { preferredEstates: "[]", preferredTypes: "[]" },
            },
          }),
    },
    select: { id: true, role: true },
  });

  await setSessionCookie({ userId: user.id, role: user.role });
  redirect(role === "OWNER" ? "/dashboard/verification" : homePathForRole(user.role));
}
