import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { InlineError } from "@/components/feedback/InlineError";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { VpnServerHealthBadge } from "@/features/vpn-servers/components/VpnServerHealthBadge";
import { VpnServerLoadBadge } from "@/features/vpn-servers/components/VpnServerLoadBadge";
import { useVpnServerHealth } from "@/features/vpn-servers/hooks/useVpnServers";
import type { VpnServerDetail } from "@/features/vpn-servers/types/vpn-server.types";
import { formatDateTime } from "@/lib/formatters/date";

export function VpnServerHealthPanel({ server }: { server: VpnServerDetail }) {
  const healthQuery = useVpnServerHealth(server.id);
  const health = healthQuery.data || server.health;
  const lastHeartbeatAt = healthQuery.data?.lastHeartbeatAt ?? server.lastHeartbeatAt;
  const issues = healthQuery.data?.issues || server.recentIssues.map((issue) => issue.message);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Health / load summary</CardTitle>
          <CardDescription>Current server health, telemetry freshness, and configured capacity signals.</CardDescription>
        </div>
        <RefreshButton loading={healthQuery.isFetching} onClick={() => void healthQuery.refetch()} />
      </CardHeader>
      {healthQuery.isPending ? <SectionLoader /> : null}
      {healthQuery.isError ? <InlineError message="Unable to load VPN server health." /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Health</p><div className="mt-3"><VpnServerHealthBadge status={health.status} /></div></div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Capacity</p><div className="mt-3"><VpnServerLoadBadge overloaded={health.load.overloaded} nearCapacity={health.load.nearCapacity} /></div></div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Last heartbeat</p><p className="mt-3 text-sm text-text-primary">{formatDateTime(lastHeartbeatAt)}</p></div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Telemetry</p><p className="mt-3 text-sm text-text-primary">{health.staleTelemetry ? "stale telemetry" : "current telemetry"}</p></div>
      </div>
      {issues.length ? <div className="mt-4 flex flex-wrap gap-2">{issues.map((issue) => <span key={issue} className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-1 text-xs text-danger">{issue}</span>)}</div> : null}
    </Card>
  );
}
