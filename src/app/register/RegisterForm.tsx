"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  AtSign,
  Building2,
  CheckCircle2,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { FieldHint, Input, Label } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import { register, type RegisterState } from "./actions";

function SubmitButton({ role }: { role: "tenant" | "owner" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending
        ? "Creating your account…"
        : role === "owner"
          ? "Register as Property Owner"
          : "Create tenant account"}
      {!pending && <ArrowRight />}
    </Button>
  );
}

/**
 * Screen 03. The Tenant / Owner toggle switches the form in place: the owner
 * branch adds the agency field and the 24-hour verification warning, because
 * an owner account cannot publish until an admin approves it.
 */
export function RegisterForm({ initialRole }: { initialRole: "tenant" | "owner" }) {
  const [role, setRole] = useState(initialRole);
  const [state, formAction] = useActionState<RegisterState, FormData>(register, {});
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-space-md">
      <input type="hidden" name="role" value={role} />

      {/* Role toggle */}
      <div
        role="tablist"
        aria-label="Account type"
        className="grid grid-cols-2 gap-space-2xs rounded-xl border border-border bg-surface-low p-space-2xs"
      >
        {(["tenant", "owner"] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={role === option}
            onClick={() => setRole(option)}
            className={cn(
              "inline-flex items-center justify-center gap-space-xs rounded-lg px-space-md py-space-sm text-label-md transition-colors",
              role === option ? "bg-ink text-white" : "text-muted hover:text-ink",
            )}
          >
            {option === "tenant" ? (
              <UserRound className="size-4" aria-hidden />
            ) : (
              <Building2 className="size-4" aria-hidden />
            )}
            {option === "tenant" ? "Tenant" : "Property Owner / Agent"}
            {role === option && <span className="size-1.5 rounded-full bg-brand" aria-hidden />}
          </button>
        ))}
      </div>

      {role === "owner" && (
        <div className="flex items-start gap-space-sm rounded-xl bg-warning-bg p-space-md">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
          <div>
            <p className="flex flex-wrap items-center gap-space-xs text-label-md text-ink">
              24-Hour Admin Verification Protocol
              <Pill tone="warning">Mandatory</Pill>
            </p>
            <p className="mt-space-2xs text-body-sm text-muted">
              Property owner accounts are reviewed by MoveApp admins within 24 hours. You can add
              listings straight away, but nothing is published until your ID and property ownership
              are checked.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-space-md sm:grid-cols-2">
        <Field
          id="fullName"
          label="Full name"
          required
          error={errors.fullName}
          defaultValue={values.fullName}
          placeholder="e.g. Peter Kamau"
          icon={<UserRound />}
          autoComplete="name"
        />

        {role === "owner" && (
          <Field
            id="businessName"
            label="Agency / Entity"
            aside="Required for owners"
            required
            error={errors.businessName}
            defaultValue={values.businessName}
            placeholder="e.g. Kamau Properties Ltd"
            icon={<Building2 />}
            autoComplete="organization"
          />
        )}
      </div>

      <Field
        id="email"
        label="Email address"
        required
        type="email"
        error={errors.email}
        defaultValue={values.email}
        placeholder="kamau@properties.co.ke"
        icon={<AtSign />}
        autoComplete="email"
      />

      <Field
        id="phone"
        label={role === "owner" ? "Phone number (tenant enquiries)" : "Phone number"}
        aside="Direct WhatsApp"
        required
        type="tel"
        error={errors.phone}
        defaultValue={values.phone}
        placeholder="0712 345 678"
        icon={<Phone />}
        autoComplete="tel"
        hint={
          role === "owner"
            ? "Renters will reach you instantly via WhatsApp and calls using this number."
            : "Owners reply to you on WhatsApp using this number."
        }
      />

      {role === "owner" && (
        <div>
          <Label htmlFor="kind">I am a</Label>
          <select
            id="kind"
            name="kind"
            defaultValue="LANDLORD"
            className="h-10 w-full rounded-lg border border-border bg-surface px-space-sm text-body-md text-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
          >
            <option value="LANDLORD">Landlord — I own the property</option>
            <option value="AGENT">Agent — I manage it on the owner&apos;s behalf</option>
          </select>
        </div>
      )}

      <div className="grid gap-space-md sm:grid-cols-2">
        <Field
          id="password"
          label="Create password"
          required
          type="password"
          error={errors.password}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <Field
          id="confirmPassword"
          label="Confirm password"
          required
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
        />
      </div>

      <ul className="flex flex-wrap gap-space-md text-body-sm text-muted">
        {["8+ characters", "A number or symbol"].map((rule) => (
          <li key={rule} className="flex items-center gap-space-2xs">
            <CheckCircle2 className="size-4 text-success" aria-hidden />
            {rule}
          </li>
        ))}
      </ul>

      <label className="flex items-start gap-space-sm rounded-xl border border-border bg-surface p-space-md text-body-sm text-muted">
        <input
          type="checkbox"
          name="terms"
          required
          defaultChecked
          className="mt-0.5 size-4 shrink-0 rounded border-border accent-brand"
        />
        <span>
          I agree to the Terms of Service and Privacy Policy, and confirm that all listings abide by
          the Anti-Fraud Landlord Guidelines under Kenyan Cap 301.
        </span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg bg-danger-bg px-space-sm py-space-xs text-body-sm text-danger">
          {state.error}
        </p>
      )}

      <SubmitButton role={role} />

      <p className="text-center text-body-md text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink underline">
          Log in instead
        </Link>
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  aside,
  hint,
  error,
  icon,
  required,
  ...props
}: {
  id: string;
  label: string;
  aside?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <span className="mb-space-2xs flex items-baseline justify-between gap-space-sm">
        <Label htmlFor={id} className="mb-0">
          {label}
          {required && <span className="text-danger"> *</span>}
        </Label>
        {aside && <span className="text-caption text-muted">{aside}</span>}
      </span>
      <Input
        id={id}
        name={id}
        icon={icon}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? "border-danger" : undefined}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-space-2xs text-body-sm text-danger">
          {error}
        </p>
      ) : (
        hint && <FieldHint>{hint}</FieldHint>
      )}
    </div>
  );
}
