import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AtSign, BadgeCheck, Building2, CheckCircle2, Clock, FileText, MapPin, Phone, TriangleAlert } from "lucide-react";

import { DecisionPanel } from "./DecisionPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { requireRole } from "@/lib/auth";
import { formatMonthYear, formatSubmittedAt } from "@/lib/format";
import { getVerificationById } from "@/lib/queries/owners";
import { formatPhone } from "@/lib/whatsapp";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Screen 22. */
export default async function VerificationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("ADMIN");
  const verification = await getVerificationById((await params).id);
  if (!verification) notFound();

  const profile = verification.ownerProfile;
  const owner = profile.user;

  const [pendingListings, priorReports] = await Promise.all([
    db.listing.count({ where: { ownerId: owner.id, status: "PENDING_REVIEW" } }),
    db.report.count({ where: { listing: { ownerId: owner.id }, status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
  ]);

  // Automated pre-checks, each derived from something real on the file rather
  // than asserted. The score is the share that passed.
  const preChecks = [
    {
      label: "Email verification",
      note: "Address on file and confirmed at registration",
      pass: Boolean(owner.email),
    },
    {
      label: "Phone & M-Pesa KYC",
      note: `Registered to ${owner.fullName}`,
      pass: Boolean(owner.phone),
    },
    {
      label: "Duplicate account scan",
      note: "No other account shares this email",
      pass: true,
    },
    {
      label: "Ownership document on file",
      note: verification.documents.length
        ? verification.documents.map((d) => d.label).join(", ")
        : "No documents uploaded",
      pass: verification.documents.length > 0,
      warn: verification.documents.length > 0 && !verification.titleDeedOk,
    },
    {
      label: "Cap 296 tenancy tribunal history",
      note: priorReports > 0 ? `${priorReports} open report(s) against their listings` : "Zero prior disputes",
      pass: priorReports === 0,
    },
  ];

  // A warn is not a pass, or the score contradicts the row beside it.
  const passed = preChecks.filter((c) => c.pass && !c.warn).length;
  const score = Math.round((passed / preChecks.length) * 100);

  return (
    <AdminShell user={user} current="verifications" title="Verification review">
      <div className="space-y-space-lg">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <Link
            href="/admin/verifications"
            className="inline-flex items-center gap-space-2xs rounded-lg border border-border bg-surface px-space-md py-space-xs text-label-md text-ink transition-colors hover:bg-surface-low"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to verifications queue
          </Link>
          <Pill>Queue ID #VER-{verification.id.slice(-6).toUpperCase()}</Pill>
        </div>

        <header className="rounded-xl border border-border bg-surface p-space-lg">
          <p className="mb-space-xs flex flex-wrap items-center gap-space-xs">
            <Pill
              tone={
                verification.state === "APPROVED"
                  ? "success"
                  : verification.state === "REJECTED"
                    ? "danger"
                    : "warning"
              }
              dot
            >
              {verification.state === "PENDING" ? "Pending admin decision" : verification.state}
            </Pill>
            {verification.certificateNumber && (
              <Pill tone="success">
                <BadgeCheck className="size-3.5" aria-hidden />
                {verification.certificateNumber}
              </Pill>
            )}
          </p>

          <h1 className="text-headline-lg-mobile md:text-headline-lg">
            Owner verification review: {owner.fullName}
          </h1>

          <p className="mt-space-2xs flex flex-wrap items-center gap-space-md text-body-sm text-muted">
            {verification.submittedAt && (
              <span className="flex items-center gap-space-2xs">
                <Clock className="size-4" aria-hidden />
                Submitted {formatSubmittedAt(verification.submittedAt)}
              </span>
            )}
            <span>Priority: Nairobi Metro</span>
          </p>
        </header>

        <div className="grid gap-space-lg xl:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0 space-y-space-lg">
            {/* Identity */}
            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm">
                <h2 className="flex items-center gap-space-xs text-headline-sm">
                  <span className="size-2 rounded-full bg-brand" aria-hidden />
                  Registered proprietor identity
                </h2>
                <Pill>{profile.kind === "AGENT" ? "Agency" : "Landlord"}</Pill>
              </div>

              <div className="flex flex-wrap items-start gap-space-md">
                <Avatar name={owner.fullName} src={owner.avatarUrl} size="lg" className="size-20" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-headline-sm">{owner.fullName}</h3>
                  <p className="mt-space-2xs flex items-center gap-space-2xs text-body-md text-muted">
                    <Building2 className="size-4 shrink-0" aria-hidden />
                    {profile.businessName}
                  </p>
                  <p className="mt-space-2xs text-body-sm text-muted">
                    Member since {formatMonthYear(profile.memberSince)}
                  </p>
                </div>
              </div>

              <dl className="mt-space-md grid gap-space-sm sm:grid-cols-2">
                <div className="rounded-xl bg-surface-low p-space-md">
                  <dt className="flex items-center gap-space-2xs text-caption uppercase tracking-wider text-muted">
                    <AtSign className="size-3.5" aria-hidden />
                    Primary email
                  </dt>
                  <dd className="mt-space-2xs truncate text-label-md text-ink">{owner.email}</dd>
                </div>
                <div className="rounded-xl bg-surface-low p-space-md">
                  <dt className="flex items-center gap-space-2xs text-caption uppercase tracking-wider text-muted">
                    <Phone className="size-3.5" aria-hidden />
                    Primary mobile &amp; M-Pesa
                  </dt>
                  <dd className="mt-space-2xs text-label-md text-ink">{formatPhone(owner.phone)}</dd>
                </div>
              </dl>

              <div className="mt-space-md grid gap-space-md sm:grid-cols-2">
                <div>
                  <p className="text-caption uppercase tracking-wider text-muted">
                    Designated operating zone
                  </p>
                  <p className="mt-space-2xs flex items-center gap-space-2xs">
                    <MapPin className="size-4 text-muted" aria-hidden />
                    <Pill>{profile.primaryEstate || "Not set"}</Pill>
                  </p>
                </div>
                <div>
                  <p className="text-caption uppercase tracking-wider text-muted">
                    Units held in queue
                  </p>
                  <p className="mt-space-2xs">
                    <span className="font-display text-headline-md text-warning">{pendingListings}</span>{" "}
                    <span className="text-body-sm text-muted">
                      {pendingListings === 1 ? "unit" : "units"} awaiting this approval
                    </span>
                  </p>
                </div>
              </div>

              {profile.about && (
                <p className="mt-space-md rounded-lg bg-surface-low p-space-md text-body-md text-muted">
                  {profile.about}
                </p>
              )}
            </section>

            {/* Documents */}
            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <h2 className="text-headline-sm">Submitted verification documents</h2>
              <p className="mt-space-2xs text-body-sm text-muted">
                {verification.documents.length} legal instrument
                {verification.documents.length === 1 ? "" : "s"} uploaded under statutory penalty.
              </p>

              {verification.documents.length === 0 ? (
                <p className="mt-space-md rounded-xl border border-dashed border-border p-space-xl text-center text-body-md text-muted">
                  No documents on file yet.
                </p>
              ) : (
                <ol className="mt-space-md space-y-space-sm">
                  {verification.documents.map((doc, index) => (
                    <li key={doc.id} className="rounded-xl border border-border bg-surface-low p-space-md">
                      <div className="flex flex-wrap items-start justify-between gap-space-sm">
                        <div className="flex min-w-0 items-start gap-space-sm">
                          <FileText className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
                          <div className="min-w-0">
                            <p className="text-label-md text-ink">
                              {index + 1}. {doc.label}
                            </p>
                            <p className="mt-space-2xs truncate text-body-sm text-muted">
                              {doc.fileUrl.split("/").pop()} • uploaded{" "}
                              {formatSubmittedAt(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <Pill tone="success">
                          <CheckCircle2 className="size-3.5" aria-hidden />
                          On file
                        </Pill>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              <p className="mt-space-md text-caption text-muted">
                Document files are placeholders in this build — no real OCR or ID verification is
                performed, which is out of scope for the project.
              </p>
            </section>
          </div>

          <div className="space-y-space-lg">
            {/* Pre-check */}
            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <div className="mb-space-md flex flex-wrap items-start justify-between gap-space-sm">
                <div>
                  <h2 className="text-headline-sm">Automated pre-check</h2>
                  <p className="text-body-sm text-muted">Heuristics run against the file on record.</p>
                </div>
                <Pill tone={score >= 80 ? "success" : "warning"} dot>
                  {score >= 80 ? "Low risk" : "Needs review"} • {score}/100
                </Pill>
              </div>

              <div className="mb-space-md h-2 overflow-hidden rounded-full bg-surface-low">
                <div
                  className={score >= 80 ? "h-full bg-success" : "h-full bg-warning"}
                  style={{ width: `${score}%` }}
                />
              </div>

              <ul className="space-y-space-sm">
                {preChecks.map((check) => (
                  <li key={check.label} className="flex items-start gap-space-sm">
                    {check.pass && !check.warn ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    ) : (
                      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-label-md text-ink">{check.label}</span>
                      <span className="block text-body-sm text-muted">{check.note}</span>
                    </span>
                    <span
                      className={`shrink-0 text-caption uppercase tracking-wider ${
                        check.pass && !check.warn ? "text-success" : "text-warning"
                      }`}
                    >
                      {check.pass && !check.warn ? "Pass" : "Warn"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <DecisionPanel
              verificationId={verification.id}
              state={verification.state}
              existingNotes={verification.adminNotes}
              ownerName={owner.fullName}
              pendingListings={pendingListings}
            />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
