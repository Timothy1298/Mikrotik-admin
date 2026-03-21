import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { appRoutes } from "@/config/routes";
import type { VpnServerDetail, VpnServerTrafficDetail } from "@/features/vpn-servers/types/vpn-server.types";
import { formatBytes } from "@/lib/formatters/bytes";

dayjs.extend(relativeTime);

export function VpnServerTrafficPanel({ server, trafficDetail }: { server: VpnServerDetail; trafficDetail?: VpnServerTrafficDetail }) {
  const traffic = {
    totalTransferRx: trafficDetail?.totalTransferRx ?? server.traffic.totalTransferRx ?? 0,
    totalTransferTx: trafficDetail?.totalTransferTx ?? server.traffic.totalTransferTx ?? 0,
    totalTransferBytes: trafficDetail?.totalTransferBytes ?? server.traffic.totalTransferBytes ?? 0,
    activePeerCount: trafficDetail?.activePeerCount ?? server.traffic.activePeerCount ?? 0,
    totalPeerCount: trafficDetail?.totalPeerCount ?? server.traffic.totalPeerCount ?? 0,
    peerUtilization: trafficDetail?.peerUtilization ?? server.loadCapacity.peerUtilization ?? null,
    routerUtilization: trafficDetail?.routerUtilization ?? server.loadCapacity.routerUtilization ?? null,
  };

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Traffic / load</CardTitle>
          <CardDescription>Transfer totals, active peer counts, and capacity context for this server.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCell label="RX" value={formatBytes(traffic.totalTransferRx)} />
        <MetricCell label="TX" value={formatBytes(traffic.totalTransferTx)} />
        <MetricCell label="Total traffic" value={formatBytes(traffic.totalTransferBytes)} />
        <MetricCell label="Active peers" value={String(traffic.activePeerCount)} />
        <UtilizationCell label="Peer utilization" value={traffic.peerUtilization} />
        <UtilizationCell label="Router utilization" value={traffic.routerUtilization} />
      </div>

      {trafficDetail?.trafficByPeer?.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-text-primary">Per-peer traffic</p>
            <Link className="text-sm text-primary transition hover:text-text-primary" to={appRoutes.vpnServerDetail(server.id)}>
              Show all peers →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-background-border text-xs uppercase tracking-[0.18em] text-text-muted">
                  <th className="px-3 py-3 font-medium">Peer reference</th>
                  <th className="px-3 py-3 font-medium">RX</th>
                  <th className="px-3 py-3 font-medium">TX</th>
                  <th className="px-3 py-3 font-medium">Last handshake</th>
                </tr>
              </thead>
              <tbody>
                {trafficDetail.trafficByPeer.slice(0, 10).map((peer) => (
                  <tr key={peer.peerId} className="border-b border-primary/15 text-text-primary last:border-b-0">
                    <td className="px-3 py-3 font-medium text-text-primary">{peer.reference}</td>
                    <td className="px-3 py-3">{formatBytes(peer.transferRx)}</td>
                    <td className="px-3 py-3">{formatBytes(peer.transferTx)}</td>
                    <td className="px-3 py-3 text-text-secondary">{peer.lastHandshake ? dayjs(peer.lastHandshake).fromNow() : "Never"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-background-border bg-background-panel p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <p className="mt-3 text-sm text-text-primary">{value}</p>
    </div>
  );
}

function UtilizationCell({ label, value }: { label: string; value: number | null }) {
  const tone = value == null ? "neutral" : value >= 90 ? "danger" : value >= 70 ? "warning" : "success";
  return (
    <div className="rounded-2xl border border-background-border bg-background-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{label}</p>
        <Badge tone={tone}>{value != null ? `${Math.round(value)}%` : "—"}</Badge>
      </div>
      <p className="mt-3 text-sm text-text-primary">{value != null ? `${Math.round(value)}%` : "Unavailable"}</p>
    </div>
  );
}
