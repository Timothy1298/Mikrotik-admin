import { Activity } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { InlineError } from "@/components/feedback/InlineError";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useRouterActivity } from "@/features/routers/hooks/useRouter";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterActivityPanel({ router }: { router: RouterDetail }) {
  const activityQuery = useRouterActivity(router.id, { limit: 20 });
  const activity = activityQuery.data?.items || router.recentActivity || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest operational and admin events affecting this router.</CardDescription>
          </div>
          <RefreshButton loading={activityQuery.isFetching} onClick={() => void activityQuery.refetch()} />
        </div>
      </CardHeader>
      {activityQuery.isPending ? <SectionLoader /> : null}
      {activityQuery.isError ? <InlineError message="Activity data could not be refreshed. Showing the last loaded router snapshot." /> : null}
      <div className="space-y-3">
        {activity.length ? activity.map((item) => (
          <div key={item.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.summary}</p>
                <p className="mt-1 text-xs text-text-muted">{item.source} • {item.actor}</p>
              </div>
              <span className="font-mono text-xs text-text-muted">{formatDateTime(item.timestamp)}</span>
            </div>
          </div>
        )) : <EmptyState icon={Activity} title="No activity yet" description="Router operations, audits, and lifecycle events will appear here once activity is recorded." />}
      </div>
    </Card>
  );
}
