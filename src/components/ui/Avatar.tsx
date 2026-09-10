import Image from "next/image";
import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: { box: "size-8", text: "text-label-sm", px: 32 },
  md: { box: "size-10", text: "text-label-md", px: 40 },
  lg: { box: "size-12", text: "text-label-md", px: 48 },
} as const;

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Falls back to initials on a tinted disc — how most owners render in the designs. */
export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const s = SIZES[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={s.px}
        height={s.px}
        className={cn("shrink-0 rounded-full object-cover", s.box, className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-surface-container font-semibold text-ink",
        s.box,
        s.text,
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
