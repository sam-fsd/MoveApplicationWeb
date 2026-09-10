"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, CheckCheck, Flag, Home, MessageSquare, Tag } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/app/notifications/actions";
import { Pill } from "@/components/ui/Pill";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface NotificationRow {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
}

const ICONS: Record<string, React.ReactNode> = {
  SAVED_SEARCH_MATCH: <Home />,
  PRICE_DROP: <Tag />,
  ENQUIRY_REPLY: <MessageSquare />,
  ENQUIRY_RECEIVED: <MessageSquare />,
  LISTING_APPROVED: <BellRing />,
  REPORT_UPDATE: <Flag />,
  VERIFICATION_SUBMITTED: <BellRing />,
};

/** Screen 11 — the bell dropdown, grouped items with unread dots. */
export function NotificationsMenu({
  notifications,
  unread,
}: {
  notifications: NotificationRow[];
  unread: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on an outside click or Escape — a dropdown, not a modal.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative rounded-lg p-space-2xs text-muted transition-colors hover:bg-surface-low hover:text-ink"
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && (
          <span
            className="absolute right-0.5 top-0.5 size-2 rounded-full bg-brand ring-2 ring-surface"
            aria-hidden
          />
        )}
        <span className="sr-only">Notifications{unread > 0 ? ` (${unread} unread)` : ""}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-space-xs w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-surface shadow-raised"
        >
          <header className="flex items-center justify-between gap-space-sm border-b border-border px-space-md py-space-sm">
            <h2 className="flex items-center gap-space-xs text-headline-sm">
              Notifications
              {unread > 0 && <Pill tone="warning">{unread} unread</Pill>}
            </h2>
            {unread > 0 && (
              <form action={markAllNotificationsRead}>
                <button
                  type="submit"
                  className="flex items-center gap-space-2xs text-label-sm text-muted transition-colors hover:text-ink"
                >
                  <CheckCheck className="size-4" aria-hidden />
                  Mark all as read
                </button>
              </form>
            )}
          </header>

          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-space-md py-space-xl text-center text-body-md text-muted">
                Nothing yet. We will tell you when a match, a reply, or a report update arrives.
              </li>
            )}

            {notifications.map((notification) => {
              const unreadItem = !notification.readAt;
              const body = (
                <>
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4",
                      unreadItem ? "bg-brand-subtle text-brand-strong" : "bg-surface-low text-muted",
                    )}
                    aria-hidden
                  >
                    {ICONS[notification.kind] ?? <Bell />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-label-md text-ink">{notification.title}</span>
                    <span className="mt-space-2xs block text-body-sm text-muted">
                      {notification.body}
                    </span>
                    <span className="mt-space-2xs block text-caption text-muted-subtle">
                      {formatRelative(new Date(notification.createdAt))}
                    </span>
                  </span>
                  {unreadItem && (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
                  )}
                </>
              );

              return (
                <li key={notification.id}>
                  {notification.href ? (
                    <Link
                      href={notification.href}
                      onClick={() => {
                        setOpen(false);
                        if (unreadItem) void markNotificationRead(notification.id);
                      }}
                      className="flex items-start gap-space-sm px-space-md py-space-sm transition-colors hover:bg-surface-low"
                    >
                      {body}
                    </Link>
                  ) : (
                    <span className="flex items-start gap-space-sm px-space-md py-space-sm">{body}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
