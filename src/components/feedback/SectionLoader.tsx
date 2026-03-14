import { Skeleton } from "@/components/ui/Skeleton";

export function SectionLoader() {
  return <div className="surface-card p-5"><Skeleton className="h-5 w-48" /><Skeleton className="mt-4 h-24 w-full" /></div>;
}
