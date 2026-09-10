"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { homePathForRole } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

export interface LoginState {
  error?: string;
  email?: string;
}

/**
 * Used by the login form on screen 02 (built in Phase 2). Sign-in is
 * role-agnostic; the redirect afterwards is by role.
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true, passwordHash: true },
  });

  // Same message either way — do not reveal which accounts exist.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "That email and password do not match an account.", email };
  }

  await setSessionCookie({ userId: user.id, role: user.role });
  redirect(homePathForRole(user.role));
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
