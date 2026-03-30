import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/feedback/InlineError";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { useRouterFlags } from "@/features/routers/hooks/useRouter";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterFlagsPanel({ router, onRemoveFlag }: { router: RouterDetail; onRemoveFlag: (flag: RouterDetail["flags"][number]) => void }) {
  const flagsQuery = useRouterFlags(router.id);
  const flags = flagsQuery.data || router.flags || [];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Flags</CardTitle>
          <CardDescription>Active review and operational flags attached to this router.</CardDescription>
        </div>
        <RefreshButton loading={flagsQuery.isFetching} onClick={() => void flagsQuery.refetch()} />
      </CardHeader>
      <div className="space-y-3">
        {flagsQuery.isPending ? <SectionLoader /> : null}
        {flagsQuery.isError ? <InlineError message="Unable to load router flags." /> : null}
        {flags.length ? flags.map((flag) => (
          <div key={flag.id || `${flag.flag}-${flag.createdAt}`} className="rounded-2xl border border-background-border bg-background-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary">{flag.flag.replace(/_/g, " ")}</p>
                <p className="mt-1 text-sm text-text-secondary">{flag.description || "No description provided."}</p>
                <p className="mt-2 text-xs text-text-muted">{flag.severity} • {flag.createdBy}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-mono text-xs text-text-muted">{formatDateTime(flag.createdAt)}</span>
                <Button variant="ghost" onClick={() => onRemoveFlag(flag)}>Remove</Button>
              </div>
            </div>
          </div>
        )) : <p className="text-sm text-text-secondary">No flags are active for this router right now.</p>}
      </div>
    </Card>
  );
}
