"use client";

import { useActionState, useState } from "react";
import { BadgeCheck, Info, XCircle } from "lucide-react";

import { approveVerification, rejectVerification } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import type { ActionResult } from "@/app/listings/[id]/actions";

const QUICK_TAGS = [
  "IPRS match confirmed.",
  "Title deed cross-referenced with the Lands registry.",
  "Clean rent book — no prior tribunal disputes.",
  "Zero-viewing-fee pledge signed.",
];

/**
 * Screen 22's Adjudication & Verification Decision panel. Approve is the
 * single action in the whole product that unblocks an owner's publishing.
 */
export function DecisionPanel({
  verificationId,
  state,
  existingNotes,
  ownerName,
  pendingListings,
}: {
  verificationId: string;
  state: string;
  existingNotes: string | null;
  ownerName: string;
  pendingListings: number;
}) {
  const [approveState, approveAction, approving] = useActionState<ActionResult, FormData>(
    approveVerification,
    { ok: false },
  );
  const [rejectState, rejectAction, rejecting] = useActionState<ActionResult, FormData>(
    rejectVerification,
    { ok: false },
  );
  const [notes, setNotes] = useState(existingNotes ?? "");

  const decided = state === "APPROVED" || state === "REJECTED";

  return (
    <section className="rounded-xl border border-border bg-surface p-space-lg">
      <h2 className="text-headline-sm">Adjudication &amp; verification decision</h2>
      <p className="mt-space-2xs text-body-sm text-muted">
        Your determination notifies {ownerName} immediately
        {pendingListings > 0 && ` and unlocks ${pendingListings} pending listing${pendingListings === 1 ? "" : "s"}`}.
      </p>

      <div className="mt-space-md">
        <label htmlFor="notes" className="mb-space-2xs block text-label-md text-ink">
          Internal audit notes <span className="text-muted">(permanent record)</span>
        </label>
        <textarea
          id="notes"
          rows={5}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={decided}
          placeholder="What did you verify, and against which registry?"
          className="w-full rounded-lg border border-border bg-surface-low px-space-sm py-space-xs text-body-md focus:outline-none focus:ring-2 focus:ring-ink/10 disabled:text-muted"
        />

        {!decided && (
          <div className="mt-space-xs flex flex-wrap gap-space-2xs">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setNotes((current) =>
                    current.includes(tag) ? current : `${current.trim()}${current.trim() ? " " : ""}${tag}`,
                  )
                }
              >
                <Pill className="transition-colors hover:bg-brand hover:text-ink">+ {tag}</Pill>
              </button>
            ))}
          </div>
        )}
      </div>

      {decided ? (
        <p
          className={`mt-space-md flex items-start gap-space-sm rounded-xl p-space-md text-body-md ${
            state === "APPROVED" ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
          }`}
        >
          {state === "APPROVED" ? (
            <BadgeCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
          ) : (
            <XCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
          )}
          This file has already been {state.toLowerCase()}. Decisions are a permanent audit record.
        </p>
      ) : (
        <div className="mt-space-md space-y-space-sm">
          <form action={approveAction}>
            <input type="hidden" name="verificationId" value={verificationId} />
            <input type="hidden" name="notes" value={notes} />
            <Button type="submit" size="lg" variant="whatsapp" className="w-full" disabled={approving || rejecting}>
              <BadgeCheck />
              {approving ? "Approving…" : "Approve owner & issue verification badge"}
            </Button>
          </form>

          <form action={rejectAction}>
            <input type="hidden" name="verificationId" value={verificationId} />
            <input type="hidden" name="notes" value={notes} />
            <Button type="submit" variant="danger" className="w-full" disabled={approving || rejecting}>
              <XCircle />
              {rejecting ? "Rejecting…" : "Reject owner"}
            </Button>
          </form>

          {(approveState.error || rejectState.error) && (
            <p role="alert" className="rounded-lg bg-danger-bg px-space-sm py-space-xs text-body-sm text-danger">
              {approveState.error || rejectState.error}
            </p>
          )}
        </div>
      )}

      <p className="mt-space-md flex items-start gap-space-xs text-caption text-muted">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Decisions are permanently committed to the audit record in accordance with MoveApp Kenya
        security protocols and the Data Protection Act.
      </p>
    </section>
  );
}
