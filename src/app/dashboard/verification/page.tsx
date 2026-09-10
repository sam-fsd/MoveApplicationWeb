import Link from "next/link";
import { AlertTriangle, BadgeCheck, ChevronRight, Clock, FileText, Phone, ShieldCheck, Upload } from "lucide-react";

import { OwnerShell } from "@/components/owner/OwnerShell";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { requireRole } from "@/lib/auth";
import { formatSubmittedAt } from "@/lib/format";
import { getOwnerVerification } from "@/lib/queries/owners";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verification status" };

const FAQ = [
  {
    q: "Why does MoveApp require property ownership verification?",
    a: "To eliminate phantom listings, rogue brokers, and viewing-fee extortion across Nairobi. By validating title deeds, county ground lease certificates, or formal agency management agreements, we can guarantee tenants they are transacting directly with legitimate landlords and authorised caretakers.",
  },
  {
    q: "How long does the verification audit take?",
    a: "The standard turnaround is 48 hours from submission. Files that need a Ministry of Lands cross-check can take longer; we notify you at each step.",
  },
  {
    q: "Can I create listings while my account is pending verification?",
    a: "No. Listings can only be created once your ownership documents are approved, and each new listing then enters review before it goes live. This is what makes the verified badge mean something to tenants.",
  },
  {
    q: "What documents qualify as proof of property ownership?",
    a: "A title deed in your name, a registered management mandate from the owner if you are an agent, or a county ground lease certificate. We also require your National ID and KRA PIN.",
  },
];

