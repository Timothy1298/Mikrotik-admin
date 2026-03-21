import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { RouterTunnelHealthBadge } from "@/features/routers/components/RouterTunnelHealthBadge";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterConnectivityPanel({ router }: { router: RouterDetail }) {
  const connectivity = router.connectivity;
  const managementOnly = router.profile.connectionMode === "management_only";

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{managementOnly ? "Connectivity / management" : "Connectivity / WireGuard"}</CardTitle>
          <CardDescription>
            {managementOnly
              ? "Local management host, discovery identity, and RouterOS API-backed attachment state."
              : "Peer linkage, server assignment, handshake state, and transfer summaries."}
          </CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{managementOnly ? "Connection state" : "Tunnel state"}</p>
          <div className="mt-3"><RouterTunnelHealthBadge status={connectivity.tunnelStatus} /></div>
        </div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{managementOnly ? "Management host" : "Server node"}</p>
          <p className="mt-3 text-sm font-medium text-slate-100">{managementOnly ? (router.discovery.localAddress || connectivity.vpnIp || "Unavailable") : connectivity.serverNode}</p>
        </div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{managementOnly ? "Identity / hostname" : "VPN IP"}</p>
          <p className="mt-3 font-mono text-sm text-slate-100">{managementOnly ? (router.discovery.hostname || router.profile.model || router.profile.boardName || "Unavailable") : (connectivity.vpnIp || "Unavailable")}</p>
        </div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{managementOnly ? "API health" : "Last handshake"}</p>
          <p className="mt-3 text-sm text-slate-100">{managementOnly ? formatDateTime(router.apiAccess.lastSuccessAt) : formatDateTime(connectivity.lastHandshake)}</p>
          <p className="mt-1 text-xs text-slate-500">{managementOnly ? router.apiAccess.state : connectivity.handshakeState}</p>
        </div>
      </div>
    </Card>
  );
}
