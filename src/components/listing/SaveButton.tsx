"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleSaveListing } from "@/app/listings/[id]/actions";
import { cn } from "@/lib/cn";

/**
 * The heart. Flips immediately via useOptimistic and reconciles when the
 * server action returns; a signed-out visitor is sent to sign in instead.
 */
export function SaveButton({
  listingId,
  saved,
  signedIn,
  variant = "overlay",
  className,
}: {
  listingId: string;
  saved: boolean;
  signedIn: boolean;
  /** `overlay` sits on a photo, `inline` sits in a row of buttons. */
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(saved);

  function onClick() {
    if (!signedIn) {
      router.push(`/login?next=/listings/${listingId}`);
      return;
    }
    startTransition(async () => {
      setOptimistic(!optimistic);
      const result = await toggleSaveListing(listingId);
      // The server is the authority; a failure snaps the heart back.
      if (!result.ok) router.refresh();
    });
  }

  const label = optimistic ? "Remove from saved" : "Save this house";

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={optimistic}
        className={cn(
          "inline-flex h-10 items-center gap-space-xs rounded-lg border border-border px-space-md text-label-md transition-colors",
          optimistic ? "border-danger/30 bg-danger-bg text-danger" : "bg-surface text-ink hover:bg-surface-low",
          pending && "opacity-70",
          className,
        )}
      >
        <Heart className={cn("size-4", optimistic && "fill-current")} aria-hidden />
        {optimistic ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={optimistic}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-surface/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-surface",
        optimistic ? "text-danger" : "text-muted",
        pending && "opacity-70",
        className,
      )}
    >
      <Heart className={cn("size-4", optimistic && "fill-current")} aria-hidden />
    </button>
  );
}
