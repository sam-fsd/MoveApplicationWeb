"use client";

import { createContext, useCallback, useContext, useEffect, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null);

/** Fires a toast. Safe to call outside the provider — it simply does nothing. */
export function useToast() {
  return useContext(ToastContext) ?? (() => {});
}

const ICONS: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 />,
  error: <AlertTriangle />,
  info: <Info />,
};

const TONES: Record<ToastTone, string> = {
  success: "border-success/30 bg-success-bg text-success",
  error: "border-danger/30 bg-danger-bg text-danger",
  info: "border-border bg-surface text-ink",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, tone, message }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-space-xs p-gutter-mobile sm:items-end sm:p-space-lg"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-space-sm rounded-xl border px-space-md py-space-sm shadow-raised",
              TONES[toast.tone],
            )}
          >
            <span className="mt-0.5 shrink-0 [&_svg]:size-4" aria-hidden>
              {ICONS[toast.tone]}
            </span>
            <p className="flex-1 text-body-md">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToasts((current) => current.filter((t) => t.id !== toast.id))}
              className="-m-space-2xs shrink-0 rounded p-space-2xs opacity-60 transition-opacity hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Fires a toast whenever a server action's result changes. Used with
 * useActionState, whose state is the action's return value.
 */
export function useResultToast(result: { ok?: boolean; message?: string; error?: string } | undefined) {
  const toast = useToast();
  const ok = result?.ok;
  const message = result?.message;
  const error = result?.error;

  // Keyed on the values rather than the object, so a re-render with the same
  // outcome does not fire a second toast.
  useEffect(() => {
    if (error) toast(error, "error");
    else if (ok && message) toast(message, "success");
  }, [ok, message, error, toast]);
}

/**
 * A form whose server action returns void. Runs it in a transition and toasts
 * the outcome, so silent mutations still tell the user what happened.
 */
export function ActionForm({
  action,
  success,
  confirm,
  children,
  className,
}: {
  action: () => Promise<void>;
  success: string;
  /** Shown in a native confirm() first — used for destructive actions. */
  confirm?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        if (confirm && !window.confirm(confirm)) return;
        startTransition(async () => {
          try {
            await action();
            toast(success, "success");
          } catch {
            toast("That did not go through. Try again.", "error");
          }
        });
      }}
    >
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
