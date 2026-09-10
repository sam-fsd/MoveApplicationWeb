import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "moveapp_session";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * A deliberately simple signed cookie, per CLAUDE.md: no NextAuth, no OAuth.
 * The payload is `<userId>:<role>` with an HMAC appended so the role cannot be
 * edited client-side. It is not encrypted — nothing secret goes in it.
 */
export interface Session {
  userId: string;
  role: Role;
}

function secret(): string {
  return process.env.SESSION_SECRET || "moveapp-dev-secret-not-for-production";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function serializeSession(session: Session): string {
  const payload = `${session.userId}:${session.role}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSession(raw: string | undefined): Session | null {
  if (!raw) return null;

  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;

  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  const expected = sign(payload);

  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const [userId, role] = payload.split(":");
  if (!userId || !role) return null;

  return { userId, role: role as Role };
}

export async function setSessionCookie(session: Session): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, serializeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function readSessionCookie(): Promise<Session | null> {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE)?.value);
}
