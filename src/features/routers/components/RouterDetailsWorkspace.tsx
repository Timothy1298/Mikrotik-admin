import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { RouterActivityPanel } from "@/features/routers/components/RouterActivityPanel";
import { RouterApiAccessPanel } from "@/features/routers/components/RouterApiAccessPanel";
import { RouterConnectivityPanel } from "@/features/routers/components/RouterConnectivityPanel";
import { RouterCustomerPanel } from "@/features/routers/components/RouterCustomerPanel";
import { RouterFlagsPanel } from "@/features/routers/components/RouterFlagsPanel";
import { RouterLiveHealthPanel } from "@/features/routers/components/RouterLiveHealthPanel";
import { RouterMonitoringPanel } from "@/features/routers/components/RouterMonitoringPanel";
import { RouterNotesPanel } from "@/features/routers/components/RouterNotesPanel";
import { RouterPingPanel } from "@/features/routers/components/RouterPingPanel";
import { RouterPortsPanel } from "@/features/routers/components/RouterPortsPanel";
import { RouterProvisioningPanel } from "@/features/routers/components/RouterProvisioningPanel";
import { RouterSetupBadge } from "@/features/routers/components/RouterSetupBadge";
import { RouterStatusBadge } from "@/features/routers/components/RouterStatusBadge";
import { RouterTerminalPanel } from "@/features/routers/components/RouterTerminalPanel";
import { RouterTunnelHealthBadge } from "@/features/routers/components/RouterTunnelHealthBadge";
import { RouterWireGuardPanel } from "@/features/routers/components/RouterWireGuardPanel";
import { NetworkTopologyViewer } from "@/features/routers/components/NetworkTopologyViewer";
import { RouterHotspotPanel } from "@/features/hotspot";
import { RouterFirewallPanel } from "@/features/firewall";
import { RouterNetworkPanel } from "@/features/network-config";
import { RouterPppoePanel } from "@/features/pppoe";
import { RouterQueuesPanel } from "@/features/queues";
import { RouterBackupsPanel } from "@/features/backups";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { appRoutes } from "@/config/routes";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterDetailsWorkspace({
  router,
  showRouteLink = false,
  onDisable,
  onDelete,
  onReactivate,
  onReprovision,
  onReboot,
  onRegenerateSetup,
  onResetPeer,
  onReassignPorts,
  onMoveServer,
  onMarkReviewed,
  onAddNote,
  onAddFlag,
  onRemoveFlag,
}: {
  router: RouterDetail;
  showRouteLink?: boolean;
  onDisable: () => void;
  onDelete: () => void;
  onReactivate: () => void;
  onReprovision: () => void;
  onReboot: () => void;
  onRegenerateSetup: () => void;
  onResetPeer: () => void;
  onReassignPorts: () => void;
  onMoveServer: () => void;
  onMarkReviewed: () => void;
  onAddNote: () => void;
  onAddFlag: () => void;
  onRemoveFlag: (flag: RouterDetail["flags"][number]) => void;
}) {
  const navigate = useNavigate();
  const [liveSection, setLiveSection] = useState<"overview" | "hotspot" | "pppoe" | "wireguard" | "queues" | "firewall" | "network" | "backups" | "terminal" | "topology">("overview");
  const ownerTunnel = router.connectivity.ownerTunnel;

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-text-primary">{router.profile.name}</h2>
              <RouterStatusBadge status={router.profile.status} />
              <RouterSetupBadge status={router.profile.setupStatus} />
              <RouterTunnelHealthBadge status={router.monitoring.health.state} />
              {router.flags.length ? <Badge tone="warning">{router.flags.length} flags</Badge> : null}
            </div>
            <p className="text-sm text-text-secondary">
              {router.profile.id} • {router.customer?.name || "No customer"} • {router.profile.connectionMode === "management_only" ? (router.profile.localAddress || "management-only") : router.profile.serverNode}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Secondary tools</p>
            <div className="flex flex-wrap gap-2">
            {showRouteLink ? <Button variant="outline" onClick={() => navigate(appRoutes.routerDetail(router.id))}>Open full page</Button> : null}
            {router.profile.connectionMode !== "management_only" ? <Button variant="outline" onClick={onRegenerateSetup}>Regenerate setup</Button> : null}
            {router.profile.connectionMode !== "management_only" ? <Button variant="outline" onClick={onResetPeer}>Reset peer</Button> : null}
            {router.profile.connectionMode !== "management_only" ? <Button variant="outline" onClick={onReassignPorts}>Reassign ports</Button> : null}
            <Button onClick={onAddFlag}>Add flag</Button>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Primary actions</p>
          <div className="flex flex-wrap gap-2">
          {router.profile.status === "inactive" ? <Button variant="outline" onClick={onReactivate}>Reactivate router</Button> : <Button variant="danger" onClick={onDisable}>Disable router</Button>}
          <Button variant="danger" onClick={onDelete}>Delete router</Button>
          {router.profile.connectionMode !== "management_only" ? <Button variant="outline" onClick={onReprovision}>Reprovision</Button> : null}
          {router.profile.status !== "inactive" ? <Button variant="outline" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={onReboot}>Reboot</Button> : null}
          {router.profile.connectionMode !== "management_only" ? <Button variant="outline" onClick={onMoveServer}>Move server</Button> : null}
          <Button variant="outline" onClick={onMarkReviewed}>Mark reviewed</Button>
          <Button variant="outline" onClick={onAddNote}>Add note</Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Live workspaces</p>
          <Tabs
            tabs={[
              { label: "Overview", value: "overview" },
              { label: "Network Topology", value: "topology" },
              { label: "Hotspot", value: "hotspot" },
              { label: "PPPoE", value: "pppoe" },
              { label: "WireGuard", value: "wireguard" },
              { label: "Queues", value: "queues" },
              { label: "Firewall", value: "firewall" },
              { label: "Network", value: "network" },
              { label: "Backups", value: "backups" },
              { label: "Terminal", value: "terminal" },
            ]}
            value={liveSection}
            onChange={(value) => setLiveSection(value as "overview" | "hotspot" | "pppoe" | "wireguard" | "queues" | "firewall" | "network" | "backups" | "terminal" | "topology")}
          />
        </div>
      </Card>

      {liveSection === "overview" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Last seen</p><p className="mt-3 text-sm text-text-primary">{formatDateTime(router.monitoring.lastSeen)}</p></div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{router.profile.connectionMode === "management_only" ? "Management host" : "Last handshake"}</p>
              <p className="mt-3 text-sm text-text-primary">{router.profile.connectionMode === "management_only" ? (router.profile.localAddress || "Unavailable") : formatDateTime(router.connectivity.lastHandshake)}</p>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{router.profile.connectionMode === "management_only" ? "Owner tunnel" : "VPN IP"}</p>
              <p className="mt-3 font-mono text-sm text-text-primary">
                {router.profile.connectionMode === "management_only" ? (ownerTunnel?.vpnIp || router.profile.hostname || router.profile.model || router.profile.boardName || "Unavailable") : (router.connectivity.vpnIp || "Unavailable")}
              </p>
              {router.profile.connectionMode === "management_only" && ownerTunnel ? <p className="mt-1 text-xs text-text-muted">{ownerTunnel.serverNode}</p> : null}
            </div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{router.profile.connectionMode === "management_only" ? "Tunnel handshake" : "Active ports"}</p>
              <p className="mt-3 text-sm text-text-primary">
                {router.profile.connectionMode === "management_only"
                  ? (ownerTunnel ? formatDateTime(ownerTunnel.lastHandshake) : (router.profile.openPorts.length ? router.profile.openPorts.join(", ") : "Unavailable"))
                  : [router.accessPorts.winbox.publicPort, router.accessPorts.ssh.publicPort, router.accessPorts.api.publicPort].filter(Boolean).length}
              </p>
              {router.profile.connectionMode === "management_only" && ownerTunnel ? <p className="mt-1 text-xs text-text-muted">{ownerTunnel.handshakeState}</p> : null}
            </div>
          </div>
          <RouterLiveHealthPanel routerId={router.profile.id} />
          <RouterCustomerPanel router={router} />
          <RouterConnectivityPanel router={router} />
          <RouterApiAccessPanel router={router} />
          <RouterPortsPanel router={router} />
          <RouterMonitoringPanel router={router} />
          <RouterPingPanel router={router} />
          <RouterProvisioningPanel router={router} />
          <RouterFlagsPanel router={router} onRemoveFlag={onRemoveFlag} />
          <RouterNotesPanel router={router} />
          <RouterActivityPanel router={router} />
        </>
      ) : null}
      {liveSection === "topology" ? <NetworkTopologyViewer routerId={router.profile.id} /> : null}
      {liveSection === "hotspot" ? <RouterHotspotPanel routerId={router.profile.id} /> : null}
      {liveSection === "pppoe" ? <RouterPppoePanel routerId={router.profile.id} /> : null}
      {liveSection === "wireguard" ? <RouterWireGuardPanel router={router} /> : null}
      {liveSection === "queues" ? <RouterQueuesPanel routerId={router.profile.id} /> : null}
      {liveSection === "firewall" ? <RouterFirewallPanel routerId={router.profile.id} /> : null}
      {liveSection === "network" ? <RouterNetworkPanel routerId={router.profile.id} /> : null}
      {liveSection === "backups" ? <RouterBackupsPanel routerId={router.profile.id} /> : null}
      {liveSection === "terminal" ? <RouterTerminalPanel routerId={router.profile.id} /> : null}
    </div>
  );
}
