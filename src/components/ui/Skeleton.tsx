import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-xs', className)} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-border-strong bg-white overflow-hidden">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-3 flex flex-col gap-2">
        <Skeleton className="h-3 w-[60%]" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[80%]" />
        <Skeleton className="h-4 w-[40%] mt-1" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}
