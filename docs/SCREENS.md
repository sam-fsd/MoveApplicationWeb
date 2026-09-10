# Screen Index

Every screen in `docs/screens/` mapped to its route, role, and the notable
details to reproduce. Open the PNG before building the route.

| # | File | Route | Role | Notes |
|---|---|---|---|---|
| 01 | `01_landing_home.png` | `/` | public | Hero with overlaid search (estate / type / budget), featured-listing card floating on the hero photo, popular-estate pill row, 6-card featured grid, 3-step explainer, trust section, split tenant/owner CTA band (owner side is the ink panel), 4-column footer |
| 02 | `02_login.png` | `/login` | public | Email + password, role-agnostic; redirect by role after sign-in |
| 03 | `03_sign_up.png` | `/register` | public | Tenant / Owner toggle; owner branch collects business name and warns about admin review |
| 04 | `04_search_results_westlands.png` | `/listings` | tenant | Filter sidebar (price slider, bedrooms, type, amenities), result count, sort dropdown, card grid, map toggle, pagination. All filters must be URL search params |
| 05 | `05_search_no_results_ruaka.png` | `/listings` (empty) | tenant | Same shell, empty state with clear-filters and price-alert actions |
| 06 | `06_property_details_2br_westlands.png` | `/listings/[id]` | tenant | Gallery (1 large + 4 thumbs + "View all 14 photos"), spec cards row, utility strip (borehole / KPLC token / fibre), About, Amenities grid, static map with approximate-location disclaimer, sticky owner card, similar listings |
| 07 | `07_property_details_contact_owner_modal.png` | modal on `/listings/[id]` | tenant | Reveals WhatsApp + call + email; carries the never-pay-viewing-fees notice |
| 08 | `08_report_listing_confirmation_modal.png` | modal | tenant | Reason radios, details textarea, submitted confirmation state |
| 09 | `09_saved_listings_price_alerts.png` | `/saved` | tenant | Saved grid + price-alert rows with toggles |
| 10 | `10_saved_listings_empty_state.png` | `/saved` (empty) | tenant | |
| 11 | `11_notifications_dropdown.png` | global dropdown | all | Grouped items, unread dots, mark-all-read |
| 12 | `12_tenant_account_settings.png` | `/account` | tenant | Sub-nav, avatar upload, preferred estates as chips, budget range |
| 13 | `13_owner_profile_kamau_properties.png` | `/owners/[id]` | public | Public owner profile: stats, about, verification, their listings |
| 14 | `14_edit_owner_profile.png` | `/dashboard/profile` | owner | Form + live preview of the public card |
| 15 | `15_owner_dashboard.png` | `/dashboard` | owner | Ink sidebar, "Habari, Samuel!", 4 stat cards with sparklines, listings table with status tabs (All / Published / Pending Review / Rented Out), verification panel with compliance certificate number, recent enquiries with WhatsApp reply buttons |
| 16 | `16_owner_verification_pending.png` | `/dashboard/verification` | owner | Pending banner, document checklist, upload dropzone, FAQ |
| 17 | `17_create_listing_step1_details.png` | `/dashboard/listings/new` | owner | Step 1: title, type, beds/baths, furnished, amenities, description |
| 18 | `18_create_listing_step2_photos.png` | `/dashboard/listings/new` | owner | Step 2: dropzone, thumbnails, cover selection, upload progress |
| 19 | `19_manage_listing_2bed_modern_flat.png` | `/dashboard/listings/[id]` | owner | Stats, views chart, enquiries list, tenant-view preview |
| 20 | `20_admin_dashboard_overview.png` | `/admin` | admin | Ops console: 6 stat cards, pending verifications list, recent reports with severity, weekly stacked bar chart of published/review/rejected |
| 21 | `21_admin_listings_management.png` | `/admin/listings` | admin | Dense table, filters, bulk actions |
| 22 | `22_admin_owner_verification_review.png` | `/admin/verifications/[id]` | admin | Document viewer, automated-check summary, approve / reject / request-info |
| 23 | `23_admin_reports_moderation.png` | `/admin/reports` | admin | Status tabs, table, detail drawer with moderation actions |
| 24 | `24_404_page.png` | `not-found.tsx` | public | |

## Assets

`docs/screens/asset_*.png` are the extracted brand and content assets. Copy them
into `public/`:

- `asset_logo.png` → `public/logo.png`
- `asset_avatar_owner_headshot.png`, `asset_avatar_tenant_portrait.png` →
  `public/seed/avatars/`
- `asset_photo_apartment_*.png` → `public/seed/listings/`
- `asset_illustration_404_house_missing_door.png`,
  `asset_illustration_empty_search_results_map.png` → `public/illustrations/`

Seed listings will need more photos than these three. Reuse them across seeded
listings rather than pulling from the internet — the demo must work offline.
