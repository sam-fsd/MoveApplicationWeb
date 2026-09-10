import { redirect } from "next/navigation";
import { getCurrentUser, homePathForRole } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

/**
 * A plain, working sign-in form. The designed page is screen 02 and is built in
 * Phase 2 — this stands in so the auth flow is exercisable end to end, and its
 * markup is expected to be replaced wholesale rather than restyled.
 */
export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-space-lg px-gutter-mobile">
      <div className="space-y-space-2xs">
        <p className="text-label-sm uppercase tracking-wider text-muted">MoveApp Kenya</p>
        <h1 className="text-headline-lg">Sign in</h1>
      </div>
      <LoginForm />
    </main>
  );
}
