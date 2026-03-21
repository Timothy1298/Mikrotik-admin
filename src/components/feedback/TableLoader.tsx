import { Skeleton } from "@/components/ui/Skeleton";

export function TableLoader() {
  return (
    <div className="rounded-2xl border border-background-border bg-background-panel p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="mb-3 h-12 w-full last:mb-0" />
      ))}
    </div>
  );
}
