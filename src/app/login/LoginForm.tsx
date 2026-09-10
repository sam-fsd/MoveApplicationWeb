"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, AtSign, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { login, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Signing in…" : "Login to MoveApp"}
      {!pending && <ArrowRight />}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form
      action={formAction}
      className="space-y-space-md rounded-xl border border-border bg-surface p-space-lg shadow-card"
    >
      <div>
        <Label htmlFor="email" className="uppercase tracking-wider">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          placeholder="name@example.co.ke"
          icon={<AtSign />}
          required
        />
      </div>

      <div>
        <span className="mb-space-2xs flex items-baseline justify-between gap-space-sm">
          <Label htmlFor="password" className="mb-0 uppercase tracking-wider">
            Password
          </Label>
          <span className="text-label-sm text-muted">Forgot password?</span>
        </span>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={<Lock />}
          required
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <label className="flex items-center gap-space-xs text-body-md text-ink">
          <input
            type="checkbox"
            name="remember"
            defaultChecked
            className="size-4 rounded border-border accent-brand"
          />
          Keep me signed in
        </label>
        <span className="flex items-center gap-space-2xs text-label-sm text-success">
          <ShieldCheck className="size-4" aria-hidden />
          SSL Encrypted
        </span>
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg bg-danger-bg px-space-sm py-space-xs text-body-sm text-danger"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
