/**
 * Every price and date string in the app goes through this module. Rule 7 of
 * CLAUDE.md: money is always integer KES, rendered "Ksh 45,000" with a
 * "/ month" suffix — never decimals, never "$", never "KES 45000.00".
 */

const KES = new Intl.NumberFormat("en-KE", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

/** `45000` -> `"Ksh 45,000"` */
export function formatKes(amount: number): string {
  return `Ksh ${KES.format(Math.round(amount))}`;
}

/** `45000` -> `"Ksh 45k"`. Used in tight spots like the hero card on screen 01. */
export function formatKesCompact(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded < 1000) return `Ksh ${rounded}`;
  const thousands = rounded / 1000;
  const label = Number.isInteger(thousands) ? thousands : thousands.toFixed(1);
  return `Ksh ${label}k`;
}

/** `20000, 95000` -> `"Ksh 20k – 95k"`. The filter chips on screen 04. */
export function formatKesRange(min: number, max: number): string {
  return `${formatKesCompact(min)} – ${formatKesCompact(max).replace("Ksh ", "")}`;
}

/** `1` -> `"Deposit: 1 Month"`, `2` -> `"Deposit: 2 Months"` */
export function formatDeposit(months: number): string {
  return `Deposit: ${months} ${months === 1 ? "Month" : "Months"}`;
}

/** `1` -> `"Dep: 1 Mo"`. The compact chip beside the price on a listing card. */
export function formatDepositChip(months: number): string {
  return `Dep: ${months} Mo`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * `"14m ago"`, `"2h ago"`, `"1d ago"`, `"3w ago"`, then an absolute date.
 * Matches the enquiry and report lists on screens 15 and 20.
 */
export function formatRelative(date: Date, now: Date = new Date()): string {
  const ms = now.getTime() - date.getTime();
  if (ms < 0) return formatShortDate(date);
  if (ms < MINUTE) return "Just now";
  if (ms < HOUR) return `${Math.floor(ms / MINUTE)}m ago`;
  if (ms < DAY) return `${Math.floor(ms / HOUR)}h ago`;
  if (ms < WEEK) return `${Math.floor(ms / DAY)}d ago`;
  if (ms < 5 * WEEK) return `${Math.floor(ms / WEEK)}w ago`;
  return formatShortDate(date);
}

/**
 * `"Today, 10:45 AM"` / `"Yesterday, 16:20"` / `"12 Aug 2025"`. The pending
 * verification rows on screen 20 use this longer form rather than "2h ago".
 */
export function formatSubmittedAt(date: Date, now: Date = new Date()): string {
  const days = calendarDaysBetween(date, now);
  if (days === 0) return `Today, ${formatTime(date)}`;
  if (days === 1) return `Yesterday, ${formatTime(date)}`;
  if (days < 7) return `${days} days ago`;
  return formatShortDate(date);
}

/** `"1 Oct 2025"` — the availability spec card on screen 06. */
export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** `"May 2023"` — "Member since May 2023" on the owner card. */
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(date);
}

/** `"1 Oct – 31 Oct, 2025"` — the dashboard date-range control on screen 15. */
export function formatDateRange(from: Date, to: Date): string {
  const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
  return `${day.format(from)} – ${day.format(to)}, ${to.getFullYear()}`;
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toUpperCase();
}

/** `0.184` -> `"+18.4%"`. Trend captions on the stat cards. */
export function formatDelta(ratio: number, digits = 1): string {
  const pct = ratio * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}%`;
}

/** `4820` -> `"4,820"`. Stat card numbers. */
export function formatCount(value: number): string {
  return KES.format(Math.round(value));
}

/** `"Grace Muthoni Wambui"` -> `"GW"`. Avatar fallbacks across every screen. */
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function calendarDaysBetween(date: Date, now: Date): number {
  const a = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((b - a) / DAY);
}
