import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { VpnServerHealthBadge } from "@/features/vpn-servers/components/VpnServerHealthBadge";
import { VpnServerLoadBadge } from "@/features/vpn-servers/components/VpnServerLoadBadge";
import type { VpnServerDetail } from "@/features/vpn-servers/types/vpn-server.types";
import { formatDateTime } from "@/lib/formatters/date";

export function VpnServerHealthPanel({ server }: { server: VpnServerDetail }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Health / load summary</CardTitle>
          <CardDescription>Current server health, telemetry freshness, and configured capacity signals.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Health</p><div className="mt-3"><VpnServerHealthBadge status={server.health.status} /></div></div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Capacity</p><div className="mt-3"><VpnServerLoadBadge overloaded={server.loadCapacity.overloaded} nearCapacity={server.loadCapacity.nearCapacity} /></div></div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Last heartbeat</p><p className="mt-3 text-sm text-text-primary">{formatDateTime(server.lastHeartbeatAt)}</p></div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Telemetry</p><p className="mt-3 text-sm text-text-primary">{server.health.staleTelemetry ? "stale telemetry" : "current telemetry"}</p></div>
      </div>
      {server.recentIssues.length ? <div className="mt-4 flex flex-wrap gap-2">{server.recentIssues.map((issue) => <span key={issue.code} className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-1 text-xs text-danger">{issue.message}</span>)}</div> : null}
    </Card>
  );
}
