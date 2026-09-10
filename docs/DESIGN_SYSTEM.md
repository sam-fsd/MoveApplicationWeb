# Design System

Derived from the Stitch screens. Where a value here disagrees with the Stitch
HTML export in `docs/stitch-export/`, **the export wins** — sample the real hex
values from it and correct this file.

## Colour

| Token | Value | Use |
|---|---|---|
| `brand` | `#FFC833` | Primary buttons, active nav pill, logo mark, chart highlight bar |
| `brand-hover` | `#F0B81F` | Hover on yellow |
| `ink` | `#141414` | Sidebars, headings, body text, dark CTA panel |
| `ink-soft` | `#2A2A2A` | Sidebar hover rows |
| `muted` | `#6B7280` | Secondary text, helper copy, table labels |
| `bg` | `#FAFAF8` | Page background |
| `surface` | `#FFFFFF` | Cards, tables, modals |
| `border` | `#E8E6E1` | Dividers, input borders, card outlines |
| `success` | `#16A34A` | Verified badges, passed checks, positive trend |
| `success-bg` | `#EAF7EE` | Verified pill background |
| `warning` | `#E8A33D` | Pending review, moderate severity, SLA warnings |
| `warning-bg` | `#FDF4E3` | Pending pill background |
| `danger` | `#DC2626` | Critical reports, destructive actions, report link |
| `danger-bg` | `#FDECEC` | Critical pill background |

Rules the screens follow consistently:
- Text on yellow is always `ink`, never white.
- Yellow is never used for text, icons, or borders — only as a fill.
- Status is always communicated by a **pill**: coloured dot + label on a tinted
  background, not by coloured text alone.
- The owner and admin sidebars are `ink`; the tenant-facing app has a white top
  bar and no sidebar.

## Typography

- Display and headings: a geometric sans, semibold, tight tracking. Headings are
  large and confident — the landing h1 and page titles are noticeably big.
- Body and UI: same family, regular/medium.
- Prices: semibold `ink`, larger than surrounding text, with `/ month` in
  `muted` at normal weight beside it. On the detail page the price carries a
  yellow underline accent bar.
- Stat card numbers are very large (~40px) and sit under a small uppercase
  letter-spaced label.

## Shape and depth

- Cards: 12–16px radius, `border` outline, white fill, minimal or no shadow.
- Buttons and inputs: 8–10px radius. Pills and chips: fully rounded.
- Images in cards: 4:3, rounded, with overlay chips on the photo.
- Layout is boxed and generous: the whole app sits in a max-width container with
  clear 24–32px gaps between cards.

## Recurring components to build once

- **ListingCard** — photo with house-type chip bottom-left, feature chip
  bottom-right (e.g. "Borehole Water", "24/7 Water"), heart top-right; then
  price + deposit note, title, location line, a three-icon spec row
  (beds / baths / extra), and a footer with owner avatar, name, verified badge.
- **VerifiedBadge** — green check + label, variants for Owner / Agent / Landlord.
- **StatusPill** — dot + label, driven by the listing/report enums.
- **StatCard** — uppercase label, icon top-right, big number, trend line and a
  delta caption at the bottom.
- **VerificationChecklist** — rows of green check or grey pending dot with a
  label and sub-label.
- **EmptyState** — illustration, headline, one line of copy, one or two buttons.
- **SidebarNav** — ink panel, yellow active row, count badges on Enquiries /
  Verifications / Reports.
- **TrustNotice** — small tinted band with an icon, used for "Never pay viewing
  fees" and the approximate-location disclaimer.

## Voice

Direct, plain, slightly blunt about fraud. Headline patterns from the designs:
"Find your next rental in Kenya without walking estate to estate", "Zero phantom
listings", "Never Pay Viewing Fees", "Renting made transparent in 3 simple
steps". Greetings are localised — the owner dashboard opens with "Habari,
Samuel!". Keep that.
