import Link from "next/link";
import { Bell, Heart, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { getCurrentUser, homePathForRole } from "@/lib/auth";
import { countUnreadNotifications } from "@/lib/queries/notifications";
import { db } from "@/lib/db";

/**
 * One white top bar for every tenant-facing page.
 *
 * The designs carry two: a white one on screens 01, 03, 04 and 06, and an ink
 * one on 05 and 24. The white one wins — it covers both load-bearing screens
 * and four of the six. Screens 01 and 04 differ only in their nav, and they
 * differ exactly along the signed-out / signed-in line, so that is the split
 * this component implements.
 */
export async function TopBar({ searchSlot }: { searchSlot?: React.ReactNode }) {
  const user = await getCurrentUser();

  const [unread, savedCount] = user
    ? await Promise.all([
        countUnreadNotifications(user.id),
        db.savedListing.count({ where: { userId: user.id } }),
      ])
    : [0, 0];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-container-max items-center gap-space-lg px-gutter-mobile lg:px-gutter-desktop">
        <Logo />

        {searchSlot && <div className="hidden min-w-0 flex-1 md:block">{searchSlot}</div>}

        <nav className={`hidden items-center gap-space-lg lg:flex ${searchSlot ? "" : "flex-1"}`}>
          {user ? (
            <>
              <Link href="/listings" className="text-label-md text-ink hover:text-brand-strong">
                Browse Rentals
              </Link>
              <Link
                href="/saved"
                className="flex items-center gap-space-2xs text-body-md text-muted hover:text-ink"
              >
                Saved Homes
                {savedCount > 0 && <span className="text-muted-subtle">({savedCount})</span>}
              </Link>
              <Link href="/#why" className="text-body-md text-muted hover:text-ink">
                Why MoveApp
              </Link>
            </>
          ) : (
            <>
              <Link href="/listings" className="text-label-md text-ink hover:text-brand-strong">
                Find Houses
              </Link>
              <Link href="/#how" className="text-body-md text-muted hover:text-ink">
                How It Works
              </Link>
              <Link href="/register?role=owner" className="text-body-md text-muted hover:text-ink">
                List Your Property
              </Link>
              <Link href="/#why" className="text-body-md text-muted hover:text-ink">
                Why MoveApp
              </Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-space-sm">
          {user ? (
            <>
              <Link href="/saved" className="relative p-space-2xs text-muted hover:text-ink md:hidden">
                <Heart className="size-5" />
                <span className="sr-only">Saved homes</span>
              </Link>
              <Link href="/notifications" className="relative p-space-2xs text-muted hover:text-ink">
                <Bell className="size-5" />
                {unread > 0 && (
                  <span
                    className="absolute right-0.5 top-0.5 size-2 rounded-full bg-brand ring-2 ring-surface"
                    aria-hidden
                  />
                )}
                <span className="sr-only">
                  Notifications{unread > 0 ? ` (${unread} unread)` : ""}
                </span>
              </Link>
              <Link href={homePathForRole(user.role)} aria-label={`Signed in as ${user.fullName}`}>
                <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/register?role=owner" className="hidden sm:block">
                <Button variant="secondary" size="sm">
                  List a House
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {searchSlot && <div className="border-t border-border px-gutter-mobile py-space-xs md:hidden">{searchSlot}</div>}
    </header>
  );
}

/** The inline search field the listing screens put in the bar. */
export function TopBarSearch({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/listings" className="relative max-w-lg">
      <Search className="pointer-events-none absolute left-space-sm top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search Nairobi, Kilimani, Westlands…"
        aria-label="Search listings"
        className="h-10 w-full rounded-lg border border-border bg-surface-low pl-9 pr-space-sm text-body-md text-ink placeholder:text-muted-subtle focus:border-ink/30 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-ink/10"
      />
    </form>
  );
}
