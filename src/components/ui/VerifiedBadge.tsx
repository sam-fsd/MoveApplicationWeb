import { BadgeCheck } from "lucide-react";
import type { OwnerKind } from "@prisma/client";
import { verifiedBadgeLabel } from "@/lib/constants";
import { cn } from "@/lib/cn";

export interface VerifiedBadgeProps {
  kind: OwnerKind;
  /** Per-owner override from OwnerProfile.badgeLabel. */
  label?: string | null;
  /** Card footers use the bare mark; profile headers use the tinted pill. */
  variant?: "inline" | "pill";
  className?: string;
}

/**
 * Every listing surface shows this (CLAUDE.md rule 2). The label is
 * kind-derived because the designs spell it five different ways.
 */
export function VerifiedBadge({ kind, label, variant = "inline", className }: VerifiedBadgeProps) {
  const text = verifiedBadgeLabel(kind, label);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-space-2xs text-label-sm text-success",
        variant === "pill" && "rounded-full bg-success-bg px-space-sm py-1",
        className,
      )}
    >
      <BadgeCheck className="size-4 shrink-0" aria-hidden />
      {text}
    </span>
  );
}
