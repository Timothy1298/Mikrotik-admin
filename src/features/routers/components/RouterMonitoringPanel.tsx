import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterMonitoringPanel({ router }: { router: RouterDetail }) {
  const monitoring = router.monitoring;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Monitoring / health</CardTitle>
          <CardDescription>Runtime health, telemetry recency, and resource-level operational signals.</CardDescription>
        </div>
      </CardHeader>
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
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Transfer</p>
          <p className="mt-3 text-sm text-text-primary">RX {monitoring.transferRx.toLocaleString()}</p>
          <p className="mt-1 text-sm text-text-secondary">TX {monitoring.transferTx.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Firmware</p>
          <p className="mt-3 text-sm text-text-primary">{monitoring.firmware || "Unavailable"}</p>
        </div>
      </div>
      {monitoring.health.issues.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {monitoring.health.issues.map((issue) => <span key={issue} className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-1 text-xs text-danger">{issue.replace(/_/g, " ")}</span>)}
        </div>
      ) : null}
    </Card>
  );
}
