# MoveApp Kenya

A Next.js remake of the MoveApp Android rental-housing app for the Nairobi
market. Tenants browse listings from landlords and agents whose identity and
ownership documents have been vetted by an admin, and contact them directly over
WhatsApp — no middleman, no viewing fee.

Built for an academic presentation. `CLAUDE.md` holds the product rules and
every decision taken during the build; `docs/BUILD_PLAN.md` has the phase plan;
`docs/DEMO_SCRIPT.md` walks the presentation path through all three roles.

## Setup

Requires Node 18.18 or newer (built and tested on 18.19).

```bash
npm install
cp .env.example .env
npm run db:migrate     # creates prisma/dev.db and applies migrations
npm run db:seed        # fills it with the demo data
npm run dev            # http://localhost:3000
```

## Demo logins

All three use the password `moveapp123`.

| Role | Email | Who |
|---|---|---|
| Tenant | `tenant@moveapp.ke` | Wanjiku Mwangi — 6 saved homes, 2 price alerts |
| Owner | `owner@moveapp.ke` | Samuel Njoroge, Kamau Properties Ltd — verified, 6 listings |
| Admin | `admin@moveapp.ke` | Aisha Karanja — 4 verifications and 8 reports waiting |

There is also an unverified owner, `grace@kilimaniheights.co.ke`, for showing
the publish gate.

In development, `GET /dev/as/<email>?next=<path>` signs straight in as a seeded
account and redirects — the fastest way to switch roles mid-demo. It 404s in
production.

## The product in one paragraph

Nairobi renters lose money to phantom listings and agents who charge "viewing
fees" for houses that don't exist or are already taken. MoveApp only publishes
listings from landlords and agents whose documents an admin has vetted. Tenants
search by estate, budget and house type, and contact the landlord directly over
WhatsApp. Anyone can report a listing, and admins moderate reports and
verifications from an ops console. **Publishing is admin-only** — an owner
cannot put a listing live, which is what makes the verified badge mean anything.

## Routes

| Route | Screen | Notes |
|---|---|---|
| `/` | 01 | Landing: hero search, featured rentals, three steps, trust, split CTA |
| `/login` | 02 | Split layout, redirects by role |
| `/register` | 03 | Tenant / Owner toggle; owners land unverified and cannot publish |
| `/listings` | 04, 05 | Filters, sort and pagination, all as URL search params |
| `/listings/[id]` | 06, 07, 08 | Gallery, contact modal with `wa.me` deep link, report modal |
| `/saved` | 09, 10 | Saved grid, price alerts with real match counts |
| `/account` | 12 | Tenant details and search preferences |
| `/owners/[id]` | 13 | Public owner profile; approved owners only |
| `/dashboard` | 15 | Owner dashboard: stat cards, listings table, verification, enquiries |
| `/dashboard/listings` | — | Full listings table |
| `/dashboard/listings/new` | 17, 18 | Five-step wizard with local photo upload |
| `/dashboard/listings/[id]` | 19 | Views chart, enquiries, tenant card preview, health score |
| `/dashboard/verification` | 16 | Document checklist and audit status |
| `/dashboard/profile` | 14 | Public profile edit with live tenant preview |
| `/admin` | 20 | Ops overview: six stat cards, queues, weekly stacked bar chart |
| `/admin/verifications` | — | Verification queue by state |
| `/admin/verifications/[id]` | 22 | Review file, pre-checks, approve / reject |
| `/admin/listings` | 21 | Moderation table with bulk publish / unpublish |
| `/admin/reports` | 23 | Incident queue with detail drawer and four actions |
| `not-found` | 24 | |

`/kitchen-sink` renders every shared primitive on one page, and `/dev` is a
role-switching smoke test. Both are development-only.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production build and serve |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:seed` | Clear and refill the database |
| `npm run db:reset` | Drop, re-migrate, and re-seed |
| `npm run db:studio` | Prisma Studio |

## Where things live

```
docs/            design system, screen index, data model, build plan, demo script
docs/screens/    the 24 screen PNGs — the specification
docs/code/       Stitch HTML/Tailwind exports, one per screen
prisma/          schema, migrations, and the seed
src/app/         routes (App Router, Server Components by default)
src/components/  ui/ shared primitives, then layout/ listing/ owner/ admin/
src/lib/         format, auth, session, constants, whatsapp, queries/
public/seed/     seeded listing photos and avatars
public/uploads/  photos uploaded through the owner wizard (gitignored)
```

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 3 · Prisma 6 +
SQLite · recharts · lucide-react. Versions are pinned to what runs on Node 18 —
see the Phase 0 notes in `CLAUDE.md`.

## Out of scope

No payments, escrow, real WhatsApp Business API, live chat, ratings and reviews,
video upload, movers marketplace, email sending, real document OCR or ID
verification, or production-grade auth. The seed is deterministic, so reruns
produce identical data and screenshots stay valid.
