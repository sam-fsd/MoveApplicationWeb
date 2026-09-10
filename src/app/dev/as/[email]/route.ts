import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { homePathForRole } from "@/lib/auth";
import { serializeSession } from "@/lib/session";

/**
 * Dev-only: `GET /dev/as/owner@moveapp.ke?next=/dashboard` signs in as a seeded
 * account and redirects. It exists so a signed-in page can be opened from a
 * plain link — handy when driving the demo, and the only way a headless browser
 * can reach one. Disabled outside development.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> },
) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const email = decodeURIComponent((await params).email).toLowerCase();
  const user = await db.user.findUnique({ where: { email }, select: { id: true, role: true } });

  if (!user) {
    return new NextResponse(`No seeded account for ${email}. Run \`npm run db:seed\`.`, {
      status: 404,
    });
  }

  // Only same-origin paths, so this cannot be turned into an open redirect.
  const requested = request.nextUrl.searchParams.get("next");
  const next = requested?.startsWith("/") ? requested : homePathForRole(user.role);

  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set("moveapp_session", serializeSession({ userId: user.id, role: user.role }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
