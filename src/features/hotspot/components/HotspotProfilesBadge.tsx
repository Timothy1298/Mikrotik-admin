import { cn } from "@/lib/utils/cn";

export function HotspotProfilesBadge({ profile }: { profile: string }) {
  return (
    <span className={cn("inline-flex rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-brand-100")}>
      {profile || "default"}
    </span>
  );
}
