import Image from "next/image";
import Link from "next/link";
import { Bath, Bed, Car, Heart, MapPin, Maximize, MessageSquare, Ruler } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { HOUSE_TYPE_LABEL } from "@/lib/constants";
import { formatCount, formatDepositChip, formatKes } from "@/lib/format";
import type { ListingCardData } from "@/lib/queries/listings";
import { cn } from "@/lib/cn";

const FALLBACK_IMAGE = "/seed/listings/apartment-interior-daylight.png";

/**
 * The listing card, as specified by screens 01 and 04. It appears on six more
 * screens later, so the shape is fixed here: photo with a type chip bottom-left
 * and a feature chip bottom-right, heart top-right, then price, title, location,
 * a three-item spec row, and an owner footer carrying the verification badge.
 */
export function ListingCard({
  listing,
  saved = false,
  saveSlot,
  actionSlot,
  className,
}: {
  listing: ListingCardData;
  saved?: boolean;
  /** Interactive heart, supplied once saving exists in Phase 3. */
  saveSlot?: React.ReactNode;
  /** The "Inquire" button on screen 04. */
  actionSlot?: React.ReactNode;
  className?: string;
}) {
  const cover = listing.images[0]?.url ?? FALLBACK_IMAGE;
  const feature = listing.amenities[0]?.label;
  const owner = listing.owner;
  const business = owner.ownerProfile?.businessName ?? owner.fullName;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card transition-shadow hover:shadow-raised",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-low">
        <Link href={`/listings/${listing.id}`} tabIndex={-1} aria-hidden>
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        <Pill tone="ink" className="absolute bottom-space-sm left-space-sm shadow-sm">
          {bedroomLabel(listing)}
        </Pill>

        {feature && (
          <Pill className="absolute bottom-space-sm right-space-sm bg-surface/95 text-ink shadow-sm backdrop-blur-sm">
            {shortFeature(feature)}
          </Pill>
        )}

        <div className="absolute right-space-sm top-space-sm">
          {saveSlot ?? (
            <span
              className="flex size-8 items-center justify-center rounded-full bg-surface/95 text-muted shadow-sm backdrop-blur-sm"
              aria-hidden
            >
              <Heart className={cn("size-4", saved && "fill-danger text-danger")} />
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-space-xs p-space-md">
        {/* The price must never wrap; a long highlight chip ellipsizes instead. */}
        <div className="flex items-baseline justify-between gap-space-xs">
          <span className="flex shrink-0 items-baseline gap-space-2xs whitespace-nowrap">
            <span className="font-display text-price-listing text-ink">
              {formatKes(listing.rentKes)}
            </span>
            <span className="text-body-sm text-muted">/ month</span>
          </span>
          <Pill className="min-w-0 text-caption">
            <span className="truncate">
              {listing.highlight ?? formatDepositChip(listing.depositMonths)}
            </span>
          </Pill>
        </div>

        <h3 className="text-label-md text-ink">
          <Link href={`/listings/${listing.id}`} className="line-clamp-1 hover:text-brand-strong">
            {listing.title}
          </Link>
        </h3>

        <p className="flex items-center gap-space-2xs text-body-sm text-muted">
          <MapPin className="size-4 shrink-0" aria-hidden />
          <span className="line-clamp-1">{listing.roadOrLandmark}</span>
        </p>

        <ul className="mt-space-2xs flex items-center gap-space-sm border-y border-border py-space-xs text-body-sm text-muted">
          {specs(listing).map((spec) => (
            <li key={spec.label} className="flex min-w-0 items-center gap-space-2xs">
              <span className="shrink-0 text-muted-subtle [&_svg]:size-4" aria-hidden>
                {spec.icon}
              </span>
              <span className="truncate">{spec.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center gap-space-xs pt-space-xs">
          <Avatar name={business} src={owner.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <Link
              href={`/owners/${owner.id}`}
              className="block truncate text-label-sm text-ink hover:text-brand-strong"
            >
              {business}
            </Link>
            {owner.ownerProfile && (
              <VerifiedBadge
                kind={owner.ownerProfile.kind}
                label={owner.ownerProfile.badgeLabel}
                className="text-caption"
              />
            )}
          </div>
          {actionSlot ?? (
            <Link
              href={`/listings/${listing.id}`}
              className="inline-flex h-8 shrink-0 items-center gap-space-2xs rounded-lg border border-border px-space-sm text-label-sm text-ink transition-colors hover:bg-surface-low"
            >
              <MessageSquare className="size-4" aria-hidden />
              Inquire
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/** "Studio" / "Bedsitter" / "2 Bedroom" — the chip on the photo. */
function bedroomLabel(listing: ListingCardData): string {
  if (listing.bedrooms === 0) return HOUSE_TYPE_LABEL[listing.houseType];
  return `${listing.bedrooms} Bedroom`;
}

/** Feature chips are short on the photo — "Borehole Water 24/7" becomes "Borehole". */
function shortFeature(label: string): string {
  return label
    .replace(/^Prepaid KPLC Token$/, "Prepaid Token")
    .replace(/^24\/7 Security Guard & CCTV$/, "24/7 Security")
    .replace(/ 24\/7.*$/, "")
    .replace(/^24\/7 /, "")
    .replace(/ \/.*$/, "")
    .replace(/-Optic Ready$/, "")
    .replace(/ Bay$/, "")
    .trim();
}

function specs(listing: ListingCardData) {
  const beds =
    listing.bedrooms === 0
      ? { icon: <Bed />, label: HOUSE_TYPE_LABEL[listing.houseType] }
      : { icon: <Bed />, label: `${listing.bedrooms} ${listing.bedrooms === 1 ? "Bed" : "Beds"}` };

  const baths = {
    icon: <Bath />,
    label: `${listing.bathrooms} ${listing.bathrooms === 1 ? "Bath" : "Baths"}`,
  };

  // The third slot is whatever this unit actually has to say for itself.
  const third = listing.parkingSpaces
    ? {
        icon: <Car />,
        label: `${listing.parkingSpaces} ${listing.parkingSpaces === 1 ? "Car" : "Cars"}`,
      }
    : listing.floorAreaSqft
      ? { icon: <Ruler />, label: `${formatCount(listing.floorAreaSqft)} sqft` }
      : { icon: <Maximize />, label: listing.furnished ? "Furnished" : "Unfurnished" };

  return [beds, baths, third];
}
