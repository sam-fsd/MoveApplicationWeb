import Link from "next/link";
import { notFound } from "next/navigation";
import { RoleSwitcher } from "@/components/dev/RoleSwitcher";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { ListingStatusPill } from "@/components/ui/StatusPill";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { getCurrentUser } from "@/lib/auth";
import { formatCount, formatKes, formatRelative } from "@/lib/format";
import { findListings } from "@/lib/queries/listings";
import { findPendingVerifications, getAdminStats } from "@/lib/queries/owners";
import { countReportsByStatus, findReports } from "@/lib/queries/reports";
import { countUnreadNotifications, findEnquiriesForOwner } from "@/lib/queries/notifications";
import { db } from "@/lib/db";

export const metadata = { title: "Dev Console" };
export const dynamic = "force-dynamic";

/**
 * Dev-only smoke test for Phase 1: it signs in as each seeded role and renders
 * one row from every query module, so a broken query shows up here rather than
 * three phases later. Not part of the product.
 */
export default async function DevPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const user = await getCurrentUser();
  const [stats, page, pending, reports, reportCounts] = await Promise.all([
    getAdminStats(),
    findListings({ sort: "price-desc", perPage: 4 }),
    findPendingVerifications(4),
    findReports({ perPage: 4 }),
    countReportsByStatus(),
  ]);

  const owner = await db.user.findUnique({
    where: { email: "owner@moveapp.ke" },
    select: { id: true },
  });
  const enquiries = owner ? await findEnquiriesForOwner(owner.id, 4) : [];
  const unread = user ? await countUnreadNotifications(user.id) : 0;

  return (
    <main className="mx-auto max-w-container-max space-y-space-lg px-gutter-desktop py-space-2xl">
      <header className="space-y-space-2xs">
        <p className="text-label-sm uppercase tracking-wider text-muted">Dev only</p>
        <h1 className="text-headline-xl">Dev Console</h1>
        <p className="max-w-2xl text-body-lg text-muted">
          Phase 1 smoke test. Switch roles below, then check that each panel has real rows in it.
          Sign in with a password instead at <Link href="/login" className="underline">/login</Link> —
          every seeded account uses <code className="rounded bg-surface-low px-1">moveapp123</code>.
        </p>
      </header>

      <RoleSwitcher />

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          {user && <Pill tone="brand">{user.role}</Pill>}
        </CardHeader>
        <CardBody className="text-body-md text-muted">
          {user ? (
            <ul className="space-y-space-2xs">
              <li>
                <strong className="text-ink">{user.fullName}</strong> · {user.email} · {user.phone}
              </li>
              <li>Unread notifications: {unread}</li>
              {user.ownerProfile && (
                <li className="flex flex-wrap items-center gap-space-xs">
                  {user.ownerProfile.businessName}
                  <VerifiedBadge
                    kind={user.ownerProfile.kind}
                    label={user.ownerProfile.badgeLabel}
                  />
                  <Pill tone={user.ownerProfile.verification?.state === "APPROVED" ? "success" : "warning"} dot>
                    {user.ownerProfile.verification?.state}
                  </Pill>
                  {user.ownerProfile.verification?.certificateNumber && (
                    <span>{user.ownerProfile.verification.certificateNumber}</span>
                  )}
                </li>
              )}
            </ul>
          ) : (
            <p>Signed out. Pick a role above.</p>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-space-md lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform stats</CardTitle>
            <Pill>getAdminStats()</Pill>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-2 gap-space-sm text-body-md sm:grid-cols-4">
              {[
                ["Tenants", stats.tenants],
                ["Owners", stats.owners],
                ["Verified", stats.verifiedOwners],
                ["Pending audit", stats.pendingAudit],
                ["Active listings", stats.activeListings],
                ["Open reports", stats.openReports],
                ["Critical", stats.criticalReports],
                ["New this week", stats.newThisWeek],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-caption uppercase tracking-wider text-muted">{label}</dt>
                  <dd className="font-display text-headline-md">{formatCount(value as number)}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most expensive listings</CardTitle>
            <Pill>{page.total} published</Pill>
          </CardHeader>
          <CardBody>
            <ul className="space-y-space-sm">
              {page.listings.map((listing) => (
                <li key={listing.id} className="flex flex-wrap items-baseline justify-between gap-space-xs">
                  <span className="min-w-0 flex-1 truncate text-body-md text-ink">{listing.title}</span>
                  <span className="font-display text-price-listing">{formatKes(listing.rentKes)}</span>
                  <span className="w-full text-body-sm text-muted">
                    {listing.estate} · {listing.owner.ownerProfile?.businessName} · {listing.viewCount} views
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending verifications</CardTitle>
            <Pill tone="warning">{pending.length}</Pill>
          </CardHeader>
          <CardBody>
            <ul className="space-y-space-sm">
              {pending.map((verification) => (
                <li key={verification.id}>
                  <p className="text-body-md text-ink">
                    {verification.ownerProfile.user.fullName} · {verification.ownerProfile.businessName}
                  </p>
                  <p className="text-body-sm text-muted">
                    {verification.ownerProfile.primaryEstate} ·{" "}
                    {verification.submittedAt && formatRelative(verification.submittedAt)} ·{" "}
                    {verification.documents.map((d) => d.label).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports queue</CardTitle>
            <Pill tone="danger">
              {reportCounts.OPEN} open · {reportCounts.all} total
            </Pill>
          </CardHeader>
          <CardBody>
            <ul className="space-y-space-sm">
              {reports.reports.map((report) => (
                <li key={report.id}>
                  <p className="text-body-md text-ink">{report.reason}</p>
                  <p className="text-body-sm text-muted">
                    {report.listing.title} · by {report.reporter.fullName} ·{" "}
                    {formatRelative(report.createdAt)} · {report.severity} · {report.status}
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent enquiries for owner@moveapp.ke</CardTitle>
            <Pill>{enquiries.length}</Pill>
          </CardHeader>
          <CardBody>
            <ul className="space-y-space-sm">
              {enquiries.map((enquiry) => (
                <li key={enquiry.id} className="flex flex-wrap items-baseline gap-space-xs">
                  <span className="text-label-md">{enquiry.tenant.fullName}</span>
                  <span className="text-body-sm text-muted">
                    on {enquiry.listing.title} · {formatRelative(enquiry.createdAt)}
                    {enquiry.readAt ? "" : " · unread"}
                  </span>
                  <span className="w-full text-body-md text-muted">“{enquiry.message}”</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing statuses in the seed</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-space-sm">
          <ListingStatusPill status="PUBLISHED" />
          <ListingStatusPill status="PENDING_REVIEW" />
          <ListingStatusPill status="RENTED_OUT" />
          <ListingStatusPill status="REJECTED" />
        </CardBody>
      </Card>
    </main>
  );
}
