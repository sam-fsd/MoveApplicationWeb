# MoveApp Kenya — Project Context

## What this is

MoveApp is a rental-housing platform for the Kenyan urban market. This repo is a
**Next.js remake of an existing Android app** (see `docs/MOVE_DOCUMENTATION.pdf`
for the original project write-up). It is built for an academic presentation and
demo, not for production traffic — favour clarity, working flows, and realistic
seeded data over scale, auth hardening, or edge-case handling.

The design is already finished. Twenty-four screens were generated in Google
Stitch and live in `docs/screens/` as PNGs, with the Stitch HTML/Tailwind export
in `docs/code/`. **The screens are the specification.** When
implementing a page, open the matching PNG first and match it. Do not invent
layouts or restyle things.

## The product in one paragraph

Nairobi renters lose money to phantom listings and agents who charge "viewing
fees" for houses that don't exist or are already taken. MoveApp only publishes
listings from landlords and agents whose identity and ownership documents have
been vetted by an admin. Tenants search by estate, budget, and house type, view
verified listings with real photos, and contact the landlord directly over
WhatsApp or phone — no middleman, no viewing fee. Anyone can report a listing,
and admins moderate reports and verifications from an ops console.

Three roles: **TENANT**, **OWNER** (landlord or agent), **ADMIN**.

## Domain rules that matter

These came out of the design and are not negotiable — the UI depends on them.

1. An owner cannot publish a listing until an admin approves their verification.
   Unverified owners see the pending state (screen 16) instead of the publish
   action. New listings from a verified owner still enter `PENDING_REVIEW`
   before going live.
2. Every listing surface shows the owner's verification badge. Badge variants
   seen in the designs: `Verified Owner`, `Verified Agent`, `Verified Landlord`.
3. Verification is a checklist, not a boolean: National ID, KRA PIN, Title Deed
   or ownership mandate, physical inspection, and a zero-viewing-fee pledge.
   Store them individually — screens 16 and 22 render them as separate rows.
4. Contact details are hidden until the tenant clicks "Show Contact". Primary
   channel is WhatsApp, secondary is a phone call, then in-app message.
5. Listing status is an enum: `PENDING_REVIEW`, `PUBLISHED`, `RENTED_OUT`,
   `REJECTED`. Owner dashboard filters by exactly these.
6. Reports carry a reason tag and a severity (`LOW`, `MODERATE`, `CRITICAL`) and
   a status (`OPEN`, `UNDER_REVIEW`, `RESOLVED`, `DISMISSED`).
7. Money is always integer KES, rendered as `Ksh 45,000` with a `/ month`
   suffix. Never use decimals, never use `$`, never use `KES 45000.00`.
8. Locations are Nairobi estates: Westlands, Kilimani, Ruaka, Roysambu,
   Kasarani, South B, Ngong Road, Rongai, Umoja, Embakasi, Parklands.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS — tokens in `tailwind.config.ts`, sampled from `docs/code/`
- Prisma + SQLite (file DB, committed-friendly, zero setup for the demo)
- Auth: a deliberately simple cookie-session with a role on it. No NextAuth, no
  OAuth. A dev-only role switcher is welcome for demoing.
- Images: seeded listings use the photos in `public/seed/`. Uploads write to
  `public/uploads/` on the local filesystem.
- No payments, no live chat, no real WhatsApp API — the WhatsApp button opens a
  `https://wa.me/...` deep link with a prefilled message.

## Conventions

- Server Components by default; `"use client"` only for interactive pieces
  (filters, modals, image gallery, form steps).
- Data access through `lib/queries/*.ts`, mutations through server actions in
  `app/**/actions.ts`. No API routes unless something genuinely needs one.
- Shared UI in `components/ui/`, domain components in `components/listing/`,
  `components/owner/`, `components/admin/`.
- One component per file, named exports, no default exports except pages.
- Currency and date formatting go through `lib/format.ts`. Never inline
  `toLocaleString` in a component.
- Every list view needs its empty state built at the same time — the designs
  include them (screens 05, 10) and the demo will hit them.

## Working agreement

- Read `docs/BUILD_PLAN.md` and work in the phases listed there. Finish a phase
  and tell me before starting the next.
- Before building any page, view its PNG in `docs/screens/` and the matching
  entry in `docs/SCREENS.md`.
- If a screen implies data the schema doesn't have, update
  `prisma/schema.prisma` and the seed rather than faking it in the component.
- Seed data must look like the designs: real Kenyan names, real estates,
  plausible rents. The demo is judged on how real it looks.
- Don't add libraries without asking. Tailwind, Prisma, lucide-react, and
  recharts (owner/admin charts) are pre-approved.

## Decisions made during the build

Appended as they are taken, so they survive into the next session.

### Phase 0

- **Versions are pinned to what runs on Node 18**: Next 15.5.25, React 19,
  Tailwind 3.4, Prisma 6.19. `next@latest` needs Node >=20.9 and `prisma@latest`
  needs Node >=22; this machine's default `node` is 18.19, and an app that only
  starts after an `nvm use` is a risk on demo day. Tailwind 3 also means the
  Stitch configs port across without translation.
- **Every colour value in `docs/DESIGN_SYSTEM.md` is wrong** and the exports
  win, as that file itself says. The real palette lives in `tailwind.config.ts`:
  brand `#FFC93C` (not `#FFC833`), ink `#12151C`, muted `#5A6472`, bg `#FAF9F6`,
  border `#E6E3DC`, success `#1F9D55`, warning `#E08700`, danger `#D93025`.
