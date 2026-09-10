import { PageHeaderSkeleton, RowsSkeleton, StatCardsSkeleton } from "@/components/ui/Skeleton";

export default function LoadingDashboard() {
  return (
    <div className="space-y-space-lg px-gutter-mobile py-space-lg lg:px-gutter-desktop">
      <PageHeaderSkeleton />
      <StatCardsSkeleton />
      <RowsSkeleton count={4} />
    </div>
  );
}
