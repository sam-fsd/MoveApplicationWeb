# Demo script

A twelve-minute walkthrough that lands the argument: **MoveApp is a trust layer,
not another listings site.** The whole demo builds to one moment — an admin
approves an owner, and that owner can suddenly publish.

## Before you start

```bash
npm run db:seed     # resets to a known state — do this right before presenting
npm run dev
```

Open two browser windows side by side if you can: one for the tenant, one for
the portal and console. Otherwise use `/dev/as/<email>` links to switch roles
instantly without typing passwords.

| Role | Sign in as | Jump link |
|---|---|---|
| Tenant | `tenant@moveapp.ke` | `/dev/as/tenant@moveapp.ke?next=/listings` |
| Owner (verified) | `owner@moveapp.ke` | `/dev/as/owner@moveapp.ke?next=/dashboard` |
| Owner (unverified) | `grace@kilimaniheights.co.ke` | `/dev/as/grace@kilimaniheights.co.ke?next=/dashboard` |
| Admin | `admin@moveapp.ke` | `/dev/as/admin@moveapp.ke?next=/admin` |

Password for all of them: `moveapp123`.

---

## 1 · The problem (1 min) — `/`

Start signed out on the landing page.

> "In Nairobi, up to 60% of online rental ads are fake brokers who demand a
> Ksh 1,000 viewing fee and then disappear. Every feature you're about to see
> exists to make that impossible."

Point at the hero, then scroll to **Why MoveApp is different**. Note the three
pillars — admin vetting, direct contact, one-click reporting — and the trust
guarantee panel beside them.

## 2 · Tenant search (2 min) — `/listings`

Click **Find Houses**.

- Pick **Westlands** from the estate pills → the URL becomes
  `?estate=Westlands` and the result count updates.
- Tick **2 Beds** and **3 Beds**, then **Borehole Water 24/7**, and press
  **Apply Filters**. The active-filter chips appear across the top.
- **Copy the URL and paste it in a new tab.** Same results. Every filter lives
  in the address bar, so a search is shareable.
- Change **Sort by** to *Price: highest to lowest*.
- Then break it: set the estate to **Ruaka** with a max of Ksh 20,000. The empty
  state explains what Ruaka actually costs and offers a price alert instead of a
  dead end.

## 3 · Listing detail and the contact gate (2 min)

Open **2 Bedroom Apartment in Westlands**.

- Gallery, spec cards, the utility strip — borehole, KPLC token, fibre. "These
  three decide a Nairobi let, so they get their own row."
- Scroll to the map: **"Approximate location shown for privacy."** The exact
  address is withheld until the tenant confirms an enquiry.
- **The contact details are not on the page.** Press **Show contact**.
  - The modal reveals the phone and email, WhatsApp first.
  - Every time, it carries the safety advisory: never send money before viewing
    in person.
  - Press **WhatsApp** — it opens a real `wa.me` link with a message that names
    the listing and states the zero-fee policy, so the first line of the thread
    is already on the record.
- Tap the **heart**. It fills instantly. Go to **Saved homes** — it's there,
  alongside two price alerts showing live match counts.

## 4 · Reporting (1 min)

Back on the listing, press **Report this listing**.

- Six reasons. Choose **"Owner asked for money upfront"** — flagged as a
  critical safety violation.
- Add a detail: *"The caretaker asked for Ksh 2,500 as a gate pass on
  WhatsApp."*
- Submit. You get a reference number and "under admin review".

> "Severity isn't chosen by the reporter. A demanded viewing fee is always
> critical — that's decided by the reason, in code."

**Leave this report open. You'll resolve it as the admin in step 7.**

## 5 · The publish gate (2 min) — the heart of the demo

Sign in as the **unverified** owner, `grace@kilimaniheights.co.ke`.

- The dashboard greets her but carries an amber banner: *your listings cannot go
  live yet*.
- Click **Add Listing**. You are redirected to `/dashboard/verification` — the
  document checklist, showing 1 of 5 cleared.

> "She cannot publish. Not 'the button is hidden' — the route redirects, the
> server action refuses, and even a verified owner's new listing is written as
> pending review. Three separate gates, because this is the one thing the whole
> product rests on."

Now switch to the **verified** owner, `owner@moveapp.ke`:

- *Habari, Samuel!* — 4 stat cards with real sparklines, the listings table with
  status tabs, the verification panel with compliance certificate
  **#MP-NBI-2025-084**, and recent enquiries with WhatsApp reply buttons.
- Open **2 Bedroom Apartment in Westlands** from the table → the views chart
  over 30 days, tenant enquiries, the tenant card preview, and a listing health
  score.

## 6 · Creating a listing (1 min)

**Add Listing** → the five-step wizard.

- Step 1: title, type, bedroom and bathroom steppers, furnishing, description,
  amenities.
- Step 2: drag in two or three photos. Set a cover.
- Skip to **Review** and submit.
- It lands on the manage page as **Pending review** — *not* live.

> "Even a verified landlord can't publish. Only an admin can."

## 7 · The ops console (3 min) — `/admin`

Sign in as `admin@moveapp.ke`.

- Six stat cards, the pending verification queue, recent reports by severity,
  and the 12-week intake chart.
- **Reports** → your report from step 4 is at the top of the queue, marked
  critical. Open it. The drawer shows the unit, the complainant, their exact
  words, and the policy scan.
- Press **Uphold & take the listing down**.
  - **Now go back to the tenant tab and refresh `/listings`.** The listing is
    gone from search, and its detail page 404s.
- **Owner verifications** → open **Grace Muthoni Wambui**. Automated pre-checks,
  her documents, the decision panel.
- Add a note and press **Approve owner & issue verification badge**.

**The payoff:** switch back to Grace's dashboard and press **Add Listing**. It
opens. The certificate is issued, the badge is live, and the gate is down.

> "That's the whole product in one action. The badge means something because
> exactly one person can grant it."

## 8 · Close (30 sec)

> "Every listing here comes from an owner whose title deed and ID a person
> checked. Tenants reach landlords directly on WhatsApp with no fee. Anyone can
> report a listing, and a critical report takes a unit down in one click.
> That's the whole thesis: verification is the product."

---

## If something goes wrong

- **Data looks odd after a rehearsal** — `npm run db:seed` resets everything in
  a couple of seconds. The seed is deterministic, so it comes back identical.
- **A page hangs** — the dev server recompiles routes on first visit. Click
  through the demo path once before you present.
- **You lose your place in the roles** — the `/dev/as/<email>` links above jump
  straight in.
- **Photos you uploaded during a rehearsal** live in `public/uploads/` and are
  gitignored; delete them if you want a clean slate.

## Numbers worth knowing if asked

- 10 owners (6 verified, 4 pending), 12 tenants, 1 admin.
- 35 listings across 11 Nairobi estates, from Ksh 8,500 to Ksh 92,000.
- 24 enquiries, 14 reports across all four reasons and three severities.
- The admin console's totals are real and derived. The only seeded aggregate is
  the 12-week intake chart, which is platform-scale history the demo database
  cannot produce — everything a demo action changes is counted from real rows.
