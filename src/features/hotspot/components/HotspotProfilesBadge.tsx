import { cn } from "@/lib/utils/cn";

export function HotspotProfilesBadge({ profile }: { profile: string }) {
  return (
    <span className={cn("inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary")}>
      {profile || "default"}
    </span>
  );
}
