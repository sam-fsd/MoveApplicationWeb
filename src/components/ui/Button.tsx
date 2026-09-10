import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "danger" | "whatsapp";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // Rule: text on yellow is always ink. Yellow is a fill, never a text colour.
  primary: "bg-brand text-ink hover:bg-brand-hover",
  secondary: "bg-surface text-ink border border-border hover:bg-surface-low",
  ghost: "bg-transparent text-muted hover:bg-surface-low hover:text-ink",
  dark: "bg-ink text-white hover:bg-ink-soft",
  danger: "bg-danger text-white hover:brightness-95",
  whatsapp: "bg-whatsapp text-white hover:brightness-95",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-space-sm gap-space-2xs text-label-sm rounded-lg",
  md: "h-10 px-space-md gap-space-xs text-label-md rounded-lg",
  lg: "h-12 px-space-lg gap-space-xs text-label-md rounded-xl",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
