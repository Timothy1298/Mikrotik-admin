import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-2xl bg-[linear-gradient(100deg,rgba(37,99,235,0.18)_0%,rgba(56,189,248,0.06)_100%)] bg-[length:200%_100%] animate-shimmer", className)} />;
}
