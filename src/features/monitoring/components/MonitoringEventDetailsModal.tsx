import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { HealthStatusBadge } from "@/features/monitoring/components/HealthStatusBadge";
import type { MonitoringDetailItem } from "@/features/monitoring/types/monitoring.types";
import { formatDateTime } from "@/lib/formatters/date";

export function MonitoringEventDetailsModal({ open, detail, onClose }: { open: boolean; detail: MonitoringDetailItem | null; onClose: () => void }) {
  if (!open || !detail) return null;

  const title = detail.kind === "diagnostic"
    ? detail.item.resourceName
    : detail.kind === "activity"
      ? detail.item.summary
      : detail.kind === "router"
        ? detail.item.name
        : detail.kind === "vpn-server"
          ? detail.item.name
          : detail.kind === "peer"
            ? detail.item.peerName || detail.item.router.name
            : detail.kind === "customer"
              ? detail.item.user.name || detail.item.user.email || "Customer impact"
              : detail.kind === "traffic-router"
                ? detail.item.name
                : detail.kind === "traffic-server"
                  ? detail.item.nodeId
                  : detail.item.title;

  return (
    <Modal open={open} title={title} description={`Monitoring context: ${detail.kind.replace(/-/g, " ")}`} onClose={onClose}>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Operational context</CardTitle>
            <CardDescription>Real monitoring metadata associated with the selected item.</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-3 text-sm text-slate-200">
          {detail.kind === "diagnostic" ? (
            <>
              <div className="flex items-center gap-3"><HealthStatusBadge status={detail.item.severity} /><Badge tone="info">{detail.item.resourceType}</Badge></div>
              <p>{detail.item.message}</p>
              <p className="font-mono text-xs text-slate-500">{detail.item.resourceId}</p>
            </>
          ) : null}
          {detail.kind === "activity" ? (
            <>
              <div className="flex items-center gap-3"><HealthStatusBadge status={detail.item.severity} /><Badge tone="info">{detail.item.source}</Badge></div>
              <p>{detail.item.summary}</p>
              <p className="font-mono text-xs text-slate-500">{formatDateTime(detail.item.timestamp)}</p>
            </>
          ) : null}
          {detail.kind === "router" ? <p>{detail.item.customer?.name || "Unassigned customer"} • {detail.item.serverNode} • {detail.item.healthSummary.issues.join(", ") || "No issue list provided"}</p> : null}
          {detail.kind === "vpn-server" ? <p>{detail.item.region} • {detail.item.healthSummary.status} • {detail.item.routerCount} routers</p> : null}
          {detail.kind === "peer" ? <p>{detail.item.router.name} • {detail.item.handshakeState} • {formatDateTime(detail.item.lastHandshake)}</p> : null}
          {detail.kind === "customer" ? <p>{detail.item.offlineRouters} offline routers • {detail.item.unhealthyRouters} unhealthy routers</p> : null}
          {detail.kind === "traffic-router" ? <p>Total transfer: {detail.item.totalTransferBytes.toLocaleString()} bytes</p> : null}
          {detail.kind === "traffic-server" ? <p>Total server transfer: {detail.item.totalTransferBytes.toLocaleString()} bytes</p> : null}
        </div>
      </Card>
    </Modal>
  );
}
