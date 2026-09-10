import { PageHeaderSkeleton, RowsSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-space-lg px-gutter-mobile py-space-lg lg:px-gutter-desktop">
      <PageHeaderSkeleton />
      <RowsSkeleton count={6} />
    </div>
  );
}
