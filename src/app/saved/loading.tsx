import { ListingGridSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function LoadingSaved() {
  return (
    <div className="mx-auto max-w-container-max space-y-space-lg px-gutter-mobile py-space-lg lg:px-gutter-desktop">
      <PageHeaderSkeleton />
      <ListingGridSkeleton count={3} />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
