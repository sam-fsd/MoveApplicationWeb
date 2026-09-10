# Build Plan

Work one phase at a time. Stop at the end of each phase, summarise what changed,
and wait for confirmation before continuing.

## Phase 0 — Foundation
- Scaffold Next.js (App Router, TypeScript, Tailwind, ESLint, `src/` dir).
- Port the tokens from `docs/DESIGN_SYSTEM.md` into the Tailwind theme.
- Prisma + SQLite, schema from `docs/DATA_MODEL.md`, first migration.
- Copy assets from `docs/screens/asset_*.png` into `public/` per `SCREENS.md`.
- `lib/format.ts` with `formatKes()` and relative-time helpers.
- Root layout, fonts, and a `/kitchen-sink` dev page rendering Button, Pill,
  Badge, Card, Input, and EmptyState so we can eyeball the system early.

**Done when:** `/kitchen-sink` matches the colours and shapes in the screens.

## Phase 1 — Seed and data layer
- Seed script per `docs/DATA_MODEL.md`.
- `lib/queries/` for listings (with filter/sort/paginate), owners, reports,
  notifications.
- Cookie-session auth with role, login/logout server actions, `requireRole()`
  guard, and a dev role-switcher widget.

**Done when:** the seed runs clean and I can log in as each of the three roles.

## Phase 2 — Public and tenant browse (screens 01, 02, 03, 04, 05, 24)
- Landing page, login, register, listings index with working URL-param filters,
  empty state, 404.
- `ListingCard` built properly here — it appears in six later screens.

**Done when:** filters, sort, and pagination all work against the seed.

## Phase 3 — Listing detail and tenant actions (06, 07, 08, 09, 10, 11, 12, 13)
- Detail page with gallery, contact modal with the `wa.me` deep link, report
  modal and submission, saved listings, price alerts, notifications dropdown,
  tenant settings, public owner profile.
- Saving and reporting are server actions with optimistic UI on the heart.

**Done when:** a tenant can search → view → save → contact → report end to end.

## Phase 4 — Owner portal (14, 15, 16, 17, 18, 19)
- Ink sidebar shell, dashboard with stat cards and recharts sparklines, listings
  table with status tabs, multi-step create form with local image upload,
  listing management with the views chart and enquiries, verification pending
  view, profile edit with live preview.
- Publishing is blocked unless the owner's verification is APPROVED.

**Done when:** an unverified owner is correctly blocked and a verified one can
create a listing that lands in PENDING_REVIEW.

## Phase 5 — Admin console (20, 21, 22, 23)
- Ops overview with the six stat cards and the weekly stacked bar chart,
  verification review with approve/reject that flips owner state and issues a
  certificate number, listings moderation with bulk actions, reports queue with
  the detail drawer and its four moderation actions.

**Done when:** approving an owner in admin unblocks publishing in the owner
portal, and unpublishing a reported listing removes it from tenant search.

## Phase 6 — Demo polish
- Loading skeletons on every list, toasts on every mutation, responsive passes
  at 390px and 768px, README with setup steps and demo logins, and a
  `docs/DEMO_SCRIPT.md` walking the presentation path through all three roles.

## Out of scope — do not build
Payments, escrow, real WhatsApp Business API, live chat, ratings and reviews,
video upload, movers marketplace, email sending, real document OCR or ID
verification, production-grade auth.
