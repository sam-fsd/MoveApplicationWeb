import type { ListingStatus, ReportSeverity, ReportStatus } from "@prisma/client";
import {
  LISTING_STATUS_LABEL,
  REPORT_SEVERITY_LABEL,
  REPORT_STATUS_LABEL,
} from "@/lib/constants";
import { Pill, type PillTone } from "./Pill";

const LISTING_TONE: Record<ListingStatus, PillTone> = {
  PUBLISHED: "success",
  PENDING_REVIEW: "warning",
  RENTED_OUT: "neutral",
  REJECTED: "danger",
};

const REPORT_TONE: Record<ReportStatus, PillTone> = {
  OPEN: "danger",
  UNDER_REVIEW: "warning",
  RESOLVED: "success",
  DISMISSED: "neutral",
};

const SEVERITY_TONE: Record<ReportSeverity, PillTone> = {
  CRITICAL: "danger",
  MODERATE: "warning",
  LOW: "neutral",
};

export function ListingStatusPill({ status }: { status: ListingStatus }) {
  return (
    <Pill tone={LISTING_TONE[status]} dot>
      {LISTING_STATUS_LABEL[status]}
    </Pill>
  );
}

export function ReportStatusPill({ status }: { status: ReportStatus }) {
  return (
    <Pill tone={REPORT_TONE[status]} dot>
      {REPORT_STATUS_LABEL[status]}
    </Pill>
  );
}

export function SeverityPill({ severity }: { severity: ReportSeverity }) {
  return (
    <Pill tone={SEVERITY_TONE[severity]} dot className="bg-transparent px-0">
      {REPORT_SEVERITY_LABEL[severity]}
    </Pill>
  );
}
