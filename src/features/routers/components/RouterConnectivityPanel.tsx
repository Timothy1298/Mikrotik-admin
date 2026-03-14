import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { RouterTunnelHealthBadge } from "@/features/routers/components/RouterTunnelHealthBadge";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterConnectivityPanel({ router }: { router: RouterDetail }) {
  const connectivity = router.connectivity;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Connectivity / WireGuard</CardTitle>
          <CardDescription>Peer linkage, server assignment, handshake state, and transfer summaries.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tunnel state</p>
          <div className="mt-3"><RouterTunnelHealthBadge status={connectivity.tunnelStatus} /></div>
        </div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Server node</p>
          <p className="mt-3 text-sm font-medium text-slate-100">{connectivity.serverNode}</p>
        </div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">VPN IP</p>
          <p className="mt-3 font-mono text-sm text-slate-100">{connectivity.vpnIp}</p>
        </div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Last handshake</p>
          <p className="mt-3 text-sm text-slate-100">{formatDateTime(connectivity.lastHandshake)}</p>
          <p className="mt-1 text-xs text-slate-500">{connectivity.handshakeState}</p>
        </div>
      </div>
    </Card>
  );
}
