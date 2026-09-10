"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2, Flag } from "lucide-react";
import { submitReport, type ActionResult } from "@/app/listings/[id]/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Pill } from "@/components/ui/Pill";
import { REPORT_DETAILS_MAX, REPORT_REASON_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/cn";

/**
 * Screen 08 — the report form and its confirmation state. Anyone can report a
 * listing; severity is decided by the reason, not by the reporter.
 */
export function ReportModal({
  open,
  onClose,
  listingId,
  listingTitle,
  listingLocation,
  signedIn,
}: {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  listingLocation: string;
  signedIn: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(submitReport, {
    ok: false,
  });
  const [details, setDetails] = useState("");

  const submitted = state.ok && state.reference;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={
        <span className="flex size-9 items-center justify-center rounded-lg bg-danger-bg text-danger">
          <Flag className="size-4" aria-hidden />
        </span>
      }
      title={submitted ? "Report submitted" : "Report this listing"}
      subtitle={`${listingTitle} • ${listingLocation}`}
      footer={
        submitted ? (
          <Button onClick={onClose}>Done — back to listing</Button>
        ) : signedIn ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {/* The form lives in the modal body, so the footer button targets it by id. */}
            <Button type="submit" form="report-form" variant="danger" disabled={pending}>
              <Flag />
              {pending ? "Submitting…" : "Submit report"}
            </Button>
          </>
        ) : (
          <Link href={`/login?next=/listings/${listingId}`}>
            <Button>Sign in to report</Button>
          </Link>
        )
      }
    >
      {submitted ? (
        <div className="space-y-space-md">
          <p className="flex items-start gap-space-sm rounded-xl bg-success-bg p-space-md text-body-md text-success">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
            Thank you for keeping MoveApp safe. Our admin team reviews all reports within 24 hours
            and will take immediate action if the terms are violated.
          </p>
          <dl className="divide-y divide-border rounded-xl border border-border">
            {[
              ["Reference number", state.reference],
              ["Listing", listingTitle],
              ["Status", "Under admin review"],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-space-sm p-space-sm">
                <dt className="text-body-md text-muted">{label}</dt>
                <dd className="text-label-md text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : !signedIn ? (
        <p className="text-body-md text-muted">
          Reports are tied to an account so our ops desk can follow up. Sign in and we will bring
          you straight back to this listing.
        </p>
      ) : (
        <form id="report-form" action={formAction} className="space-y-space-md">
          <input type="hidden" name="listingId" value={listingId} />

          <fieldset>
            <legend className="mb-space-sm flex w-full items-baseline justify-between gap-space-sm">
              <span className="text-label-md text-ink">
                Reason for reporting <span className="text-danger">*</span>
              </span>
              <span className="text-caption text-muted">Select one option</span>
            </legend>

            <div className="space-y-space-xs">
              {REPORT_REASON_OPTIONS.map((option) => (
                <label
                  key={option.reason}
                  className={cn(
                    "flex cursor-pointer items-start gap-space-sm rounded-xl border p-space-sm transition-colors",
                    "has-[:checked]:border-ink/40 has-[:checked]:bg-surface-low",
                    "critical" in option && option.critical
                      ? "border-danger/30 bg-danger-bg/40"
                      : "border-border",
                  )}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option.reason}
                    required
                    className="mt-0.5 size-4 shrink-0 accent-ink"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-space-xs text-label-md text-ink">
                      {option.label}
                      {"critical" in option && option.critical && (
                        <Pill tone="danger">Critical safety violation</Pill>
                      )}
                    </span>
                    <span className="mt-space-2xs block text-body-sm text-muted">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <span className="mb-space-2xs flex items-baseline justify-between gap-space-sm">
              <label htmlFor="details" className="text-label-md text-ink">
                Additional details <span className="text-muted">(optional)</span>
              </label>
              <span className="text-caption text-muted">
                {details.length} / {REPORT_DETAILS_MAX} characters
              </span>
            </span>
            <textarea
              id="details"
              name="details"
              rows={4}
              maxLength={REPORT_DETAILS_MAX}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="What happened? Dates, amounts, and how you were contacted all help our ops desk."
              className="w-full rounded-lg border border-border bg-surface px-space-sm py-space-xs text-body-md text-ink placeholder:text-muted-subtle focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>

          {state.error && (
            <p role="alert" className="rounded-lg bg-danger-bg px-space-sm py-space-xs text-body-sm text-danger">
              {state.error}
            </p>
          )}
        </form>
      )}
    </Modal>
  );
}
