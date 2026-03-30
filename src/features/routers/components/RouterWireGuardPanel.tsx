import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { appRoutes } from "@/config/routes";
import { useDiscoverRouterDownstreamMikrotiks, useRouterDownstreamMikrotiks, useTrackRouterRuntimePeer } from "@/features/routers/hooks/useRouter";
import { RouterTunnelHealthBadge } from "@/features/routers/components/RouterTunnelHealthBadge";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { formatBytes } from "@/lib/formatters/bytes";
import { formatDateTime } from "@/lib/formatters/date";

function renderAllowedIps(value: string | string[] | null | undefined) {
  if (!value) return "Unavailable";
  return Array.isArray(value) ? value.join(", ") : value;
}

function isRelativeAge(value: string | null | undefined) {
  return Boolean(value && /^[0-9]+[smhdw]([0-9]+[smhdw])*$/i.test(value.trim()));
}

function buildSuggestedPeerName(routerName: string, interfaceName: string | null | undefined, index: number) {
  const normalizedRouter = routerName.trim().replace(/\s+/g, "-").toLowerCase();
  const normalizedInterface = String(interfaceName || `peer-${index + 1}`).trim().replace(/\s+/g, "-").toLowerCase();
  return `${normalizedRouter}-${normalizedInterface}`;
}

