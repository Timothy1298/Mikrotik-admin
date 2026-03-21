import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { HealthStatusBadge } from "@/features/monitoring/components/HealthStatusBadge";
import type { MonitoringDetailItem } from "@/features/monitoring/types/monitoring.types";
import { appRoutes } from "@/config/routes";
import { formatBytes } from "@/lib/formatters/bytes";
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
        <div className="space-y-4 text-sm text-text-primary">
          {detail.kind === "diagnostic" ? (
            <>
              <div className="flex items-center gap-3">
                <HealthStatusBadge status={detail.item.severity} />
                <Badge tone="info">{detail.item.resourceType}</Badge>
              </div>
              <p>{detail.item.message}</p>
              <p className="font-mono text-xs text-text-muted">{detail.item.resourceId}</p>
            </>
          ) : null}

          {detail.kind === "activity" ? (
            <>
              <div className="flex items-center gap-3">
                <HealthStatusBadge status={detail.item.severity} />
                <Badge tone="info">{detail.item.source}</Badge>
                {detail.item.resource?.type ? <Badge tone="neutral">{detail.item.resource.type}</Badge> : null}
              </div>
              <p>{detail.item.summary}</p>
              {detail.item.actor ? <p className="text-text-secondary">Actor: {detail.item.actor.name || detail.item.actor.email || detail.item.actor.id}</p> : null}
              {detail.item.resource ? <p className="text-text-secondary">Resource: {detail.item.resource.name || detail.item.resource.type} ({detail.item.resource.id})</p> : null}
              <p className="font-mono text-xs text-text-muted">{formatDateTime(detail.item.timestamp)}</p>
            </>
          ) : null}

          {detail.kind === "router" ? (
            <div className="space-y-2">
              <p>{detail.item.customer?.name || "Unassigned customer"} • {detail.item.serverNode}</p>
              <p className="font-mono text-xs text-text-muted">{detail.item.vpnIp}</p>
              <p>Connection: <span className="text-text-primary">{detail.item.connectionStatus}</span> • Setup: <span className="text-text-primary">{detail.item.setupStatus}</span></p>
              <div className="flex flex-wrap gap-2">
                {(detail.item.healthSummary.issues || []).length ? detail.item.healthSummary.issues.map((issue) => <Badge key={issue} tone="warning">{issue.replace(/_/g, " ")}</Badge>) : <Badge tone="success">No active issues</Badge>}
              </div>
              <p className="text-text-secondary">Last seen: {formatDateTime(detail.item.lastSeen)} • Last handshake: {formatDateTime(detail.item.lastHandshake)}</p>
            </div>
          ) : null}

          {detail.kind === "vpn-server" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <HealthStatusBadge status={detail.item.healthSummary.status} />
                {detail.item.loadCapacitySummary.overloaded ? <Badge tone="danger">Overloaded</Badge> : detail.item.loadCapacitySummary.nearCapacity ? <Badge tone="warning">Near capacity</Badge> : <Badge tone="success">Stable load</Badge>}
              </div>
              <p>{detail.item.region} • {detail.item.nodeId}</p>
              <p>{detail.item.routerCount} routers • {detail.item.activePeerCount} peers</p>
              <p className="text-text-secondary">Last heartbeat: {formatDateTime(detail.item.lastHeartbeatAt)}</p>
            </div>
          ) : null}

          {detail.kind === "peer" ? (
            <div className="space-y-2">
              <p>Peer: {detail.item.peerName || "Unknown peer"}</p>
              <p>
                Linked router:{" "}
                <Link className="text-primary transition hover:text-text-primary" to={appRoutes.routerDetail(detail.item.router.id)}>
                  {detail.item.router.name}
                </Link>
              </p>
              {detail.item.user ? <p>User: {detail.item.user.name || detail.item.user.email || detail.item.user.id}</p> : null}
              <div className="flex items-center gap-3">
                <HealthStatusBadge status={detail.item.handshakeState} />
                <HealthStatusBadge status={detail.item.enabled ? "enabled" : "disabled"} />
              </div>
              <p>RX: {formatBytes(detail.item.transferRx)} • TX: {formatBytes(detail.item.transferTx)}</p>
              <p className="text-text-secondary">Last handshake: {formatDateTime(detail.item.lastHandshake)}</p>
            </div>
          ) : null}

          {detail.kind === "customer" ? (
            <div className="space-y-2">
              <p>{detail.item.user.name || detail.item.user.email || detail.item.user.id}</p>
              <div className="flex items-center gap-2">
                <Badge tone={detail.item.user.isActive ? "success" : "warning"}>{detail.item.user.isActive ? "Active" : "Inactive"}</Badge>
                <Badge tone={detail.item.affectedByServer ? "danger" : "info"}>{detail.item.affectedByServer ? "Server issue linked" : "No server issue linked"}</Badge>
              </div>
              <p>Offline routers: {detail.item.offlineRouters}</p>
              <p>Unhealthy routers: {detail.item.unhealthyRouters}</p>
              <p>Provisioning failures: {detail.item.failedProvisioningRouters}</p>
              <p>Stale routers: {detail.item.staleRouters}</p>
            </div>
          ) : null}

          {detail.kind === "traffic-router" ? (
            <div className="space-y-2">
              <p>{detail.item.name}</p>
              <p>Server: {detail.item.serverNode}</p>
              <p>Customer: {detail.item.user?.name || detail.item.user?.email || "Unknown"}</p>
              <p>Ingress: {formatBytes(detail.item.transferRx)}</p>
              <p>Egress: {formatBytes(detail.item.transferTx)}</p>
              <p>Total: {formatBytes(detail.item.totalTransferBytes)}</p>
            </div>
          ) : null}

          {detail.kind === "traffic-server" ? (
            <div className="space-y-2">
              <p>Node ID: {detail.item.nodeId}</p>
              <p>Ingress: {formatBytes(detail.item.transferRx)}</p>
              <p>Egress: {formatBytes(detail.item.transferTx)}</p>
              <p>Total: {formatBytes(detail.item.totalTransferBytes)}</p>
            </div>
          ) : null}
        </div>
      </Card>
    </Modal>
  );
}