- **The type scale is ported verbatim from the exports** — `headline-xl` down to
  `caption` — with Plus Jakarta Sans for display and prices, Inter for body.
  Fonts are self-hosted via `next/font` so the demo needs no network.
- **Icons are lucide-react, not Material Symbols.** The exports use the Material
  Symbols webfont in 1,038 places; lucide is pre-approved and needs no runtime
  network fetch.
- **`HouseType` was re-cut** to `BEDSITTER SINGLE_ROOM STUDIO APARTMENT
  MAISONETTE TOWNHOUSE`. `docs/DATA_MODEL.md` mixed building type with bedroom
  count (`ONE_BED`, `TWO_BED`, `THREE_BED`), but screen 04 filters those as two
  independent controls, and its list includes Townhouse.
- **`ListingViewDaily` and `PlatformWeekly` were added to the schema.** A single
  `viewCount` integer cannot draw the sparklines on screen 15, the views chart
  on screen 19, or the 12-week stacked bar on screen 20.
- **The verified badge label is kind-derived with a per-owner override**
  (`OwnerProfile.badgeLabel`). The exports spell it five ways — Verified
  Landlord, Verified Owner, Verified Agent, Verified Agency, and a bare
  "Verified" — against only two `OwnerKind` values.
- **`cn()` registers the custom font sizes with tailwind-merge.** Without it,
  `cn("text-white", "text-label-md")` silently drops the colour, because
  tailwind-merge cannot tell a custom text size from a text colour.

### Phase 1

- **Passwords use scrypt from `node:crypto`**, not bcrypt or argon2 — no auth
  library is pre-approved and the built-in is sufficient for a demo. Stored as
  `scrypt$<salt>$<hash>`.
- **The session is a signed cookie**, `<userId>:<role>` plus an HMAC, so the
  role cannot be edited client-side. Not encrypted — nothing secret goes in it.
  `SESSION_SECRET` falls back to a dev constant.
- **Ten owners, not eight.** `docs/DATA_MODEL.md` asks for 8 (6 approved / 2
  pending), but screen 20 shows four rows in its pending-verifications panel.
  Six approved plus four pending satisfies both.
- **Screen 20 lists Samuel Njoroge as a pending verification, but screen 15 is
  his dashboard and shows him approved with certificate #MP-NBI-2025-084.** The
  designs contradict each other. Approved wins, since his dashboard depends on
  it; Peter Kariuki takes the fourth pending slot.
- **Report queue ordering is done in JS, not SQL.** SQLite stores enums as text,
  so Prisma's `orderBy` sorts them alphabetically — DISMISSED would outrank
  OPEN and MODERATE would outrank CRITICAL. `src/lib/queries/reports.ts` ranks
  explicitly. Watch for this anywhere else an enum needs meaningful order.
- **`PlatformWeekly` is seeded, not derived.** Screen 20's chart peaks at 186
  listings a week against a seed of 35 listings total. Everything a demo action
  changes — pending verifications, open reports, listing statuses — is still
  counted from real rows.
- **The seed is deterministic** (mulberry32, fixed seed), so reruns produce
  identical data and screenshots stay valid.
- **`/login` and `/dev` are Phase 1 scaffolding.** The login page is a plain
  working form to be replaced wholesale by screen 02 in Phase 2, not restyled.
  `/dev` is a smoke-test console and 404s in production.

### Phase 2

- **One white top bar for every tenant page.** The designs carry two — white on
  screens 01, 03, 04 and 06, ink on 05 and 24. White wins: it covers both
  load-bearing screens and four of six. Screens 01 and 04 differ only in their
  nav, and they differ exactly along the signed-out / signed-in line, so
  `TopBar` splits on that.
- **One footer, following screen 01's columns** (Popular Estates / Property
  Types / Company & Trust). The designs carry three variants; this one wins
  because two of its columns are real links into filtered searches, where the
  other variants' columns are mostly pages this project does not build.
- **All listing filters are URL search params**, parsed and written in one place
  (`src/lib/search-params.ts`). Unknown or malformed values are dropped rather
  than rejected, so a hand-edited URL degrades to a broader search. An
  out-of-range `?page=` clamps to the last page rather than showing the empty
  state, which would wrongly blame the filters.
- **Filtering works without JavaScript.** The sidebar and hero search are plain
  GET forms; the only client component on the listings page is the sort select,
  which navigates rather than holding state.
- **The hero budget select emits a `budget` range param** (`"15000-30000"`,
  `"60000-"`), because two of the design's five options ("Any Budget" and
  "Ksh 60,000+") cannot both be expressed as a max.
- **A listing card's price never wraps**; a long highlight chip ellipsizes
  instead. Letting either wrap gave cards in the same row different heights.
- **`brand-strong` (#8A6A00) is the readable yellow** for text on light
  grounds. The brand fill fails contrast as a text colour, and the rule stands
  that yellow is a fill only.
- **Registration creates an owner with an UNSUBMITTED verification**, so the
  account exists but cannot publish (rule 1). Owners land on
  `/dashboard/verification`, tenants on `/listings`.
- **Screen 05's market-intelligence panel and adjacent-zone chips were not
  built.** They need per-suburb inventory the seed has no notion of. The empty
  state carries the real derived average rent for the estate instead, plus
  nearby listings from real rows.
