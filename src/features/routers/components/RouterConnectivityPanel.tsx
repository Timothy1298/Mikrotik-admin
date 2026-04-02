import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { InlineError } from "@/components/feedback/InlineError";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { useRouterConnectivity } from "@/features/routers/hooks/useRouter";
import { RouterTunnelHealthBadge } from "@/features/routers/components/RouterTunnelHealthBadge";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

type EndpointContractState = NonNullable<RouterDetail["connectivity"]["endpointContract"]>["state"];

function EndpointContractBadge({ state = "unknown" }: { state?: EndpointContractState }) {
  const styles = {
    unknown: "border-slate-500/20 bg-slate-500/10 text-text-secondary",
    local_only: "border-warning/25 bg-warning/10 text-primary",
    tunnel_ready: "border-primary/25 bg-primary/10 text-primary",
    verified_local: "border-success/25 bg-success/10 text-success",
    verified_wireguard: "border-success/25 bg-success/10 text-success",
    mismatch: "border-danger/25 bg-danger/10 text-danger",
    conflict: "border-danger/25 bg-danger/10 text-danger",
  } as const;

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${styles[state]}`}>{state.replace(/_/g, " ")}</span>;
}

export function RouterConnectivityPanel({ router, anchorId }: { router: RouterDetail; anchorId?: string }) {
  const connectivityQuery = useRouterConnectivity(router.id);
  const connectivity = connectivityQuery.data || router.connectivity;
  const managementOnly = router.profile.connectionMode === "management_only";
  const ownerTunnel = connectivity.ownerTunnel;

  return (
    <div id={anchorId}>
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
      <div className="mt-4 rounded-2xl border border-background-border bg-background-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Endpoint contract</p>
            <p className="mt-2 text-sm text-text-primary">
              {connectivity.endpointContract?.expectedIdentity || router.profile.hostname || router.profile.name}
              {connectivity.endpointContract?.expectedSerial ? ` • ${connectivity.endpointContract.expectedSerial}` : ""}
            </p>
          </div>
          <EndpointContractBadge state={connectivity.endpointContract?.state} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Verified endpoint</p>
            <p className="mt-2 font-mono text-sm text-text-primary">{connectivity.endpointContract?.verifiedEndpointHost || "Not verified"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Transport</p>
            <p className="mt-2 text-sm text-text-primary">{connectivity.endpointContract?.verifiedTransport || "Unknown"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Verified at</p>
            <p className="mt-2 text-sm text-text-primary">{formatDateTime(connectivity.endpointContract?.verifiedAt || null)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Mismatch</p>
            <p className="mt-2 text-sm text-text-primary">{connectivity.endpointContract?.mismatchReason || "None"}</p>
          </div>
        </div>
        {connectivity.endpoints?.length ? (
          <div className="mt-4 space-y-3">
            {connectivity.endpoints.map((endpoint) => (
              <div key={endpoint.id} className="rounded-2xl border border-background-border bg-black/10 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-text-primary">{endpoint.kind}{endpoint.derived ? " • derived" : ""}</p>
                    <p className="mt-1 font-mono text-xs text-text-muted">{endpoint.host}:{endpoint.port} • {endpoint.transport}</p>
                  </div>
                  <div className="text-right text-xs text-text-muted">
                    <p>{endpoint.health}</p>
                    <p>{endpoint.failureType || "no failure recorded"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
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
    </div>
  );
}
