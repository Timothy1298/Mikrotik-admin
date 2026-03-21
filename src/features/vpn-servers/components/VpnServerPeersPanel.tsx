import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { appRoutes } from "@/config/routes";
import type { VpnServerPeerItem } from "@/features/vpn-servers/types/vpn-server.types";
import { formatBytes } from "@/lib/formatters/bytes";

dayjs.extend(relativeTime);

export function VpnServerPeersPanel({ items, loading, onRefresh }: { items: VpnServerPeerItem[]; loading?: boolean; onRefresh?: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Peers ({items.length})</CardTitle>
          <CardDescription>Peer distribution and handshake health attached to this server.</CardDescription>
        </div>
        <RefreshButton loading={loading} onClick={onRefresh} />
      </CardHeader>
      <div className="space-y-3">
        {loading ? <p className="text-sm text-text-secondary">Loading peers…</p> : items.length ? items.map((peer) => {
          const healthTone = peer.health === "healthy" || peer.health === "fresh" ? "success" : peer.health === "stale" ? "warning" : "danger";
          return (
            <div key={peer.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-medium text-text-primary">{peer.reference}</p>
                    <span className="inline-flex items-center gap-2 text-xs text-text-secondary">
                      <span className={`h-2.5 w-2.5 rounded-full ${peer.enabled ? "bg-success" : "bg-danger"}`} />
                      <span>{peer.enabled ? "Enabled" : "Disabled"}</span>
                    </span>
                    <Badge tone={healthTone}>{peer.health}</Badge>
                  </div>
                  <p className="text-xs text-text-muted">↓ {formatBytes(peer.transferRx)} / ↑ {formatBytes(peer.transferTx)}</p>
                  <p className="text-xs text-text-secondary">
                    {peer.router ? <Link className="transition hover:text-text-primary" to={appRoutes.routerDetail(peer.router.id)}>{peer.router.name}</Link> : "No linked router"}
                  </p>
                </div>
                <p className="text-xs text-text-muted">{peer.lastHandshake ? dayjs(peer.lastHandshake).fromNow() : "Never"}</p>
              </div>
            </div>
          );
        }) : <EmptyState icon={Wifi} title="No peers are currently attached to this VPN server" description="Peer sessions will appear here once routers or standalone peers are assigned to this node." />}
      </div>
    </Card>
  );
}
