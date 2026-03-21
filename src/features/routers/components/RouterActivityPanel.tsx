import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterActivityPanel({ router }: { router: RouterDetail }) {
  const activity = router.recentActivity || [];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest operational and admin events affecting this router.</CardDescription>
        </div>
      </CardHeader>
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
        )) : <p className="text-sm text-text-secondary">No activity has been recorded for this router yet.</p>}
      </div>
    </Card>
  );
}
