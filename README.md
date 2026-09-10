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
npm run dev            # http://localhost:3000
```

Seed data and demo logins arrive in Phase 1 (`npm run db:seed`).

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

`/kitchen-sink` renders every shared primitive on one page. It is a development
page and is not linked from the app.
