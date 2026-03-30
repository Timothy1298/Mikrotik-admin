import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { InlineError } from "@/components/feedback/InlineError";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { useRouterConnectivity } from "@/features/routers/hooks/useRouter";
import { RouterTunnelHealthBadge } from "@/features/routers/components/RouterTunnelHealthBadge";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterConnectivityPanel({ router }: { router: RouterDetail }) {
  const connectivityQuery = useRouterConnectivity(router.id);
  const connectivity = connectivityQuery.data || router.connectivity;
  const managementOnly = router.profile.connectionMode === "management_only";
  const ownerTunnel = connectivity.ownerTunnel;

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
        <RefreshButton loading={connectivityQuery.isFetching} onClick={() => void connectivityQuery.refetch()} />
      </CardHeader>
      {connectivityQuery.isPending ? <SectionLoader /> : null}
      {connectivityQuery.isError ? <InlineError message="Unable to load router connectivity." /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{managementOnly ? "Connection state" : "Tunnel state"}</p>
          <div className="mt-3"><RouterTunnelHealthBadge status={connectivity.tunnelStatus} /></div>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{managementOnly ? "Management host" : "Server node"}</p>
          <p className="mt-3 text-sm font-medium text-text-primary">{managementOnly ? (router.discovery.localAddress || connectivity.vpnIp || "Unavailable") : connectivity.serverNode}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{managementOnly ? "Owner tunnel" : "VPN IP"}</p>
          <p className="mt-3 font-mono text-sm text-text-primary">
            {managementOnly ? (ownerTunnel?.vpnIp || router.discovery.hostname || router.profile.model || router.profile.boardName || "Unavailable") : (connectivity.vpnIp || "Unavailable")}
          </p>
          {managementOnly && ownerTunnel ? <p className="mt-1 text-xs text-text-muted">{ownerTunnel.serverNode} • {ownerTunnel.sourceRouterName || "Owner router"}</p> : null}
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{managementOnly ? "Tunnel handshake" : "Last handshake"}</p>
          <p className="mt-3 text-sm text-text-primary">{managementOnly ? formatDateTime(ownerTunnel?.lastHandshake || router.apiAccess.lastSuccessAt) : formatDateTime(connectivity.lastHandshake)}</p>
          <p className="mt-1 text-xs text-text-muted">{managementOnly ? (ownerTunnel?.handshakeState || router.apiAccess.state) : connectivity.handshakeState}</p>
        </div>
      </div>
      {managementOnly && ownerTunnel ? (
        <div className="mt-4 rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Owner WireGuard Tunnel</p>
              <p className="mt-2 text-sm text-text-primary">
                {ownerTunnel.sourceRouterName || "Owner router"} • {ownerTunnel.serverNode}
              </p>
            </div>
            <RouterTunnelHealthBadge status={ownerTunnel.tunnelStatus} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Peer</p>
              <p className="mt-2 font-mono text-sm text-text-primary">{ownerTunnel.peerName || "Unavailable"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">VPN IP</p>
              <p className="mt-2 font-mono text-sm text-text-primary">{ownerTunnel.vpnIp || "Unavailable"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Handshake</p>
              <p className="mt-2 text-sm text-text-primary">{formatDateTime(ownerTunnel.lastHandshake)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">State</p>
              <p className="mt-2 text-sm text-text-primary">{ownerTunnel.handshakeState}</p>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
