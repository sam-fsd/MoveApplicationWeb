"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Built on the native <dialog>, so Escape, focus trapping, inertness of the
 * page behind, and the top layer all come from the platform rather than from
 * hand-rolled key handlers.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Escape and the close chrome both fire the dialog's own close event.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handle = () => onClose();
    dialog.addEventListener("close", handle);
    return () => dialog.removeEventListener("close", handle);
  }, [onClose]);

  const width = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" }[size];

  return (
    <dialog
      ref={ref}
      // Clicking the backdrop (the dialog element itself) closes; clicks inside
      // the panel stop there.
      onClick={(event) => {
        if (event.target === ref.current) ref.current?.close();
      }}
      className={cn(
        "w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-0 text-ink shadow-raised backdrop:bg-ink/50 backdrop:backdrop-blur-sm",
        width,
      )}
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start gap-space-sm border-b border-border p-space-lg">
          {icon && <span className="mt-0.5 shrink-0 [&_svg]:size-5">{icon}</span>}
          <div className="min-w-0 flex-1">
            <h2 className="text-headline-sm">{title}</h2>
            {subtitle && <p className="mt-space-2xs text-body-sm text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="-m-space-2xs shrink-0 rounded-lg p-space-2xs text-muted transition-colors hover:bg-surface-low hover:text-ink"
          >
            <X className="size-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-space-lg">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-space-sm border-t border-border p-space-lg">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