export function RouterWireGuardPanel({ router }: { router: RouterDetail }) {
  const navigate = useNavigate();
  const trackPeerMutation = useTrackRouterRuntimePeer();
  const downstreamDiscoveryMutation = useDiscoverRouterDownstreamMikrotiks();
  const downstreamDiscoveryQuery = useRouterDownstreamMikrotiks(router.id);
  const [trackingPeerId, setTrackingPeerId] = useState<string | null>(null);
  const [trackName, setTrackName] = useState("");
  const [trackReason, setTrackReason] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [peerSearch, setPeerSearch] = useState("");
  const [peerFilter, setPeerFilter] = useState<"all" | "tracked" | "untracked">("all");
  const [discoveryMaxProbeTargets, setDiscoveryMaxProbeTargets] = useState("48");
  const [discoveryAllowedSubnets, setDiscoveryAllowedSubnets] = useState("");
  const [discoveryExcludedSubnets, setDiscoveryExcludedSubnets] = useState("");

  const wireguard = router.wireguard ?? {
    mode: router.profile.connectionMode === "management_only" ? "owner_tunnel" : "router_tunnel",
    available: false,
    primaryTunnel: null,
    sharedDevices: [],
    sharedDeviceCount: 0,
    runtime: null,
  };
  const primary = wireguard.primaryTunnel;
  const runtime = wireguard.runtime;
  const trackingSource = wireguard.trackingSource;
  const downstreamDiscovery = downstreamDiscoveryQuery.data || router.downstreamDiscovery;
  const trackingPeer = useMemo(
    () => runtime?.peers.find((peer) => String(peer.id || "") === trackingPeerId) || null,
    [runtime?.peers, trackingPeerId],
  );
  const filteredRuntimePeers = useMemo(() => {
    const items = runtime?.peers || [];
    const search = peerSearch.trim().toLowerCase();

    return items.filter((peer) => {
      if (peerFilter === "tracked" && !peer.trackedDeviceCount) return false;
      if (peerFilter === "untracked" && peer.trackedDeviceCount) return false;
      if (!search) return true;

      const haystack = [
        peer.interface,
        peer.publicKey,
        peer.endpointAddress,
        peer.currentEndpointAddress,
        peer.allowedAddress,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [runtime?.peers, peerFilter, peerSearch]);

  const openTrackModal = (peerId: string, interfaceName: string | null | undefined, index: number) => {
    setTrackingPeerId(peerId);
    setTrackName(buildSuggestedPeerName(router.profile.name, interfaceName, index));
    setTrackReason("");
    setInlineError(null);
  };

  const closeTrackModal = () => {
    setTrackingPeerId(null);
    setTrackName("");
    setTrackReason("");
    setInlineError(null);
  };

  const handleTrackPeer = async () => {
    if (!trackingPeerId) return;
    if (!trackName.trim()) {
      setInlineError("Router name is required.");
      return;
    }

    try {
      await trackPeerMutation.mutateAsync({
        id: router.id,
        peerId: trackingPeerId,
        payload: {
          name: trackName.trim(),
          reason: trackReason.trim() || undefined,
        },
      });
      closeTrackModal();
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to track runtime peer");
    }
  };

  const handleRunDownstreamDiscovery = async (dryRun = false) => {
    const allowedSubnetCidrs = discoveryAllowedSubnets
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const excludeCidrs = discoveryExcludedSubnets
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const parsedMaxProbeTargets = Number(discoveryMaxProbeTargets);

    await downstreamDiscoveryMutation.mutateAsync({
      id: router.id,
      payload: {
        dryRun,
        reason: dryRun
          ? "Preview downstream MikroTik discovery from the WireGuard workspace"
          : "Discover downstream MikroTik routers from the WireGuard workspace",
        enableNeighborDiscovery: true,
        enableRouteInspection: true,
        enableSubnetProbe: true,
        maxProbeTargets: Number.isFinite(parsedMaxProbeTargets) && parsedMaxProbeTargets > 0 ? parsedMaxProbeTargets : 48,
        timeoutMs: 2500,
        allowedSubnetCidrs,
        excludeCidrs,
      },
    });
  };

  return (
    <>
      <Card className="space-y-5">
        <CardHeader>
          <div>
            <CardTitle>WireGuard</CardTitle>
            <CardDescription>
              {router.profile.connectionMode === "management_only"
                ? "WireGuard state from this router and, when available, owner-tunnel context from your platform. Managed sibling devices are listed separately from runtime peers configured on the router."
                : "Direct peer state for this router, plus other managed devices in your platform that resolve to the same peer."}
            </CardDescription>
          </div>
        </CardHeader>

        {!wireguard.available || !primary ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-secondary">
              No WireGuard tunnel context is available for this router yet.
            </div>
            {trackingSource ? (
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Tracked From Runtime Peer</p>
                    <p className="mt-2 text-sm text-text-secondary">
                      This management-only router record was created from a runtime WireGuard peer discovered on another router.
                    </p>
                  </div>
                  {trackingSource.sourceRouterId ? (
                    <Button variant="outline" size="sm" onClick={() => navigate(appRoutes.routerDetail(trackingSource.sourceRouterId))}>
                      Open source router
                    </Button>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Source router</p>
                    <p className="mt-2 text-sm text-text-primary">{trackingSource.sourceRouterName || trackingSource.sourceRouterId}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Peer</p>
                    <p className="mt-2 text-sm text-text-primary">{trackingSource.peerName || "Unavailable"}</p>
                    <p className="mt-1 text-xs text-text-muted break-all">{trackingSource.peerPublicKey || "No public key"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Allowed address</p>
                    <p className="mt-2 text-sm text-text-primary">{trackingSource.allowedAddress || "Unavailable"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Endpoint</p>
                    <p className="mt-2 text-sm text-text-primary">{trackingSource.endpoint || "Unavailable"}</p>
                  </div>
                </div>
                {trackingSource.reason ? (
                  <div className="mt-4 rounded-xl border border-background-border bg-black/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Tracking reason</p>
                    <p className="mt-2 text-sm text-text-secondary">{trackingSource.reason}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <RouterTunnelHealthBadge status={primary.tunnelStatus} />
              <Badge tone={primary.peerEnabled ? "success" : "neutral"}>{primary.peerEnabled ? "peer enabled" : "peer disabled"}</Badge>
              <Badge tone="info">{wireguard.mode === "owner_tunnel" ? "owner tunnel" : "router tunnel"}</Badge>
              <Badge tone="neutral">{wireguard.sharedDeviceCount} sibling devices</Badge>
              <Badge tone="neutral">{runtime?.peers.length || 0} runtime peers</Badge>
            </div>

            <div className="rounded-2xl border border-background-border bg-background-panel p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Tunnel Summary</p>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{wireguard.sharedDeviceCount}</p>
                  <p className="mt-1 text-xs text-text-muted">Managed sibling devices in your platform</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{runtime?.peers.length || 0}</p>
                  <p className="mt-1 text-xs text-text-muted">Runtime peers configured on this router</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{runtime?.interfaces.length || 0}</p>
                  <p className="mt-1 text-xs text-text-muted">Runtime WireGuard interfaces on this router</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Server node</p>
                <p className="mt-3 text-sm text-text-primary">{primary.serverNode}</p>
              </div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">VPN IP</p>
                <p className="mt-3 font-mono text-sm text-text-primary">{primary.vpnIp || "Unavailable"}</p>
              </div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Peer</p>
                <p className="mt-3 font-mono text-sm text-text-primary">{primary.peerName || "Unavailable"}</p>
                <p className="mt-1 text-xs text-text-muted">{primary.publicKeyFingerprint || "No fingerprint"}</p>
              </div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{isRelativeAge(primary.handshakeState) ? "Handshake age" : "Last handshake"}</p>
                <p className="mt-3 text-sm text-text-primary">{isRelativeAge(primary.handshakeState) ? primary.handshakeState : formatDateTime(primary.lastHandshake)}</p>
                <p className="mt-1 text-xs text-text-muted">{isRelativeAge(primary.handshakeState) ? "reported by RouterOS" : primary.handshakeState}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Source router</p>
                <p className="mt-3 text-sm text-text-primary">{primary.sourceRouterName || "Unavailable"}</p>
              </div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Interface</p>
                <p className="mt-3 text-sm text-text-primary">{primary.interfaceName || "Unavailable"}</p>
              </div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Allowed IPs</p>
                <p className="mt-3 text-sm text-text-primary">{renderAllowedIps(primary.allowedIPs)}</p>
              </div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Keepalive / endpoint</p>
                <p className="mt-3 text-sm text-text-primary">{primary.persistentKeepalive ? `${primary.persistentKeepalive}s` : "Unavailable"}</p>
                <p className="mt-1 text-xs text-text-muted">{primary.endpoint || "No endpoint recorded"}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Transfer RX</p>
                <p className="mt-3 text-sm text-text-primary">{formatBytes(primary.transferRx || 0)}</p>
              </div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Transfer TX</p>
                <p className="mt-3 text-sm text-text-primary">{formatBytes(primary.transferTx || 0)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Other Managed Devices Using This Tunnel</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Other router records in your platform that resolve to the same WireGuard peer. Runtime peers configured on this router are listed below in the runtime section and are not counted here.
                </p>
              </div>
              {wireguard.sharedDevices.length ? (
                <div className="space-y-3">
                  {wireguard.sharedDevices.map((device) => (
                    <div key={device.routerId} className="rounded-2xl border border-background-border bg-background-panel p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{device.routerName || device.routerId}</p>
                          <p className="mt-1 text-xs text-text-muted">
                            {device.connectionMode === "management_only" ? "Management only" : "WireGuard managed"} • {device.serverNode}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <RouterTunnelHealthBadge status={device.tunnelStatus} />
                          <Badge tone={device.status === "active" ? "success" : device.status === "offline" ? "warning" : "neutral"}>{device.status}</Badge>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">VPN IP</p>
                          <p className="mt-2 font-mono text-sm text-text-primary">{device.vpnIp || "Unavailable"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Peer</p>
                          <p className="mt-2 text-sm text-text-primary">{device.peerName || "Unavailable"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Last handshake</p>
                          <p className="mt-2 text-sm text-text-primary">{formatDateTime(device.lastHandshake)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Transfer</p>
                          <p className="mt-2 text-sm text-text-primary">RX {formatBytes(device.transferRx || 0)}</p>
                          <p className="mt-1 text-xs text-text-muted">TX {formatBytes(device.transferTx || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-secondary">
                  No other managed router records in your platform are tied to this tunnel.
                </div>
              )}
            </div>
          </>
        )}

        {runtime ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Router Runtime WireGuard</p>
              <p className="mt-1 text-sm text-text-secondary">
                Live WireGuard interfaces and peers queried directly from this router via RouterOS API. These are the actual peers configured on the router and may include networks or systems that are not represented as router records in your platform.
              </p>
            </div>
            {runtime.error ? (
              <div className="rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                {runtime.error}
              </div>
            ) : null}
            {runtime.available ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Interfaces</p>
                  <div className="mt-3 space-y-3">
                    {runtime.interfaces.length ? runtime.interfaces.map((item) => (
                      <div key={item.id || item.name || "interface"} className="rounded-xl border border-background-border bg-black/10 px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-mono text-sm text-text-primary">{item.name || "Unnamed"}</p>
                          <div className="flex gap-2">
                            <Badge tone={item.running && !item.disabled ? "success" : "neutral"}>{item.running && !item.disabled ? "running" : "inactive"}</Badge>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-text-muted">
                          listen {item.listenPort || "—"} • mtu {item.mtu || "—"} • {item.privateKeyConfigured ? "private key set" : "no private key"}
                        </p>
                      </div>
                    )) : <p className="text-sm text-text-muted">No WireGuard interfaces found on this router.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Peers</p>
                  <div className="mt-3 flex flex-col gap-3">
                    <Input
                      value={peerSearch}
                      onChange={(event) => setPeerSearch(event.target.value)}
                      placeholder="Search interface, public key, endpoint, or allowed address"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant={peerFilter === "all" ? "secondary" : "outline"} size="sm" onClick={() => setPeerFilter("all")}>
                        All peers
                      </Button>
                      <Button type="button" variant={peerFilter === "tracked" ? "secondary" : "outline"} size="sm" onClick={() => setPeerFilter("tracked")}>
                        Tracked only
                      </Button>
                      <Button type="button" variant={peerFilter === "untracked" ? "secondary" : "outline"} size="sm" onClick={() => setPeerFilter("untracked")}>
                        Untracked only
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-3">
                    {filteredRuntimePeers.length ? filteredRuntimePeers.map((peer, index) => (
                      <div key={peer.id || peer.publicKey || "peer"} className="rounded-xl border border-background-border bg-black/10 px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-col">
                            <p className="font-mono text-sm text-text-primary">{peer.interface || "Unknown interface"}</p>
                            <p className="mt-1 text-xs text-text-muted">{peer.publicKey || "No public key"}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={peer.disabled ? "neutral" : "success"}>{peer.disabled ? "disabled" : "enabled"}</Badge>
                            <Badge tone="neutral">{peer.trackedDeviceCount || 0} tracked devices</Badge>
                            {peer.id ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openTrackModal(peer.id as string, peer.interface, index)}
                                disabled={Boolean(peer.trackedDeviceCount)}
                              >
                                {peer.trackedDeviceCount ? "Already tracked" : "Track peer"}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-text-muted">
                          endpoint {peer.currentEndpointAddress || peer.endpointAddress || "—"}{peer.currentEndpointPort || peer.endpointPort ? `:${peer.currentEndpointPort || peer.endpointPort}` : ""}
                        </p>
                        <p className="mt-2 text-xs text-text-muted">
                          allowed {peer.allowedAddress || "—"} • keepalive {peer.persistentKeepalive ?? "—"} • handshake age {peer.lastHandshake || "—"}
                        </p>
                        <p className="mt-2 text-xs text-text-muted">
                          RX {formatBytes(peer.rx || 0)} • TX {formatBytes(peer.tx || 0)}
                        </p>
                        {peer.trackedDevices?.length ? (
                          <div className="mt-3 rounded-xl border border-background-border bg-background-panel/70 p-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Tracked managed devices</p>
                            <div className="mt-2 space-y-2">
                              {peer.trackedDevices.map((device) => (
                                <div key={device.routerId} className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
                                  <span>{device.routerName || device.routerId}</span>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span>{device.connectionMode === "management_only" ? "management only" : "wireguard"} • {device.serverNode}</span>
                                    <Button variant="outline" size="sm" onClick={() => navigate(appRoutes.routerDetail(device.routerId))}>
                                      Open tracked device
                                    </Button>
                                    {device.sourceRouterId ? (
                                      <Button variant="outline" size="sm" onClick={() => navigate(appRoutes.routerDetail(device.sourceRouterId || ""))}>
                                        Open source router
                                      </Button>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-text-muted">
                            This runtime peer is not yet represented as a managed router record in your platform.
                          </p>
                        )}
                      </div>
                    )) : <p className="text-sm text-text-muted">{runtime.peers.length ? "No runtime peers matched the current filter." : "No WireGuard peers found on this router."}</p>}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Downstream MikroTik Discovery</p>
              <p className="mt-1 text-sm text-text-secondary">
                Conservative discovery of other MikroTik routers reachable beyond this router over the current WireGuard-managed path. This uses neighbor data, route-aware subnet inference, and targeted management-service verification. It does not assume every host behind the tunnel is visible.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <RefreshButton loading={downstreamDiscoveryQuery.isFetching || downstreamDiscoveryMutation.isPending} onClick={() => void downstreamDiscoveryQuery.refetch()} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleRunDownstreamDiscovery(true)}
                isLoading={downstreamDiscoveryMutation.isPending}
              >
                Dry run
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleRunDownstreamDiscovery(false)}
                isLoading={downstreamDiscoveryMutation.isPending}
              >
                Discover routers
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Max probe targets"
              value={discoveryMaxProbeTargets}
              onChange={(event) => setDiscoveryMaxProbeTargets(event.target.value)}
              placeholder="48"
            />
            <Input
              label="Allowed subnets"
              value={discoveryAllowedSubnets}
              onChange={(event) => setDiscoveryAllowedSubnets(event.target.value)}
              placeholder="10.0.0.0/24, 192.168.100.0/24"
              hint="Optional CIDRs separated by commas or spaces."
            />
            <Input
              label="Excluded subnets"
              value={discoveryExcludedSubnets}
              onChange={(event) => setDiscoveryExcludedSubnets(event.target.value)}
              placeholder="172.16.0.0/24"
              hint="Optional CIDRs separated by commas or spaces."
            />
          </div>

          {downstreamDiscovery ? (
            <div className="space-y-4 rounded-2xl border border-background-border bg-background-panel p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={downstreamDiscovery.status === "completed" ? "success" : downstreamDiscovery.status === "failed" ? "warning" : "info"}>
                  {downstreamDiscovery.status}
                </Badge>
                {downstreamDiscovery.dryRun ? <Badge tone="neutral">dry run</Badge> : null}
                <Badge tone="neutral">{downstreamDiscovery.discoveredRouterCount} routers found</Badge>
                <Badge tone="neutral">{downstreamDiscovery.candidateSubnetCount} candidate subnets</Badge>
                <Badge tone="neutral">{downstreamDiscovery.probedTargetCount} targets probed</Badge>
                {downstreamDiscovery.partialVisibility ? <Badge tone="warning">partial visibility</Badge> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Source router</p>
                  <p className="mt-2 text-sm text-text-primary">{downstreamDiscovery.sourceRouterIdentity || router.profile.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Source tunnel IP</p>
                  <p className="mt-2 font-mono text-sm text-text-primary">{downstreamDiscovery.sourceTunnelIp || "Unavailable"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Methods used</p>
                  <p className="mt-2 text-sm text-text-primary">
                    {downstreamDiscovery.discoveryMethodUsed?.length ? downstreamDiscovery.discoveryMethodUsed.join(", ") : "Unavailable"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Completed</p>
                  <p className="mt-2 text-sm text-text-primary">{formatDateTime(downstreamDiscovery.completedAt || downstreamDiscovery.timestamp)}</p>
                </div>
              </div>

              {downstreamDiscovery.candidateSubnets?.length ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Candidate subnets</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {downstreamDiscovery.candidateSubnets.map((subnet) => (
                      <Badge key={subnet} tone="neutral">{subnet}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {downstreamDiscovery.previewTargets?.length ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Prioritized probe targets</p>
                  <div className="rounded-xl border border-background-border bg-black/10 p-3">
                    <div className="space-y-2">
                      {downstreamDiscovery.previewTargets.slice(0, 24).map((target) => (
                        <div key={`${target.ipAddress}-${target.priority}`} className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
                          <div className="min-w-0">
                            <span className="font-mono text-text-primary">{target.ipAddress}</span>
                            <span>{target.candidateSubnet ? ` • ${target.candidateSubnet}` : ""}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge tone="neutral">p{target.priority}</Badge>
                            {target.sourceMethod.map((method) => (
                              <Badge key={`${target.ipAddress}-${method}`} tone="neutral">{method}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {downstreamDiscovery.previewTargets.length > 24 ? (
                      <p className="mt-3 text-xs text-text-muted">
                        Showing first 24 of {downstreamDiscovery.previewTargets.length} prioritized targets from this run.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {downstreamDiscovery.discoveredRouters?.length ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Discovered downstream MikroTik routers</p>
                  {downstreamDiscovery.discoveredRouters.map((candidate) => (
                    <div key={`${candidate.ipAddress}-${candidate.identity || "candidate"}`} className="rounded-xl border border-background-border bg-black/10 px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm text-text-primary">{candidate.identity || candidate.ipAddress}</p>
                          <p className="mt-1 text-xs text-text-muted">
                            {candidate.vendor || "Unknown vendor"} {candidate.platform ? `• ${candidate.platform}` : ""} {candidate.rosVersion ? `• ROS ${candidate.rosVersion}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={candidate.confidence === "high" ? "success" : candidate.confidence === "medium" ? "info" : "warning"}>
                            {candidate.confidence} confidence
                          </Badge>
                          {candidate.adoptedRouterId ? (
                            <Button variant="outline" size="sm" onClick={() => navigate(appRoutes.routerDetail(candidate.adoptedRouterId || ""))}>
                              Open tracked router
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">IP address</p>
                          <p className="mt-2 font-mono text-sm text-text-primary">{candidate.ipAddress}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Candidate subnet</p>
                          <p className="mt-2 text-sm text-text-primary">{candidate.candidateSubnet || "Unavailable"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Management evidence</p>
                          <p className="mt-2 text-sm text-text-primary">
                            API {candidate.apiReachable ? "yes" : "no"} • SSH {candidate.sshReachable ? "yes" : "no"} • Winbox {candidate.winboxReachable ? "yes" : "no"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Last seen</p>
                          <p className="mt-2 text-sm text-text-primary">{formatDateTime(candidate.lastSeenAt)}</p>
                        </div>
                      </div>
                      {candidate.evidence?.length ? (
                        <div className="mt-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Evidence</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {candidate.evidence.map((item) => (
                              <Badge key={item} tone="neutral">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {candidate.notes ? <p className="mt-3 text-xs text-text-muted">{candidate.notes}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-background-border bg-black/10 px-4 py-3 text-sm text-text-secondary">
                  No downstream MikroTik routers have been confirmed from the latest run. That can still be normal when downstream paths are NATed, routed without management visibility, or management services are closed.
                </div>
              )}

              {downstreamDiscovery.warnings.length ? (
                <div className="rounded-xl border border-warning/20 bg-warning/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Warnings</p>
                  <div className="mt-2 space-y-1 text-sm text-text-secondary">
                    {downstreamDiscovery.warnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                </div>
              ) : null}

              {downstreamDiscovery.errors.length ? (
                <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Errors</p>
                  <div className="mt-2 space-y-1 text-sm text-danger">
                    {downstreamDiscovery.errors.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-secondary">
              No downstream MikroTik discovery run has been recorded for this router yet.
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={Boolean(trackingPeer)}
        title="Track Runtime Peer"
        description="Create a management-only router record tied to this runtime WireGuard peer so it appears as a managed device in the workspace."
        onClose={closeTrackModal}
        maxWidthClass="max-w-xl"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-secondary">
            <p className="font-mono text-text-primary">{trackingPeer?.interface || "Unknown interface"}</p>
            <p className="mt-2 break-all text-xs">{trackingPeer?.publicKey || "No public key"}</p>
          </div>

          <Input
            label="Managed router name"
            value={trackName}
            onChange={(event) => setTrackName(event.target.value)}
            placeholder={trackingPeer ? buildSuggestedPeerName(router.profile.name, trackingPeer.interface, 0) : "tracked-wireguard-peer"}
            hint="If this name already exists for the same owner, the server will automatically append a numeric suffix."
            required
          />

          <Input
            label="Reason"
            value={trackReason}
            onChange={(event) => setTrackReason(event.target.value)}
            placeholder="Optional note for why this peer is being tracked"
          />

          {inlineError ? (
            <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {inlineError}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeTrackModal}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleTrackPeer()} isLoading={trackPeerMutation.isPending}>
              Track peer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
