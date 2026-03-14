import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { appRoutes } from "@/config/routes";
import { VpnServerFlagsPanel } from "@/features/vpn-servers/components/VpnServerFlagsPanel";
import { VpnServerHealthBadge } from "@/features/vpn-servers/components/VpnServerHealthBadge";
import { VpnServerHealthPanel } from "@/features/vpn-servers/components/VpnServerHealthPanel";
import { VpnServerLoadBadge } from "@/features/vpn-servers/components/VpnServerLoadBadge";
import { VpnServerMaintenanceBadge } from "@/features/vpn-servers/components/VpnServerMaintenanceBadge";
import { VpnServerNotesPanel } from "@/features/vpn-servers/components/VpnServerNotesPanel";
import { VpnServerPeersPanel } from "@/features/vpn-servers/components/VpnServerPeersPanel";
import { VpnServerRoutersPanel } from "@/features/vpn-servers/components/VpnServerRoutersPanel";
import { VpnServerStatusBadge } from "@/features/vpn-servers/components/VpnServerStatusBadge";
import { VpnServerTrafficPanel } from "@/features/vpn-servers/components/VpnServerTrafficPanel";
import type { VpnServerDetail, VpnServerPeerItem, VpnServerRouterItem } from "@/features/vpn-servers/types/vpn-server.types";
import { formatDateTime } from "@/lib/formatters/date";
import { useNavigate } from "react-router-dom";

export function VpnServerDetailsWorkspace({
  server,
  routers,
  peers,
  routersLoading,
  peersLoading,
  showRouteLink = false,
  onDisable,
  onReactivate,
  onEnableMaintenance,
  onClearMaintenance,
  onMigrateRouters,
  onRestartVpn,
  onReconcile,
  onMarkReviewed,
  onAddNote,
  onAddFlag,
  onRemoveFlag,
}: {
  server: VpnServerDetail;
  routers: VpnServerRouterItem[];
  peers: VpnServerPeerItem[];
  routersLoading?: boolean;
  peersLoading?: boolean;
  showRouteLink?: boolean;
  onDisable: () => void;
  onReactivate: () => void;
  onEnableMaintenance: () => void;
  onClearMaintenance: () => void;
  onMigrateRouters: () => void;
  onRestartVpn: () => void;
  onReconcile: () => void;
  onMarkReviewed: () => void;
  onAddNote: () => void;
  onAddFlag: () => void;
  onRemoveFlag: (flag: VpnServerDetail["flags"][number]) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-100">{server.profile.name}</h2>
              <VpnServerStatusBadge status={server.profile.status} />
              <VpnServerHealthBadge status={server.health.status} />
              <VpnServerMaintenanceBadge active={server.profile.maintenanceMode} />
              <VpnServerLoadBadge overloaded={server.loadCapacity.overloaded} nearCapacity={server.loadCapacity.nearCapacity} />
              {server.flags.length ? <Badge tone="warning">{server.flags.length} flags</Badge> : null}
            </div>
            <p className="text-sm text-slate-400">{server.profile.nodeId} • {server.profile.region} • {server.profile.hostname || server.profile.endpoint || "No hostname"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {showRouteLink ? <Button variant="outline" onClick={() => navigate(appRoutes.vpnServerDetail(server.id))}>Open full page</Button> : null}
            <Button variant="outline" onClick={onRestartVpn}>Restart VPN</Button>
            <Button variant="outline" onClick={onReconcile}>Reconcile</Button>
            <Button variant="outline" onClick={onMigrateRouters}>Migrate routers</Button>
            <Button onClick={onAddFlag}>Add flag</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Routers</p><p className="mt-3 text-sm text-slate-100">{server.attachedRoutersCount}</p></div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Peers</p><p className="mt-3 text-sm text-slate-100">{server.attachedPeersCount}</p></div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Online routers</p><p className="mt-3 text-sm text-slate-100">{server.onlineRoutersCount}</p></div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Created</p><p className="mt-3 text-sm text-slate-100">{formatDateTime(server.profile.createdAt)}</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!server.profile.enabled ? <Button variant="outline" onClick={onReactivate}>Reactivate server</Button> : <Button variant="danger" onClick={onDisable}>Disable server</Button>}
          {server.profile.maintenanceMode ? <Button variant="outline" onClick={onClearMaintenance}>Clear maintenance</Button> : <Button variant="outline" onClick={onEnableMaintenance}>Enter maintenance</Button>}
          <Button variant="outline" onClick={onMarkReviewed}>Mark reviewed</Button>
          <Button variant="outline" onClick={onAddNote}>Add note</Button>
        </div>
      </Card>

      <VpnServerHealthPanel server={server} />
      <VpnServerTrafficPanel server={server} />
      <VpnServerRoutersPanel items={routers} loading={routersLoading} />
      <VpnServerPeersPanel items={peers} loading={peersLoading} />
      <VpnServerFlagsPanel server={server} onRemoveFlag={onRemoveFlag} />
      <VpnServerNotesPanel server={server} />
    </div>
  );
}
