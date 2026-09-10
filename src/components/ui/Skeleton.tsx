import { cn } from "@/lib/cn";

/** A shimmering placeholder block. */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cn("block animate-pulse rounded-lg bg-surface-container", className)} aria-hidden />;
}

/** Mirrors ListingCard's shape so the grid does not jump when data lands. */
export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-space-xs p-space-md">
        <div className="flex items-center justify-between gap-space-sm">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-space-sm border-y border-border py-space-xs">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="flex items-center gap-space-xs pt-space-2xs">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="ml-auto h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-space-lg sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-space-sm rounded-xl border border-border bg-surface p-space-lg">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function RowsSkeleton({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-space-sm", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-space-md rounded-xl border border-border bg-surface p-space-md"
        >
          <Skeleton className="size-12 shrink-0" />
          <div className="min-w-0 flex-1 space-y-space-2xs">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-space-xs">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  );
}
