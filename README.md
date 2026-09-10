# MoveApp Kenya

A Next.js remake of the MoveApp Android rental-housing app for the Nairobi
market. Tenants browse listings from landlords and agents whose identity and
ownership documents have been vetted by an admin, and contact them directly over
WhatsApp — no middleman, no viewing fee.

Built for an academic presentation. See `CLAUDE.md` for the product rules and
`docs/BUILD_PLAN.md` for the phase plan.

## Setup

Requires Node 18.18+ (tested on 18.19).

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
| Tenant | `tenant@moveapp.ke` | Wanjiku Mwangi |
| Owner | `owner@moveapp.ke` | Samuel Njoroge, Kamau Properties Ltd — verified, 6 listings |
| Admin | `admin@moveapp.ke` | Aisha Karanja |

The seed is deterministic: rerunning it produces identical data, so screenshots
and the demo script stay valid. `/dev` is a development-only console with a role
switcher and a panel per query module.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production build and serve |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:reset` | Drop, re-migrate, and re-seed the database |
| `npm run db:studio` | Prisma Studio |

## Where things live

```
docs/            design system, screen index, data model, build plan
docs/screens/    the 24 screen PNGs — the specification
docs/code/       Stitch HTML/Tailwind exports, one per screen
prisma/          schema and migrations
src/app/         routes (App Router, Server Components by default)
src/components/  ui/ for shared primitives, then listing/ owner/ admin/
src/lib/         format.ts, db.ts, constants.ts, and queries/ from Phase 1
public/seed/     seeded listing photos and avatars
```

`/kitchen-sink` renders every shared primitive on one page, and `/dev` is a
role-switching smoke test. Both are development pages, are not linked from the
app, and 404 in production.

## Routes so far

| Route | Screen | Notes |
|---|---|---|
| `/` | 01 | Landing: hero search, featured rentals, three steps, trust, split CTA |
| `/login` | 02 | Split layout, real password sign-in, redirects by role |
| `/register` | 03 | Tenant / Owner toggle; owners land unverified and cannot publish |
| `/listings` | 04, 05 | Filters, sort and pagination, all as URL search params |
| `/listings/[id]` | 06, 07, 08 | Gallery, contact modal with `wa.me` deep link, report modal |
| `/saved` | 09, 10 | Saved grid, price alerts with real match counts |
| `/account` | 12 | Tenant details and search preferences |
| `/owners/[id]` | 13 | Public owner profile; approved owners only |
| `/dashboard` | 15 | Owner dashboard: stat cards, listings table, verification, enquiries |
| `/dashboard/listings` | — | Full listings table behind "View all listings" |
| `/dashboard/listings/new` | 17, 18 | Five-step wizard with local photo upload |
| `/dashboard/listings/[id]` | 19 | Views chart, enquiries, tenant card preview, health score |
| `/dashboard/verification` | 16 | Document checklist and audit status |
| `/dashboard/profile` | 14 | Public profile edit with live tenant preview |
| `not-found` | 24 | |

`GET /dev/as/<email>?next=<path>` signs in as a seeded account and redirects —
dev-only, and the quickest way to jump into a role while demoing.
