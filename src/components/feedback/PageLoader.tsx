import { LoadingState } from "@/components/feedback/LoadingState";

export function PageLoader() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-72 rounded-xl border border-background-border bg-background-panel" />
      <LoadingState />
    </div>
  );
}
