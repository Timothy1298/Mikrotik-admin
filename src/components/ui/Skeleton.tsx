import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[linear-gradient(100deg,rgba(31,41,55,0.95)_0%,rgba(59,130,246,0.18)_50%,rgba(31,41,55,0.95)_100%)] bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    />
  );
}
