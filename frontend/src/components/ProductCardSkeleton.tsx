import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
    <Skeleton className="aspect-square w-full rounded-none" />
    <div className="flex flex-1 flex-col gap-2 p-4">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;
