"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Screen 06's gallery: one large frame, four thumbnails, and a "View all N
 * photos" control that opens a lightbox.
 */
export function Gallery({
  images,
  title,
  badge,
}: {
  images: { id: string; url: string }[];
  title: string;
  badge?: React.ReactNode;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (images.length === 0) return null;

  const [cover, ...rest] = images;
  const thumbs = rest.slice(0, 4);

  const step = (delta: number) =>
    setLightbox((current) =>
      current === null ? null : (current + delta + images.length) % images.length,
    );

  return (
    <>
      <div className="grid gap-space-xs md:grid-cols-[1.6fr_1fr]">
        <button
          type="button"
          onClick={() => setLightbox(0)}
          className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-low md:aspect-auto md:h-[420px]"
        >
          <Image
            src={cover.url}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority
          />
          {badge && <span className="absolute left-space-sm top-space-sm">{badge}</span>}
        </button>

        <div className="grid grid-cols-4 gap-space-xs md:grid-cols-2">
          {thumbs.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setLightbox(index + 1)}
              className="group relative aspect-square overflow-hidden rounded-lg bg-surface-low md:aspect-auto"
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(max-width: 768px) 25vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </button>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={() => setLightbox(0)}
          className="mt-space-xs inline-flex items-center gap-space-2xs rounded-lg border border-border bg-surface px-space-md py-space-xs text-label-sm text-ink transition-colors hover:bg-surface-low"
        >
          <Images className="size-4" aria-hidden />
          View all {images.length} photos
        </button>
      )}

      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal
          aria-label={`${title} — photo ${lightbox + 1} of ${images.length}`}
          className="fixed inset-0 z-50 flex flex-col bg-ink/95 p-space-md backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") step(1);
            if (event.key === "ArrowLeft") step(-1);
          }}
          tabIndex={-1}
          ref={(node) => node?.focus()}
        >
          <div className="flex items-center justify-between text-white">
            <span className="text-label-md">
              {lightbox + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="rounded-lg p-space-2xs hover:bg-white/10"
            >
              <X className="size-6" aria-hidden />
              <span className="sr-only">Close gallery</span>
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <NavButton side="left" onClick={() => step(-1)} />
            <Image
              src={images[lightbox].url}
              alt=""
              width={1400}
              height={1000}
              className="max-h-full w-auto max-w-full rounded-xl object-contain"
            />
            <NavButton side="right" onClick={() => step(1)} />
          </div>
        </div>
      )}
    </>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20",
        side === "left" ? "left-space-sm" : "right-space-sm",
      )}
    >
      <Icon className="size-6" aria-hidden />
      <span className="sr-only">{side === "left" ? "Previous" : "Next"} photo</span>
    </button>
  );
}
