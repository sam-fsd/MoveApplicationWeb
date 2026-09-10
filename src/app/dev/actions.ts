"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { homePathForRole } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

/**
 * Dev-only shortcut: sign in as a seeded account without typing a password.
 * CLAUDE.md sanctions a role switcher for demoing. It refuses to run outside
 * development so a deployed build cannot be walked into.
 */
export async function signInAs(email: string): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The role switcher is disabled outside development.");
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
  if (!user) throw new Error(`No seeded account for ${email}. Run \`npm run db:seed\`.`);

  await setSessionCookie({ userId: user.id, role: user.role });
  redirect(homePathForRole(user.role));
}
