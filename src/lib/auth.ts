import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { readSessionCookie } from "@/lib/session";

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof loadCurrentUser>>>;

/**
 * Deduped per request by React's cache(), so a layout and its pages can each
 * ask for the current user without repeating the query.
 */
export const getCurrentUser = cache(loadCurrentUser);

async function loadCurrentUser() {
  const session = await readSessionCookie();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      role: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      ownerProfile: {
        select: {
          id: true,
          businessName: true,
          kind: true,
          primaryEstate: true,
          badgeLabel: true,
          verification: { select: { state: true, certificateNumber: true } },
        },
      },
      tenantProfile: { select: { id: true } },
    },
  });

  // The cookie outlived the row — a reseed, most likely.
  if (!user || user.role !== session.role) return null;

  return user;
}

/** Where each role lands after signing in. */
export function homePathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "OWNER":
      return "/dashboard";
    default:
      return "/listings";
  }
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Guards a route to one or more roles. A signed-in user with the wrong role is
 * sent to their own home rather than the login page — being logged in as the
 * wrong role is not an authentication failure.
 */
export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(homePathForRole(user.role));
  return user;
}

/**
 * An owner may only publish once an admin has approved their verification
 * (CLAUDE.md rule 1). Callers use this to choose between the publish action and
 * the pending state on screen 16.
 */
export function canPublish(user: CurrentUser): boolean {
  return user.role === "OWNER" && user.ownerProfile?.verification?.state === "APPROVED";
}
