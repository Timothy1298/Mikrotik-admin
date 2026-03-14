import { cn } from "@/lib/utils/cn";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-800", className)}>
      <div className="h-full rounded-full bg-[linear-gradient(135deg,#2563eb_0%,#38bdf8_100%)] transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
