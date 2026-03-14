import { Skeleton } from "@/components/ui/Skeleton";

export function TableLoader() {
  return (
    <div className="rounded-3xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="mb-3 h-12 w-full last:mb-0" />
      ))}
    </div>
  );
}
