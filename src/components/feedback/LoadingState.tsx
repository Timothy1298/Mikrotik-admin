import { Skeleton } from "@/components/ui/Skeleton";

export function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="surface-card p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-8 w-28" />
          <Skeleton className="mt-4 h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