/** Screen 16. */
export default async function VerificationPage() {
  const user = await requireRole("OWNER");
  const verification = user.ownerProfile
    ? await getOwnerVerification(user.ownerProfile.id)
    : null;

  const state = verification?.state ?? "UNSUBMITTED";
  const approved = state === "APPROVED";

  const checks = [
    { key: "nationalIdOk", label: "Republic of Kenya National ID (front & back)", doc: "National ID" },
    { key: "kraPinOk", label: "KRA PIN certificate", doc: "KRA PIN" },
    { key: "titleDeedOk", label: "Title deed or registered management mandate", doc: "Title Deed" },
    { key: "inspectionOk", label: "Physical inspection", doc: null },
    { key: "feePledgeOk", label: "Zero middleman viewing-fee pledge", doc: null },
  ] as const;

  const cleared = checks.filter((c) => verification?.[c.key]).length;
  const progress = Math.round((cleared / checks.length) * 100);

  return (
    <OwnerShell user={user} current="profile">
      <div className="space-y-space-lg">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-2xs text-body-sm text-muted">
          <Link href="/dashboard" className="hover:text-ink">
            Dashboard
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">Landlord verification</span>
        </nav>

        <header className="flex flex-wrap items-start justify-between gap-space-md">
          <div className="max-w-2xl">
            <h1 className="text-headline-lg-mobile md:text-headline-lg">
              Account &amp; landlord verification
            </h1>
            <p className="mt-space-xs flex flex-wrap items-center gap-space-xs">
              {approved ? (
                <Pill tone="success" dot>
                  Approved
                </Pill>
              ) : state === "PENDING" ? (
                <Pill tone="warning" dot>
                  Review in progress
                </Pill>
              ) : (
                <Pill dot>Not submitted</Pill>
              )}
              {verification?.certificateNumber && <Pill>{verification.certificateNumber}</Pill>}
            </p>
            <p className="mt-space-sm text-body-md text-muted">
              MoveApp Kenya audits ownership documentation to protect tenants against fraudulent
              subleases, illegal middlemen, and unvetted caretakers, in compliance with the Landlord
              and Tenant Bill and Cap 296.
            </p>
          </div>
        </header>

        {/* Status banner */}
        <section
          className={`rounded-xl p-space-lg ${approved ? "bg-success-bg" : "bg-warning-bg"}`}
        >
          <div className="grid gap-space-lg lg:grid-cols-[1.6fr_1fr]">
            <div className="flex items-start gap-space-md">
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                  approved ? "bg-success text-white" : "bg-warning text-white"
                }`}
              >
                {approved ? <BadgeCheck className="size-6" /> : <Clock className="size-6" />}
              </span>
              <div>
                <h2 className="text-headline-sm">
                  {approved ? "Verification approved" : "Verification in progress"}
                </h2>
                <p className="mt-space-2xs text-body-md text-muted">
                  {verification?.submittedAt
                    ? `Submitted ${formatSubmittedAt(verification.submittedAt)} • 48 hours standard turnaround.`
                    : "Submit your ownership documents to start the audit."}
                </p>
                <p className="mt-space-sm text-body-sm text-ink">
                  {approved ? (
                    <>
                      <strong>You are live.</strong> Your listings appear across Nairobi discovery
                      grids, and every new listing still passes a quick review before publishing.
                    </>
                  ) : (
                    <>
                      <strong>Important:</strong> your units stay in private preview and go live
                      across Nairobi discovery the moment this check clears. Verified landlords see
                      substantially faster lease commitment.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-surface p-space-md">
              <p className="flex items-center justify-between gap-space-sm">
                <span className="text-caption uppercase tracking-wider text-muted">
                  Documents cleared
                </span>
                <span className={`text-label-md ${approved ? "text-success" : "text-warning"}`}>
                  {progress}% complete
                </span>
              </p>
              <div className="my-space-sm h-2 overflow-hidden rounded-full bg-surface-low">
                <div
                  className={approved ? "h-full bg-success" : "h-full bg-warning"}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="flex items-center gap-space-2xs text-body-sm text-muted">
                <Clock className="size-4" aria-hidden />
                {cleared} of {checks.length} cleared
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-space-lg lg:grid-cols-[1.6fr_1fr]">
          {/* Checklist */}
          <section className="rounded-xl border border-border bg-surface p-space-lg">
            <h2 className="text-headline-sm">Document submission checklist</h2>
            <p className="mt-space-2xs text-body-sm text-muted">
              All submitted deeds and credentials are cross-referenced with the Kenyan Integrated
              Population Registration System and the Lands registry.
            </p>

            <ul className="mt-space-md space-y-space-sm">
              {checks.map((check) => {
                const ok = Boolean(verification?.[check.key]);
                const document = check.doc
                  ? verification?.documents.find((d) => d.label.includes(check.doc!))
                  : undefined;

                return (
                  <li
                    key={check.key}
                    className={`rounded-xl border-l-4 bg-surface-low p-space-md ${
                      ok ? "border-success" : document ? "border-warning" : "border-danger"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-space-sm">
                      <div className="flex min-w-0 items-start gap-space-sm">
                        <FileText className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
                        <div className="min-w-0">
                          <p className="text-label-md text-ink">{check.label}</p>
                          {document ? (
                            <p className="mt-space-2xs truncate text-body-sm text-muted">
                              Submitted: {document.fileUrl.split("/").pop()}
                            </p>
                          ) : (
                            <p className="mt-space-2xs text-body-sm text-muted">
                              {check.doc ? "Not yet submitted." : "Carried out by a MoveApp field officer."}
                            </p>
                          )}
                        </div>
                      </div>

                      {ok ? (
                        <Pill tone="success">
                          <BadgeCheck className="size-3.5" aria-hidden />
                          Approved
                        </Pill>
                      ) : document ? (
                        <Pill tone="warning">In liaison check</Pill>
                      ) : (
                        <Pill tone="danger">
                          <AlertTriangle className="size-3.5" aria-hidden />
                          Action required
                        </Pill>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {verification?.adminNotes && (
              <p className="mt-space-md rounded-lg bg-surface-low p-space-md text-body-sm text-muted">
                <strong className="text-ink">Reviewer notes:</strong> {verification.adminNotes}
              </p>
            )}
          </section>

          {/* Upload + concierge */}
          <div className="space-y-space-lg">
            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <h2 className="flex items-center gap-space-xs text-headline-sm">
                <Upload className="size-5" aria-hidden />
                Upload a missing document
              </h2>
              <p className="mt-space-2xs text-body-sm text-muted">
                Append a document to your ongoing compliance dossier.
              </p>

              <div className="mt-space-md flex flex-col items-center gap-space-sm rounded-xl border-2 border-dashed border-border p-space-xl text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand text-ink">
                  <Upload className="size-5" aria-hidden />
                </span>
                <span className="text-label-md text-ink">Document upload opens after review</span>
                <span className="text-body-sm text-muted">
                  While an audit is in progress, send replacements to the verification desk so the
                  reviewer sees them against your open file.
                </span>
              </div>

              <p className="mt-space-sm flex items-start gap-space-xs rounded-lg bg-surface-low p-space-sm text-body-sm text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                Documents are encrypted at rest and discarded after legal verification.
              </p>
            </section>

            <section className="rounded-xl border border-border bg-surface p-space-lg">
              <h2 className="flex flex-wrap items-center gap-space-xs text-headline-sm">
                Landlord priority concierge
                <Pill tone="success" dot>
                  Nairobi desk active
                </Pill>
              </h2>
              <p className="mt-space-2xs text-body-sm text-muted">
                Need an on-site property valuation or a physical inspection in Westlands, Kilimani,
                or Parklands?
              </p>
              <p className="mt-space-md flex items-center gap-space-sm rounded-lg bg-surface-low p-space-sm">
                <Phone className="size-4 shrink-0 text-muted" aria-hidden />
                <span>
                  <span className="block text-label-md text-ink">+254 (0) 709 112 000</span>
                  <span className="block text-body-sm text-muted">Toll-free, Mon–Sat</span>
                </span>
              </p>
            </section>
          </div>
        </div>

        {/* FAQ */}
        <section className="rounded-xl border border-border bg-surface p-space-lg">
          <h2 className="text-headline-sm">Frequently asked questions about verification</h2>
          <p className="mt-space-2xs text-body-sm text-muted">
            How MoveApp keeps Nairobi rental search fraud-free.
          </p>

          <div className="mt-space-md space-y-space-xs">
            {FAQ.map((entry, index) => (
              <details
                key={entry.q}
                open={index === 0}
                className="group rounded-xl border border-border bg-surface-low p-space-md"
              >
                <summary className="flex cursor-pointer list-none items-center gap-space-sm text-label-md text-ink">
                  <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  {entry.q}
                </summary>
                <p className="mt-space-sm text-body-md text-muted">{entry.a}</p>
              </details>
            ))}
          </div>
        </section>

        {approved && (
          <p className="text-center">
            <Link href="/dashboard/listings/new">
              <Button size="lg">Add your next listing</Button>
            </Link>
          </p>
        )}
      </div>
    </OwnerShell>
  );
}
