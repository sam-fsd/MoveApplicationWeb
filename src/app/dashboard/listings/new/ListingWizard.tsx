"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Minus,
  Plus,
  Send,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { FieldHint, Input, Label } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { AMENITIES, ESTATES, HOUSE_TYPES } from "@/lib/constants";
import { formatKes } from "@/lib/format";
import { createListing, type CreateListingState } from "./actions";
import { cn } from "@/lib/cn";

const STEPS = [
  { label: "Details", note: "Basic property specs" },
  { label: "Photos", note: "Upload & arrange" },
  { label: "Location", note: "Nairobi zone" },
  { label: "Price & Terms", note: "Rent & deposit" },
  { label: "Review", note: "Submit for review" },
];

const MAX_PHOTOS = 5;

/**
 * Screens 17 and 18 are steps 1 and 2 of a five-step wizard. Steps 3–5 are
 * shown in the designs' stepper but never drawn, so they reuse the same field
 * vocabulary rather than inventing a new layout.
 *
 * The whole wizard is one <form>: steps hide and show, so a single submit
 * carries every field and the photos in one request.
 */
export function ListingWizard({ ownerEstate }: { ownerEstate: string }) {
  const [state, formAction, pending] = useActionState<CreateListingState, FormData>(
    createListing,
    {},
  );

  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [cover, setCover] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [rent, setRent] = useState(45000);
  const [furnishing, setFurnishing] = useState<"UNFURNISHED" | "SEMI" | "FURNISHED">("UNFURNISHED");

  const errors = state.fieldErrors ?? {};

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...photos];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_PHOTOS) break;
      next.push({ file, url: URL.createObjectURL(file) });
    }
    setPhotos(next);
    syncInput(next);
  }

  function removePhoto(index: number) {
    const next = photos.filter((_, i) => i !== index);
    URL.revokeObjectURL(photos[index].url);
    setPhotos(next);
    if (cover >= next.length) setCover(Math.max(0, next.length - 1));
    syncInput(next);
  }

  /**
   * A file input's FileList is read-only, so removing a photo means rebuilding
   * it from a DataTransfer — otherwise the deleted file still gets submitted.
   */
  function syncInput(list: { file: File }[]) {
    if (!fileInput.current) return;
    const transfer = new DataTransfer();
    for (const item of list) transfer.items.add(item.file);
    fileInput.current.files = transfer.files;
  }

  return (
    <form action={formAction} className="space-y-space-lg">
      <input type="hidden" name="coverIndex" value={cover} />
      <input type="hidden" name="furnishing" value={furnishing} />

      {/* Stepper */}
      <ol className="flex flex-wrap gap-space-md rounded-xl border border-border bg-surface p-space-lg">
        {STEPS.map((entry, index) => {
          const done = index < step;
          const current = index === step;
          return (
            <li key={entry.label} className="flex min-w-0 flex-1 items-center gap-space-sm">
              <button
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-label-sm transition-colors",
                  done && "bg-success text-white",
                  current && "bg-brand text-ink",
                  !done && !current && "bg-surface-low text-muted",
                )}
                aria-current={current ? "step" : undefined}
              >
                {done ? <Check className="size-4" aria-hidden /> : index + 1}
              </button>
              <span className="min-w-0">
                <span className={cn("block truncate text-label-md", current ? "text-ink" : "text-muted")}>
                  {entry.label}
                </span>
                <span className="block truncate text-caption text-muted-subtle">{entry.note}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-border bg-surface p-space-lg">
        {/* Step 1 — Details */}
        <fieldset className={cn("space-y-space-lg", step !== 0 && "hidden")}>
          <legend className="sr-only">Property details</legend>

          <div className="grid gap-space-md lg:grid-cols-[2fr_1fr]">
            <div>
              <span className="mb-space-2xs flex items-baseline justify-between gap-space-sm">
                <Label htmlFor="title" className="mb-0">
                  Listing title <span className="text-danger">*</span>
                </Label>
                <span className="text-caption text-muted">{title.length} / 80</span>
              </span>
              <Input
                id="title"
                name="title"
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spacious 2 Bedroom Master Ensuite with Balcony"
                className={errors.title ? "border-danger" : undefined}
              />
              {errors.title ? (
                <p className="mt-space-2xs text-body-sm text-danger">{errors.title}</p>
              ) : (
                <FieldHint>
                  Keep it descriptive. Avoid vague buzzwords — tenants search on real words.
                </FieldHint>
              )}
            </div>

            <div>
              <Label htmlFor="houseType">
                House type <span className="text-danger">*</span>
              </Label>
              <select
                id="houseType"
                name="houseType"
                defaultValue="APARTMENT"
                className="h-10 w-full rounded-lg border border-border bg-surface px-space-sm text-body-md focus:outline-none focus:ring-2 focus:ring-ink/10"
              >
                {HOUSE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <FieldHint>Sets how the unit is categorised in discovery filters.</FieldHint>
            </div>
          </div>

          <div className="grid gap-space-md sm:grid-cols-3">
            <Stepper
              label="Bedrooms"
              name="bedrooms"
              value={bedrooms}
              onChange={setBedrooms}
              min={0}
              max={10}
              hint="Bedsitters and studios count as 0."
              suffix="Beds"
            />
            <Stepper
              label="Bathrooms"
              name="bathrooms"
              value={bathrooms}
              onChange={setBathrooms}
              min={0.5}
              max={10}
              step={0.5}
              hint="Half counts a visitor cloakroom."
              suffix="Baths"
            />
            <div>
              <Label>
                Furnishing status <span className="text-danger">*</span>
              </Label>
              <div className="flex rounded-lg border border-border p-space-2xs">
                {(
                  [
                    ["UNFURNISHED", "Unfurnished"],
                    ["SEMI", "Semi"],
                    ["FURNISHED", "Furnished"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFurnishing(value)}
                    aria-pressed={furnishing === value}
                    className={cn(
                      "flex-1 rounded-md px-space-2xs py-space-xs text-label-sm transition-colors",
                      furnishing === value ? "bg-brand text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <FieldHint>Specify appliance inclusions in the description.</FieldHint>
            </div>
          </div>

          <div>
            <span className="mb-space-2xs flex items-baseline justify-between gap-space-sm">
              <Label htmlFor="description" className="mb-0">
                Property description <span className="text-danger">*</span>
              </Label>
              <span className="text-caption text-muted">{description.length} / 2000</span>
            </span>
            <textarea
              id="description"
              name="description"
              rows={6}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Well-lit 2 bedroom apartment in a secure quiet compound. Open-plan kitchen with granite worktops, dedicated laundry area, ceramic tile flooring, and large sliding windows onto a private balcony."
              className={cn(
                "w-full rounded-lg border bg-surface px-space-sm py-space-xs text-body-md focus:outline-none focus:ring-2 focus:ring-ink/10",
                errors.description ? "border-danger" : "border-border",
              )}
            />
            {errors.description ? (
              <p className="mt-space-2xs text-body-sm text-danger">{errors.description}</p>
            ) : (
              <FieldHint>
                Mention road access, water pressure, and noise level — these get faster approvals.
              </FieldHint>
            )}
          </div>

          <div>
            <Label className="mb-space-xs">Key utilities &amp; amenities</Label>
            <p className="mb-space-sm text-body-sm text-muted">
              Declare compound installations accurately. MoveApp audits these during physical
              verification.
            </p>
            <div className="grid gap-space-xs sm:grid-cols-2 lg:grid-cols-3">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className="flex cursor-pointer items-center gap-space-sm rounded-lg border border-border p-space-sm text-body-md transition-colors has-[:checked]:border-ink has-[:checked]:bg-surface-low"
                >
                  <input
                    type="checkbox"
                    name="amenities"
                    value={amenity}
                    className="size-4 shrink-0 rounded border-border accent-brand"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          <p className="flex items-start gap-space-sm rounded-xl bg-warning-bg p-space-md text-body-sm text-ink">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <span>
              <strong>Rent Restriction Act (Cap 296) compliance.</strong> MoveApp enforces accurate
              declaration of borehole tariffs and individual sub-meters. Overbilling or undisclosed
              utility markups may lead to tenancy dispute adjudication.
            </span>
          </p>
        </fieldset>

        {/* Step 2 — Photos */}
        <fieldset className={cn("space-y-space-lg", step !== 1 && "hidden")}>
          <legend className="sr-only">Photos</legend>

          <div className="flex flex-wrap items-start justify-between gap-space-md">
            <div>
              <h2 className="flex items-center gap-space-xs text-headline-sm">
                Upload rental unit photos
                <Pill tone={photos.length ? "success" : "neutral"}>
                  {photos.length} of {MAX_PHOTOS} uploaded
                </Pill>
              </h2>
              <p className="mt-space-2xs max-w-2xl text-body-md text-muted">
                Verified listings require authentic, real photos. Recommended shots: living room,
                primary bedroom, kitchen, bathroom, and the building exterior or compound.
              </p>
            </div>
          </div>

          <label
            className="flex cursor-pointer flex-col items-center gap-space-sm rounded-xl border-2 border-dashed border-border bg-surface-low p-space-2xl text-center transition-colors hover:border-ink/30"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addFiles(event.dataTransfer.files);
            }}
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-brand text-ink">
              <ImagePlus className="size-6" aria-hidden />
            </span>
            <span className="text-headline-sm">
              Drag and drop photos here, or <span className="underline">browse your device</span>
            </span>
            <span className="text-body-sm text-muted">
              JPG, PNG or WebP up to 10MB each. Authentic unwatermarked photos preferred.
            </span>
            <input
              ref={fileInput}
              type="file"
              name="photos"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => addFiles(event.target.files)}
            />
          </label>

          {errors.photos && <p className="text-body-sm text-danger">{errors.photos}</p>}

          {photos.length > 0 && (
            <ul className="grid gap-space-md sm:grid-cols-3 lg:grid-cols-5">
              {photos.map((photo, index) => (
                <li key={photo.url} className="overflow-hidden rounded-xl border border-border">
                  <span className="relative block aspect-[4/3] bg-surface-low">
                    <Image src={photo.url} alt="" fill sizes="20vw" className="object-cover" unoptimized />
                    {index === cover && (
                      <Pill tone="brand" className="absolute left-space-2xs top-space-2xs">
                        <Star className="size-3.5" aria-hidden />
                        Cover
                      </Pill>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-space-2xs top-space-2xs flex size-7 items-center justify-center rounded-full bg-surface/95 text-danger shadow-sm"
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </span>
                  <span className="flex items-center justify-between gap-space-2xs p-space-xs">
                    <span className="truncate text-caption text-muted">{photo.file.name}</span>
                    {index !== cover && (
                      <button
                        type="button"
                        onClick={() => setCover(index)}
                        className="shrink-0 text-caption text-brand-strong hover:underline"
                      >
                        Make cover
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {/* Step 3 — Location */}
        <fieldset className={cn("space-y-space-md", step !== 2 && "hidden")}>
          <legend className="sr-only">Location</legend>
          <h2 className="text-headline-sm">Where is the unit?</h2>
          <p className="text-body-md text-muted">
            Tenants only ever see an approximate location until they confirm an enquiry.
          </p>

          <div className="grid gap-space-md sm:grid-cols-2">
            <div>
              <Label htmlFor="estate">
                Estate <span className="text-danger">*</span>
              </Label>
              <select
                id="estate"
                name="estate"
                defaultValue={ESTATES.includes(ownerEstate as (typeof ESTATES)[number]) ? ownerEstate : ""}
                className="h-10 w-full rounded-lg border border-border bg-surface px-space-sm text-body-md focus:outline-none focus:ring-2 focus:ring-ink/10"
              >
                <option value="">Select an estate…</option>
                {ESTATES.map((estate) => (
                  <option key={estate}>{estate}</option>
                ))}
              </select>
              {errors.estate && <p className="mt-space-2xs text-body-sm text-danger">{errors.estate}</p>}
            </div>

            <div>
              <Label htmlFor="roadOrLandmark">
                Road or landmark <span className="text-danger">*</span>
              </Label>
              <Input
                id="roadOrLandmark"
                name="roadOrLandmark"
                placeholder="e.g. Muthithi Road, near Westgate"
                className={errors.roadOrLandmark ? "border-danger" : undefined}
              />
              {errors.roadOrLandmark && (
                <p className="mt-space-2xs text-body-sm text-danger">{errors.roadOrLandmark}</p>
              )}
            </div>

            <div>
              <Label htmlFor="floorAreaSqft">Floor area (sqft)</Label>
              <Input id="floorAreaSqft" name="floorAreaSqft" type="number" min={0} placeholder="900" />
            </div>

            <div>
              <Label htmlFor="parkingSpaces">Parking spaces</Label>
              <Input id="parkingSpaces" name="parkingSpaces" type="number" min={0} defaultValue={0} />
            </div>
          </div>
        </fieldset>

        {/* Step 4 — Price & terms */}
        <fieldset className={cn("space-y-space-md", step !== 3 && "hidden")}>
          <legend className="sr-only">Price and terms</legend>
          <h2 className="text-headline-sm">Rent and terms</h2>

          <div className="grid gap-space-md sm:grid-cols-3">
            <div>
              <Label htmlFor="rentKes">
                Monthly rent (KES) <span className="text-danger">*</span>
              </Label>
              <Input
                id="rentKes"
                name="rentKes"
                type="number"
                min={1000}
                step={1000}
                value={rent}
                onChange={(e) => setRent(Number(e.target.value))}
                className={errors.rentKes ? "border-danger" : undefined}
              />
              <FieldHint>Tenants see {formatKes(rent || 0)} / month.</FieldHint>
            </div>

            <div>
              <Label htmlFor="depositMonths">
                Deposit (months) <span className="text-danger">*</span>
              </Label>
              <Input id="depositMonths" name="depositMonths" type="number" min={0} max={6} defaultValue={1} />
            </div>

            <div>
              <Label htmlFor="availableFrom">Available from</Label>
              <Input
                id="availableFrom"
                name="availableFrom"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>

          <label className="flex items-center gap-space-sm rounded-lg border border-border p-space-md text-body-md">
            <input type="checkbox" name="serviceCharge" className="size-4 rounded border-border accent-brand" />
            Service charge is included in the rent
          </label>
        </fieldset>

        {/* Step 5 — Review */}
        <fieldset className={cn("space-y-space-md", step !== 4 && "hidden")}>
          <legend className="sr-only">Review</legend>
          <h2 className="text-headline-sm">Review and submit</h2>

          <dl className="divide-y divide-border rounded-xl border border-border">
            {[
              ["Title", title || "—"],
              ["Bedrooms / bathrooms", `${bedrooms} bed • ${bathrooms} bath`],
              ["Furnishing", furnishing === "SEMI" ? "Semi-furnished" : furnishing === "FURNISHED" ? "Furnished" : "Unfurnished"],
              ["Rent", formatKes(rent || 0)],
              ["Photos", `${photos.length} uploaded`],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-space-sm p-space-sm">
                <dt className="text-body-md text-muted">{label}</dt>
                <dd className="text-label-md text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="flex items-start gap-space-sm rounded-xl bg-warning-bg p-space-md text-body-md text-ink">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <span>
              <strong>This listing enters review before going live.</strong> An admin checks the
              photos and details against your verified ownership documents. You will be notified
              when it is published.
            </span>
          </p>
        </fieldset>

        {state.error && (
          <p role="alert" className="mt-space-md rounded-lg bg-danger-bg px-space-sm py-space-xs text-body-md text-danger">
            {state.error}
          </p>
        )}
      </div>

      {/* Wizard controls */}
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <Link href="/dashboard/listings" className="text-label-md text-muted hover:text-ink">
          Cancel
        </Link>

        <div className="flex items-center gap-space-sm">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft />
              Back
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button type="button" size="lg" onClick={() => setStep((s) => s + 1)}>
              Continue to {STEPS[step + 1].label}
              <ArrowRight />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={pending}>
              <Send />
              {pending ? "Submitting…" : "Submit for review"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function Stepper({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
  suffix,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  hint: string;
  suffix: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>
        {label} <span className="text-danger">*</span>
      </Label>
      <div className="flex h-10 items-center justify-between rounded-lg border border-border bg-surface px-space-2xs">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-low hover:text-ink"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <span className="text-label-md text-ink">
          {value} <span className="text-body-sm text-muted">{suffix}</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-low hover:text-ink"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
      <input type="hidden" name={name} value={value} />
      <FieldHint>{hint}</FieldHint>
    </div>
  );
}
