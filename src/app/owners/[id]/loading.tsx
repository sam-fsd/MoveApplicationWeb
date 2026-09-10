import { ListingGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function LoadingOwner() {
  return (
    <div className="mx-auto max-w-container-max space-y-space-lg px-gutter-mobile py-space-lg lg:px-gutter-desktop">
      <Skeleton className="h-56 rounded-xl" />
      <ListingGridSkeleton count={3} />
    </div>
  );
}
