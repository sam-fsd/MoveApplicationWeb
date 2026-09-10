import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * The wordmark is spelled two ways across the designs — "MoveApp Kenya" on the
 * marketing screens and "MoveApp.ke" on the app ones. `variant` picks between
 * them; the mark itself is the same.
 */
export function Logo({
  variant = "kenya",
  href = "/",
  className,
  tone = "ink",
}: {
  variant?: "kenya" | "ke";
  href?: string | null;
  className?: string;
  tone?: "ink" | "light";
}) {
  const content = (
    <span className={cn("flex items-center gap-space-xs", className)}>
      <Image src="/logo.png" alt="" width={32} height={32} className="size-8 rounded-lg object-contain" />
      <span
        className={cn(
          "font-display text-headline-sm tracking-tight",
          tone === "light" ? "text-white" : "text-ink",
        )}
      >
        MoveApp{variant === "kenya" ? " " : ""}
        <span className="text-brand-strong">{variant === "kenya" ? "Kenya" : ".ke"}</span>
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="shrink-0" aria-label="MoveApp Kenya — home">
      {content}
    </Link>
  );
}
