"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, EyeOff, Send, Undo2, X } from "lucide-react";

import { bulkModerate } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/Toast";
import { Pill } from "@/components/ui/Pill";
import { ListingStatusPill } from "@/components/ui/StatusPill";
import { formatKes } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ListingStatus } from "@prisma/client";

export interface AdminListingRow {
  id: string;
  title: string;
  rentKes: number;
  depositMonths: number;
  estate: string;
  roadOrLandmark: string;
  bedrooms: number;
  bathrooms: number;
  status: ListingStatus;
  openReports: number;
  cover: string | null;
  owner: { id: string; fullName: string; businessName: string; verified: boolean };
}

/**
 * Screen 21's dense table with its bulk action bar. Selection is client state;
 * every action is a server action posting the selected ids, so the bar works
 * without any client-side mutation logic.
 */
export function ListingsTable({ listings }: { listings: AdminListingRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = listings.length > 0 && selected.size === listings.length;

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const ids = [...selected];

  return (
    <div className="space-y-space-md">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-space-sm rounded-xl bg-ink p-space-md text-white">
          <span className="flex items-center gap-space-sm">
            <span className="flex size-6 items-center justify-center rounded bg-brand text-ink">
              <BadgeCheck className="size-4" aria-hidden />
            </span>
            <span className="text-label-md">
              {selected.size} listing{selected.size === 1 ? "" : "s"} selected
            </span>
            <span className="text-body-sm text-white/50">of {listings.length} shown</span>
          </span>

          <span className="ml-auto flex flex-wrap items-center gap-space-xs">
            <BulkButton ids={ids} status="PUBLISHED" variant="whatsapp" icon={<Send />}>
              Publish ({selected.size})
            </BulkButton>
            <BulkButton ids={ids} status="PENDING_REVIEW" variant="secondary" icon={<Undo2 />}>
              Return to review
            </BulkButton>
            <BulkButton ids={ids} status="REJECTED" variant="danger" icon={<EyeOff />}>
              Unpublish ({selected.size})
            </BulkButton>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-lg p-space-2xs text-white/60 transition-colors hover:bg-ink-soft hover:text-white"
              aria-label="Clear selection"
            >
              <X className="size-4" aria-hidden />
            </button>
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-low">
              <th scope="col" className="w-10 px-space-md py-space-sm">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() =>
                    setSelected(allSelected ? new Set() : new Set(listings.map((l) => l.id)))
                  }
                  aria-label="Select all listings on this page"
                  className="size-4 rounded border-border accent-brand"
                />
              </th>
              {["Unit & property title", "Owner / agency", "Location", "Monthly rent", "Status"].map((head) => (
                <th
                  key={head}
                  scope="col"
                  className="px-space-sm py-space-sm text-caption uppercase tracking-wider text-muted"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {listings.map((listing) => (
              <tr
                key={listing.id}
                className={cn(
                  "border-b border-border last:border-0 transition-colors",
                  selected.has(listing.id) && "bg-brand-subtle",
                )}
              >
                <td className="px-space-md py-space-sm align-top">
                  <input
                    type="checkbox"
                    checked={selected.has(listing.id)}
                    onChange={() => toggle(listing.id)}
                    aria-label={`Select ${listing.title}`}
                    className="size-4 rounded border-border accent-brand"
                  />
                </td>

                <td className="px-space-sm py-space-sm">
                  <span className="flex items-start gap-space-sm">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-low">
                      {listing.cover && (
                        <Image src={listing.cover} alt="" fill sizes="48px" className="object-cover" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="block truncate text-label-md text-ink hover:text-brand-strong"
                      >
                        {listing.title}
                      </Link>
                      <span className="block text-body-sm text-muted">
                        #{listing.id.slice(-6).toUpperCase()} • {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} Beds`} •{" "}
                        {listing.bathrooms} Baths
                      </span>
                      {listing.openReports > 0 && (
                        <Pill tone="danger" className="mt-space-2xs text-caption">
                          {listing.openReports} open report{listing.openReports === 1 ? "" : "s"}
                        </Pill>
                      )}
                    </span>
                  </span>
                </td>

                <td className="px-space-sm py-space-sm align-top">
                  <Link href={`/owners/${listing.owner.id}`} className="block truncate text-label-md text-ink hover:underline">
                    {listing.owner.fullName}
                  </Link>
                  <span className="flex items-center gap-space-2xs text-body-sm text-muted">
                    {listing.owner.businessName}
                    {listing.owner.verified ? (
                      <BadgeCheck className="size-3.5 text-success" aria-hidden />
                    ) : (
                      <span className="text-warning">• unverified</span>
                    )}
                  </span>
                </td>

                <td className="px-space-sm py-space-sm align-top">
                  <span className="block text-label-md text-ink">{listing.estate}</span>
                  <span className="block truncate text-body-sm text-muted">{listing.roadOrLandmark}</span>
                </td>

                <td className="whitespace-nowrap px-space-sm py-space-sm align-top">
                  <span className="block font-display text-label-md text-ink">
                    {formatKes(listing.rentKes)}
                  </span>
                  <span className="block text-body-sm text-muted">
                    {listing.depositMonths} mo deposit
                  </span>
                </td>

                <td className="px-space-sm py-space-sm align-top">
                  <ListingStatusPill status={listing.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BulkButton({
  ids,
  status,
  variant,
  icon,
  children,
}: {
  ids: string[];
  status: ListingStatus;
  variant: "whatsapp" | "secondary" | "danger";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const verb = {
    PUBLISHED: "published",
    PENDING_REVIEW: "returned to review",
    REJECTED: "unpublished",
    RENTED_OUT: "marked rented out",
  }[status];

  return (
    <ActionForm
      action={async () => {
        const data = new FormData();
        for (const id of ids) data.append("listingIds", id);
        await bulkModerate(status, data);
      }}
      success={`${ids.length} listing${ids.length === 1 ? "" : "s"} ${verb}.`}
      confirm={
        status === "REJECTED"
          ? `Unpublish ${ids.length} listing${ids.length === 1 ? "" : "s"}? They will disappear from tenant search.`
          : undefined
      }
    >
      <Button type="submit" size="sm" variant={variant}>
        {icon}
        {children}
      </Button>
    </ActionForm>
  );
}
