"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2, MessageSquare, Send } from "lucide-react";
import { sendEnquiry, type ActionResult } from "@/app/listings/[id]/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useResultToast } from "@/components/ui/Toast";
import { TrustNotice } from "@/components/ui/TrustNotice";

/**
 * The in-app message — the third contact channel behind WhatsApp and a call.
 * It lands in the owner's enquiries on screen 15.
 */
export function EnquiryModal({
  open,
  onClose,
  listingId,
  listingTitle,
  defaultMessage,
  signedIn,
}: {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  defaultMessage: string;
  signedIn: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(sendEnquiry, {
    ok: false,
  });
  useResultToast(state);
  const [message, setMessage] = useState(defaultMessage);

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-subtle text-brand-strong">
          <MessageSquare className="size-4" aria-hidden />
        </span>
      }
      title="Send a direct message"
      subtitle={listingTitle}
      footer={
        state.ok ? (
          <Button onClick={onClose}>Done</Button>
        ) : signedIn ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="enquiry-form" disabled={pending}>
              <Send />
              {pending ? "Sending…" : "Send message"}
            </Button>
          </>
        ) : (
          <Link href={`/login?next=/listings/${listingId}`}>
            <Button>Sign in to message</Button>
          </Link>
        )
      }
    >
      {state.ok ? (
        <p className="flex items-start gap-space-sm rounded-xl bg-success-bg p-space-md text-body-md text-success">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
          {state.message}
        </p>
      ) : !signedIn ? (
        <p className="text-body-md text-muted">
          Sign in so the owner knows who is asking, and we will bring you straight back here.
        </p>
      ) : (
        <form id="enquiry-form" action={formAction} className="space-y-space-md">
          <input type="hidden" name="listingId" value={listingId} />
          <div>
            <label htmlFor="message" className="mb-space-2xs block text-label-md text-ink">
              Your message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-space-sm py-space-xs text-body-md text-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>
          <TrustNotice tone="neutral">
            The owner sees your name and phone number so they can reply on WhatsApp. Never send
            money before viewing the house in person.
          </TrustNotice>
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
