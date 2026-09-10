import Link from "next/link";
import { Building2, FileDown, Flag, LayoutGrid, LogOut, Search, Settings, ShieldCheck, Users } from "lucide-react";

import { logout } from "@/app/login/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { NotificationsMenu } from "@/components/layout/NotificationsMenu";
import type { CurrentUser } from "@/lib/auth";
import { countUnreadNotifications, findNotifications } from "@/lib/queries/notifications";
import { db } from "@/lib/db";
import { cn } from "@/lib/cn";

export type AdminNavKey = "overview" | "verifications" | "listings" | "reports" | "users" | "settings";

/**
 * The ops console shell (screens 20–23). Same ink sidebar as the owner portal
 * but branded OPS CONSOLE, with live counts on the two work queues so an admin
 * can see what needs attention without opening anything.
 */
export async function AdminShell({
  user,
  current,
  title,
  children,
}: {
  user: CurrentUser;
  current: AdminNavKey;
  title: string;
  children: React.ReactNode;
}) {
  const [pendingVerifications, openReports, unread, notifications] = await Promise.all([
    db.verification.count({ where: { state: "PENDING" } }),
    db.report.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    countUnreadNotifications(user.id),
    findNotifications(user.id),
  ]);

  const nav = [
    { key: "overview", label: "Overview", href: "/admin", icon: <LayoutGrid /> },
    {
      key: "verifications",
      label: "Owner Verifications",
      href: "/admin/verifications",
      icon: <ShieldCheck />,
      badge: pendingVerifications,
      tone: "warning" as const,
    },
    { key: "listings", label: "Listings", href: "/admin/listings", icon: <Building2 /> },
    {
      key: "reports",
      label: "Reports",
      href: "/admin/reports",
      icon: <Flag />,
      badge: openReports,
      tone: "danger" as const,
    },
    { key: "users", label: "Users", href: "/admin/users", icon: <Users /> },
    { key: "settings", label: "Settings", href: "/account", icon: <Settings /> },
  ] as const;

  return (
    <div className="min-h-dvh bg-bg lg:pl-sidebar">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-sidebar flex-col justify-between bg-ink text-white lg:flex">
        <div>
          <div className="px-space-lg py-space-lg">
            <Link href="/admin" className="flex flex-wrap items-center gap-space-xs">
              <span className="font-display text-headline-sm text-white">
                MoveApp<span className="text-brand">.ke</span>
              </span>
              <span className="rounded-full bg-brand px-space-xs py-0.5 text-caption font-semibold uppercase tracking-wider text-ink">
                Ops console
              </span>
            </Link>
            <span className="mt-space-2xs block text-caption uppercase tracking-widest text-white/50">
              Admin
            </span>
          </div>

          <nav className="px-space-xs">
            <p className="px-space-sm pb-space-xs text-caption uppercase tracking-widest text-white/40">
              Operational units
            </p>
            {nav.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={item.key === current ? "page" : undefined}
                className={cn(
                  "flex items-center gap-space-sm rounded-lg px-space-sm py-space-sm text-label-md transition-colors",
                  item.key === current
                    ? "bg-brand text-ink"
                    : "text-white/70 hover:bg-ink-soft hover:text-white",
                )}
              >
                <span className="shrink-0 [&_svg]:size-5" aria-hidden>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {"badge" in item && item.badge > 0 && (
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-caption font-semibold text-white",
                      item.tone === "danger" ? "bg-danger" : "bg-warning",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-space-xs px-space-xs pb-space-md">
          <p className="mx-space-sm flex items-center justify-between rounded-lg bg-ink-soft px-space-sm py-space-xs text-caption text-white/60">
            <span className="flex items-center gap-space-2xs">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              All services operational
            </span>
            <span>99.9%</span>
          </p>

          <div className="flex items-center gap-space-sm px-space-sm py-space-xs">
            <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-label-sm text-white">{user.fullName}</span>
              <span className="block truncate text-caption text-white/50">Admin — Nairobi Ops</span>
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg p-space-2xs text-white/60 transition-colors hover:bg-ink-soft hover:text-white"
                aria-label="Log out"
              >
                <LogOut className="size-4" aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="flex h-16 items-center gap-space-md px-gutter-mobile lg:px-gutter-desktop">
          <p className="hidden shrink-0 items-center gap-space-xs text-body-md text-muted lg:flex">
            MoveApp Operations
            <span aria-hidden>/</span>
            <strong className="text-ink">{title}</strong>
          </p>
          <Link href="/admin" className="font-display text-headline-sm lg:hidden">
            MoveApp<span className="text-brand-strong">.ke</span>
          </Link>

          <form action="/admin/listings" className="relative hidden min-w-0 flex-1 md:block">
            <Search className="pointer-events-none absolute left-space-sm top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              name="q"
              placeholder="Search listings, owners, unit ID…"
              aria-label="Search the platform"
              className="h-10 w-full max-w-md rounded-lg border border-border bg-surface-low pl-9 pr-space-sm text-body-md placeholder:text-muted-subtle focus:bg-surface focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-space-sm">
            <Link href="/admin/reports">
              <Button size="sm">
                <FileDown />
                <span className="hidden sm:inline">Export audit log</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </Link>
            <NotificationsMenu notifications={notifications} unread={unread} />
            <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
          </div>
        </div>

        <nav className="flex gap-space-2xs overflow-x-auto border-t border-border px-gutter-mobile py-space-2xs lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-space-sm py-space-xs text-label-sm transition-colors",
                item.key === current ? "bg-ink text-white" : "text-muted hover:bg-surface-low",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="px-gutter-mobile py-space-lg lg:px-gutter-desktop">{children}</main>
    </div>
  );
}
