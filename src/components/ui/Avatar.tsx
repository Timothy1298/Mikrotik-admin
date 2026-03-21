import { cn } from "@/lib/utils/cn";

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/15 font-mono text-sm font-semibold text-text-primary",
        className,
      )}
    >
      {initials}
    </div>
  );
}
