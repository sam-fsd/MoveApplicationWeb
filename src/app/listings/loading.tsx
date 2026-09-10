import { ListingGridSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function LoadingListings() {
  return (
    <div className="mx-auto max-w-container-max px-gutter-mobile py-space-lg lg:px-gutter-desktop">
      <div className="mb-space-lg flex flex-wrap gap-space-xs">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid gap-space-lg lg:grid-cols-[300px_1fr]">
        <Skeleton className="h-[36rem] rounded-xl" />
        <div className="space-y-space-lg">
          <PageHeaderSkeleton />
          <ListingGridSkeleton />
        </div>
      </div>
    </div>
  );
}
