import * as React from "react";
import { cn } from "@/lib/cn";

const FIELD =
  "w-full rounded-lg border border-border bg-surface px-space-sm text-body-md text-ink " +
  "placeholder:text-muted-subtle focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10 " +
  "disabled:cursor-not-allowed disabled:bg-surface-low disabled:text-muted";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rendered inside the field on the left — the search and location inputs. */
  icon?: React.ReactNode;
}

export function Input({ className, icon, ...props }: InputProps) {
  if (!icon) return <input className={cn(FIELD, "h-10", className)} {...props} />;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-space-sm top-1/2 -translate-y-1/2 text-muted [&_svg]:size-4">
        {icon}
      </span>
      <input className={cn(FIELD, "h-10 pl-9", className)} {...props} />
    </div>
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD, "min-h-24 py-space-sm", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(FIELD, "h-10 pr-8", className)} {...props} />;
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-space-2xs block text-label-sm text-ink", className)} {...props} />;
}

export function FieldHint({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-space-2xs text-body-sm text-muted", className)} {...props} />;
}

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  /** The count on the right of each house-type row on screen 04. */
  count?: number;
}

export function Checkbox({ label, count, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-space-sm py-1 text-body-md", className)}>
      <input
        type="checkbox"
        className="size-4 shrink-0 rounded border-border text-ink accent-brand focus:ring-ink/20"
        {...props}
      />
      <span className="flex-1 text-ink">{label}</span>
      {count !== undefined && <span className="text-body-sm text-muted-subtle">{count}</span>}
    </label>
  );
}
