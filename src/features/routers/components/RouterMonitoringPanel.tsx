import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { InlineError } from "@/components/feedback/InlineError";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { useRouterMonitoring } from "@/features/routers/hooks/useRouter";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterMonitoringPanel({ router }: { router: RouterDetail }) {
  const monitoringQuery = useRouterMonitoring(router.id);
  const monitoring = monitoringQuery.data || router.monitoring;
  const managementOnly = router.profile.connectionMode === "management_only";
  const ownerTunnel = monitoring.ownerTunnel;
  const transferRx = managementOnly && ownerTunnel ? ownerTunnel.transferRx : monitoring.transferRx;
  const transferTx = managementOnly && ownerTunnel ? ownerTunnel.transferTx : monitoring.transferTx;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Monitoring / health</CardTitle>
          <CardDescription>Runtime health, telemetry recency, and resource-level operational signals.</CardDescription>
        </div>
        <RefreshButton loading={monitoringQuery.isFetching} onClick={() => void monitoringQuery.refetch()} />
      </CardHeader>
      {monitoringQuery.isPending ? <SectionLoader /> : null}
      {monitoringQuery.isError ? <InlineError message="Unable to load router monitoring." /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Last seen</p>
          <p className="mt-3 text-sm text-text-primary">{formatDateTime(monitoring.lastSeen)}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Telemetry</p>
          <p className="mt-3 text-sm text-text-primary">{formatDateTime(monitoring.lastTelemetryAt)}</p>
          <p className="mt-1 text-xs text-text-muted">{monitoring.staleTelemetry ? "stale" : "fresh"}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{managementOnly ? "Owner tunnel transfer" : "Transfer"}</p>
          <p className="mt-3 text-sm text-text-primary">RX {transferRx.toLocaleString()}</p>
          <p className="mt-1 text-sm text-text-secondary">TX {transferTx.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{managementOnly ? "Owner tunnel handshake" : "Firmware"}</p>
          <p className="mt-3 text-sm text-text-primary">{managementOnly ? formatDateTime(ownerTunnel?.lastHandshake) : (monitoring.firmware || "Unavailable")}</p>
          {managementOnly && ownerTunnel ? <p className="mt-1 text-xs text-text-muted">{ownerTunnel.serverNode} • {ownerTunnel.handshakeState}</p> : null}
        </div>
      </div>
      {managementOnly && ownerTunnel ? (
        <div className="mt-4 rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Owner tunnel source</p>
          <p className="mt-2 text-sm text-text-primary">{ownerTunnel.sourceRouterName || "Owner router"} • {ownerTunnel.peerName || "Unknown peer"}</p>
          <p className="mt-1 font-mono text-xs text-text-muted">{ownerTunnel.vpnIp || "No VPN IP"} • {ownerTunnel.serverNode}</p>
        </div>
      ) : null}
      {monitoring.health.issues.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {monitoring.health.issues.map((issue) => <span key={issue} className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-1 text-xs text-danger">{issue.replace(/_/g, " ")}</span>)}
        </div>
      ) : null}
    </Card>
  );
}
