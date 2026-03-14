import { LoadingState } from "@/components/feedback/LoadingState";

export function PageLoader() {
  return <div className="space-y-6"><div className="h-10 w-72 rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)]" /><LoadingState /></div>;
}
