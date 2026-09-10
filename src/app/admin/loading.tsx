import { PageHeaderSkeleton, RowsSkeleton, Skeleton, StatCardsSkeleton } from "@/components/ui/Skeleton";

export default function LoadingAdmin() {
  return (
    <div className="space-y-space-lg px-gutter-mobile py-space-lg lg:px-gutter-desktop">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={6} />
      <div className="grid gap-space-lg xl:grid-cols-2">
        <RowsSkeleton count={3} />
        <RowsSkeleton count={3} />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
