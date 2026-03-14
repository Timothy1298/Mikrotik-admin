import { cn } from "@/lib/utils/cn";

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-500/15 bg-[linear-gradient(135deg,#1d4ed8,#0284c7)] text-sm font-semibold text-white font-mono", className)}>{initials}</div>;
}
