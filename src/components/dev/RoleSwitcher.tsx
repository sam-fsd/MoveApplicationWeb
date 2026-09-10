import { LogOut, ShieldCheck, UserCog, UserRound } from "lucide-react";
import type { Role } from "@prisma/client";
import { signInAs } from "@/app/dev/actions";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { getCurrentUser } from "@/lib/auth";

const ACCOUNTS: { role: Role; email: string; label: string; icon: React.ReactNode }[] = [
  { role: "TENANT", email: "tenant@moveapp.ke", label: "Tenant", icon: <UserRound /> },
  { role: "OWNER", email: "owner@moveapp.ke", label: "Owner", icon: <UserCog /> },
  { role: "ADMIN", email: "admin@moveapp.ke", label: "Admin", icon: <ShieldCheck /> },
];

/**
 * Dev-only. Renders nothing in a production build.
 */
export async function RoleSwitcher() {
  if (process.env.NODE_ENV === "production") return null;

  const user = await getCurrentUser();

  return (
    <div className="flex flex-wrap items-center gap-space-sm rounded-xl border border-border bg-surface p-space-sm shadow-card">
      <span className="text-caption uppercase tracking-wider text-muted">Sign in as</span>

      {ACCOUNTS.map((account) => {
        const active = user?.role === account.role;
        return (
          <form key={account.email} action={signInAs.bind(null, account.email)}>
            <Button
              type="submit"
              size="sm"
              variant={active ? "primary" : "secondary"}
              aria-current={active ? "true" : undefined}
            >
              {account.icon}
              {account.label}
            </Button>
          </form>
        );
      })}

      <span className="ml-auto flex items-center gap-space-sm">
        {user ? (
          <>
            <Pill tone="success" dot>
              {user.fullName}
            </Pill>
            <form action={logout}>
              <Button type="submit" size="sm" variant="ghost">
                <LogOut />
                Sign out
              </Button>
            </form>
          </>
        ) : (
          <Pill>Signed out</Pill>
        )}
      </span>
    </div>
  );
}
