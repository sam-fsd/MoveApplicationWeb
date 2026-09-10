import Link from "next/link";
import { LayoutGrid, LifeBuoy, LogOut, MessageSquare, Plus, Search, Settings, UserRound, Building2 } from "lucide-react";

import { logout } from "@/app/login/actions";
import { NotificationsMenu } from "@/components/layout/NotificationsMenu";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import type { CurrentUser } from "@/lib/auth";
import { countUnreadNotifications, findNotifications } from "@/lib/queries/notifications";
import { db } from "@/lib/db";
import { cn } from "@/lib/cn";

export interface OwnerNavKey {
  key: "dashboard" | "listings" | "enquiries" | "profile" | "settings";
}

/**
 * The ink sidebar shell every owner screen sits in (15, 16, 17, 18, 19 and 14).
 * Tenant pages keep the white top bar; the portal is a different surface.
 */
export async function OwnerShell({
  user,
  current,
  children,
}: {
  user: CurrentUser;
  current: OwnerNavKey["key"];
  children: React.ReactNode;
}) {
  const [unreadEnquiries, unread, notifications] = await Promise.all([
    db.enquiry.count({ where: { listing: { ownerId: user.id }, readAt: null } }),
    countUnreadNotifications(user.id),
    findNotifications(user.id),
  ]);

  const verification = user.ownerProfile?.verification;
  const approved = verification?.state === "APPROVED";

  const nav = [
    { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutGrid /> },
    { key: "listings", label: "My Listings", href: "/dashboard/listings", icon: <Building2 /> },
    {
      key: "enquiries",
      label: "Enquiries",
      href: "/dashboard/enquiries",
      icon: <MessageSquare />,
      badge: unreadEnquiries,
    },
    { key: "profile", label: "Profile", href: "/dashboard/profile", icon: <UserRound /> },
    { key: "settings", label: "Settings", href: "/account", icon: <Settings /> },
  ] as const;

  return (
    <div className="min-h-dvh bg-bg lg:pl-sidebar">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-sidebar flex-col justify-between bg-ink text-white lg:flex">
        <div>
          <div className="px-space-lg py-space-lg">
            <Link href="/dashboard" className="block">
              <span className="font-display text-headline-sm text-white">
                MoveApp<span className="text-brand">.ke</span>
              </span>
              <span className="mt-space-2xs block text-caption uppercase tracking-widest text-white/50">
                Landlord Portal
              </span>
            </Link>
          </div>

          <div className="px-space-md pb-space-md">
            <Link href={approved ? "/dashboard/listings/new" : "/dashboard/verification"}>
              <Button size="lg" className="w-full">
                <Plus />
                Add Listing
              </Button>
            </Link>
          </div>

          <nav className="px-space-xs">
            <p className="px-space-sm pb-space-xs text-caption uppercase tracking-widest text-white/40">
              Management
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
                      "flex size-5 items-center justify-center rounded-full text-caption font-semibold",
                      item.key === current ? "bg-ink text-brand" : "bg-brand text-ink",
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
          <span className="flex items-center gap-space-sm rounded-lg px-space-sm py-space-sm text-label-md text-white/60">
            <LifeBuoy className="size-5 shrink-0" aria-hidden />
            Landlord Support
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-space-sm rounded-lg px-space-sm py-space-sm text-label-md text-white/70 transition-colors hover:bg-ink-soft hover:text-white"
            >
              <LogOut className="size-5 shrink-0" aria-hidden />
              Logout
            </button>
          </form>
          <p className="mx-space-sm flex items-center justify-between rounded-lg bg-ink-soft px-space-sm py-space-xs text-caption text-white/50">
            <span className="flex items-center gap-space-2xs">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              Nairobi Central MLLS
            </span>
            <span>v2.4</span>
          </p>
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="flex h-16 items-center gap-space-md px-gutter-mobile lg:px-gutter-desktop">
          <Link href="/dashboard" className="font-display text-headline-sm lg:hidden">
            MoveApp<span className="text-brand-strong">.ke</span>
          </Link>

          <form action="/dashboard/listings" className="relative hidden min-w-0 flex-1 md:block">
            <Search className="pointer-events-none absolute left-space-sm top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              name="q"
              placeholder="Search listings by estate, tenant name, or unit ID…"
              aria-label="Search your listings"
              className="h-10 w-full max-w-xl rounded-lg border border-border bg-surface-low pl-9 pr-space-sm text-body-md placeholder:text-muted-subtle focus:bg-surface focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-space-sm">
            <Link href={approved ? "/dashboard/listings/new" : "/dashboard/verification"}>
              <Button size="sm">
                <Plus />
                <span className="hidden sm:inline">Add New Listing</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>

            <NotificationsMenu notifications={notifications} unread={unread} />

            <span className="flex items-center gap-space-sm border-l border-border pl-space-sm">
              <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
              <span className="hidden min-w-0 lg:block">
                <span className="flex items-center gap-space-2xs text-label-md text-ink">
                  {user.fullName}
                  {!approved && <Pill tone="warning">Pending verification</Pill>}
                </span>
                <span className="block truncate text-body-sm text-muted">
                  {user.ownerProfile?.businessName}
                </span>
              </span>
            </span>
          </div>
        </div>

        {/* Mobile nav — the sidebar is desktop-only */}
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
