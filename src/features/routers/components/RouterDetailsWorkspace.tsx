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
import { RouterInterfacesPanel } from "@/features/routers/components/RouterInterfacesPanel";
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
import { RouterHotspotPanel } from "@/features/hotspot";
import { RouterPppoePanel } from "@/features/pppoe";
import { RouterQueuesPanel } from "@/features/queues";
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
  const [liveSection, setLiveSection] = useState<"overview" | "hotspot" | "pppoe" | "queues" | "interfaces">("overview");

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-100">{router.profile.name}</h2>
              <RouterStatusBadge status={router.profile.status} />
              <RouterSetupBadge status={router.profile.setupStatus} />
              <RouterTunnelHealthBadge status={router.monitoring.health.state} />
              {router.flags.length ? <Badge tone="warning">{router.flags.length} flags</Badge> : null}
            </div>
            <p className="text-sm text-slate-400">
              {router.profile.id} • {router.customer?.name || "No customer"} • {router.profile.connectionMode === "management_only" ? (router.profile.localAddress || "management-only") : router.profile.serverNode}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Secondary tools</p>
            <div className="flex flex-wrap gap-2">
            {showRouteLink ? <Button variant="outline" onClick={() => navigate(appRoutes.routerDetail(router.id))}>Open full page</Button> : null}
            {router.profile.connectionMode !== "management_only" ? <Button variant="outline" onClick={onRegenerateSetup}>Regenerate setup</Button> : null}
            {router.profile.connectionMode !== "management_only" ? <Button variant="outline" onClick={onResetPeer}>Reset peer</Button> : null}
            {router.profile.connectionMode !== "management_only" ? <Button variant="outline" onClick={onReassignPorts}>Reassign ports</Button> : null}
            <Button onClick={onAddFlag}>Add flag</Button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Last seen</p><p className="mt-3 text-sm text-slate-100">{formatDateTime(router.monitoring.lastSeen)}</p></div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{router.profile.connectionMode === "management_only" ? "Management host" : "Last handshake"}</p>
            <p className="mt-3 text-sm text-slate-100">{router.profile.connectionMode === "management_only" ? (router.profile.localAddress || "Unavailable") : formatDateTime(router.connectivity.lastHandshake)}</p>
          </div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{router.profile.connectionMode === "management_only" ? "Identity / model" : "VPN IP"}</p>
            <p className="mt-3 font-mono text-sm text-slate-100">
              {router.profile.connectionMode === "management_only" ? (router.profile.hostname || router.profile.model || router.profile.boardName || "Unavailable") : (router.connectivity.vpnIp || "Unavailable")}
            </p>
          </div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{router.profile.connectionMode === "management_only" ? "Discovered open ports" : "Active ports"}</p>
            <p className="mt-3 text-sm text-slate-100">
              {router.profile.connectionMode === "management_only"
                ? (router.profile.openPorts.length ? router.profile.openPorts.join(", ") : "Unavailable")
                : [router.accessPorts.winbox.publicPort, router.accessPorts.ssh.publicPort, router.accessPorts.api.publicPort].filter(Boolean).length}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Primary actions</p>
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
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Live workspaces</p>
          <Tabs
            tabs={[
              { label: "Overview", value: "overview" },
              { label: "Hotspot", value: "hotspot" },
              { label: "PPPoE", value: "pppoe" },
              { label: "Queues", value: "queues" },
              { label: "Interfaces", value: "interfaces" },
            ]}
            value={liveSection}
            onChange={(value) => setLiveSection(value as "overview" | "hotspot" | "pppoe" | "queues" | "interfaces")}
          />
        </div>
      </Card>

      {liveSection === "overview" ? <RouterLiveHealthPanel routerId={router.profile.id} /> : null}
      <RouterCustomerPanel router={router} />
      <RouterConnectivityPanel router={router} />
      <RouterApiAccessPanel router={router} />
      {liveSection === "hotspot" ? <RouterHotspotPanel routerId={router.profile.id} /> : null}
      {liveSection === "pppoe" ? <RouterPppoePanel routerId={router.profile.id} /> : null}
      {liveSection === "queues" ? <RouterQueuesPanel routerId={router.profile.id} /> : null}
      {liveSection === "interfaces" ? <RouterInterfacesPanel routerId={router.profile.id} /> : null}
      <RouterPortsPanel router={router} />
      <RouterMonitoringPanel router={router} />
      <RouterPingPanel router={router} />
      <RouterProvisioningPanel router={router} />
      <RouterFlagsPanel router={router} onRemoveFlag={onRemoveFlag} />
      <RouterNotesPanel router={router} />
      <RouterActivityPanel router={router} />
      <RouterTerminalPanel routerId={router.profile.id} />
    </div>
  );
}
