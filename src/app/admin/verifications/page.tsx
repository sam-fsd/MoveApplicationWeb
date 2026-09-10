import Link from "next/link";
import { BadgeCheck, CheckCircle2, Clock, XCircle } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { requireRole } from "@/lib/auth";
import { formatSubmittedAt } from "@/lib/format";
import { db } from "@/lib/db";
import type { VerificationState } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Owner verifications" };

const TABS: (VerificationState | "ALL")[] = ["PENDING", "APPROVED", "REJECTED", "UNSUBMITTED", "ALL"];

const LABEL: Record<VerificationState | "ALL", string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  UNSUBMITTED: "Not submitted",
  ALL: "All",
};

/** The verification queue behind screen 20's "View all". */
export default async function VerificationsQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; approved?: string; rejected?: string }>;
}) {
  const user = await requireRole("ADMIN");
  const params = await searchParams;
  const active = (TABS.includes(params.state as VerificationState) ? params.state : "PENDING") as
    | VerificationState
    | "ALL";

  const [rows, counts] = await Promise.all([
    db.verification.findMany({
      where: active === "ALL" ? {} : { state: active },
      orderBy: [{ submittedAt: "asc" }],
      include: {
        documents: { select: { label: true } },
        ownerProfile: {
          select: {
            businessName: true,
            kind: true,
            primaryEstate: true,
            user: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    }),
    db.verification.groupBy({ by: ["state"], _count: { _all: true } }),
  ]);

  const countBy = new Map(counts.map((c) => [c.state, c._count._all]));
  const total = counts.reduce((sum, c) => sum + c._count._all, 0);

  return (
    <AdminShell user={user} current="verifications" title="Owner Verifications">
      <div className="space-y-space-lg">
        {params.approved && (
          <p className="flex items-center gap-space-sm rounded-xl bg-success-bg p-space-md text-body-md text-success">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
            Owner approved. Their certificate is issued and they can publish listings now.
          </p>
        )}
        {params.rejected && (
          <p className="flex items-center gap-space-sm rounded-xl bg-danger-bg p-space-md text-body-md text-danger">
            <XCircle className="size-5 shrink-0" aria-hidden />
            Verification rejected. The owner has been notified with your reason.
          </p>
        )}

        <header>
          <h1 className="text-headline-lg-mobile md:text-headline-lg">Owner verifications</h1>
          <p className="mt-space-2xs text-body-md text-muted">
            Ownership documentation audits. Approving an owner issues their compliance certificate
            and unblocks publishing.
          </p>
        </header>

        <div className="flex flex-wrap gap-space-xs">
          {TABS.map((tab) => (
            <Link key={tab} href={`/admin/verifications?state=${tab}`}>
              <Pill tone={tab === active ? "brand" : "neutral"}>
                {LABEL[tab]} ({tab === "ALL" ? total : (countBy.get(tab as VerificationState) ?? 0)})
              </Pill>
            </Link>
          ))}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title={`No ${LABEL[active].toLowerCase()} verifications`}
            description="Nothing in this tab right now."
          />
        ) : (
          <ul className="grid gap-space-md">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-space-md rounded-xl border border-border bg-surface p-space-md"
              >
                <Avatar name={row.ownerProfile.user.fullName} src={row.ownerProfile.user.avatarUrl} size="lg" />

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-space-xs">
                    <span className="text-label-md text-ink">{row.ownerProfile.user.fullName}</span>
                    <Pill>{row.ownerProfile.kind === "AGENT" ? "Agency" : "Landlord"}</Pill>
                    {row.state === "APPROVED" && (
                      <Pill tone="success">
                        <BadgeCheck className="size-3.5" aria-hidden />
                        {row.certificateNumber}
                      </Pill>
                    )}
                    {row.state === "REJECTED" && <Pill tone="danger">Rejected</Pill>}
                  </p>
                  <p className="mt-space-2xs text-body-sm text-muted">
                    {row.ownerProfile.businessName} • {row.ownerProfile.primaryEstate}
                    {row.submittedAt && (
                      <>
                        {" • "}
                        <Clock className="inline size-3.5" aria-hidden /> {formatSubmittedAt(row.submittedAt)}
                      </>
                    )}
                  </p>
                  <p className="mt-space-xs flex flex-wrap gap-space-2xs">
                    {row.documents.map((doc) => (
                      <Pill key={doc.label} className="text-caption">
                        {doc.label}
                      </Pill>
                    ))}
                  </p>
                </div>

                <Link href={`/admin/verifications/${row.id}`}>
                  <Button size="sm" variant={row.state === "PENDING" ? "primary" : "secondary"}>
                    {row.state === "PENDING" ? "Review" : "Open file"}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
