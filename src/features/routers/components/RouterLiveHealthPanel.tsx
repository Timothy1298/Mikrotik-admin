import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { InlineError } from "@/components/feedback/InlineError";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useRouterLiveHealth } from "@/features/routers/hooks/useRouter";
import { formatBytes } from "@/lib/formatters/bytes";

dayjs.extend(relativeTime);

export function RouterLiveHealthPanel({ routerId }: { routerId: string }) {
  const liveHealthQuery = useRouterLiveHealth(routerId);
  const health = liveHealthQuery.data;

  const cpuTone = health?.cpuLoad == null ? "neutral" : health.cpuLoad >= 90 ? "danger" : health.cpuLoad >= 70 ? "warning" : "success";
  const lastUpdated = liveHealthQuery.dataUpdatedAt ? dayjs(liveHealthQuery.dataUpdatedAt).fromNow() : "Waiting for first refresh";

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Live router health</CardTitle>
          <CardDescription>Real-time resource data polled over the MikroTik management tunnel every 20 seconds.</CardDescription>
        </div>
        {liveHealthQuery.isFetching ? <Spinner className="h-4 w-4" /> : null}
      </CardHeader>

      {health && !health.reachable ? <InlineError message={health.error || "Live data unavailable — router not reachable over the configured management path"} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricTile label="Board Name" value={health?.boardName || "Unavailable"} />
        <MetricTile label="RouterOS Version" value={health?.routerosVersion || "Unavailable"} />
        <MetricTile label="Uptime" value={health?.uptime || "Unavailable"} />
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">CPU Load</p>
            <Badge tone={cpuTone}>{health?.cpuLoad != null ? `${health.cpuLoad}%` : "N/A"}</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-100">{health?.cpuLoad != null ? `${health.cpuLoad}%` : "Unavailable"}</p>
        </div>
        <MetricTile
          label="Free Memory"
          value={
            health?.freeMemory != null && health?.totalMemory != null
              ? `${formatBytes(health.freeMemory)} / ${formatBytes(health.totalMemory)}`
              : "Unavailable"
          }
        />
        <MetricTile label="Free Storage" value={health?.freeHddSpace != null ? formatBytes(health.freeHddSpace) : "Unavailable"} />
      </div>

      <p className="text-xs text-slate-500">Last updated {lastUpdated}.</p>
    </Card>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-sm text-slate-100">{value}</p>
    </div>
  );
}
