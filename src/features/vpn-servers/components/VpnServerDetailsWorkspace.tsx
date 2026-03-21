import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { appRoutes } from "@/config/routes";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { VpnServerActivityPanel } from "@/features/vpn-servers/components/VpnServerActivityPanel";
import { VpnServerDiagnosticsPanel } from "@/features/vpn-servers/components/VpnServerDiagnosticsPanel";
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
import type { VpnServerDetail, VpnServerPeerItem, VpnServerRouterItem, VpnServerTrafficDetail } from "@/features/vpn-servers/types/vpn-server.types";
import { formatDateTime } from "@/lib/formatters/date";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";
import { useNavigate } from "react-router-dom";

export function VpnServerDetailsWorkspace({
  server,
  routers,
  peers,
  trafficDetail,
  routersLoading,
  peersLoading,
  showRouteLink = false,
  onRefreshRouters,
  onRefreshPeers,
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
  trafficDetail?: VpnServerTrafficDetail;
  routersLoading?: boolean;
  peersLoading?: boolean;
  showRouteLink?: boolean;
  onRefreshRouters?: () => void;
  onRefreshPeers?: () => void;
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
  const { data: user } = useCurrentUser(true);
  const canManageServers = can(user, permissions.vpnServersManage);

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-text-primary">{server.profile.name}</h2>
              <VpnServerStatusBadge status={server.profile.status} />
              <VpnServerHealthBadge status={server.health.status} />
              <VpnServerMaintenanceBadge active={server.profile.maintenanceMode} />
              <VpnServerLoadBadge overloaded={server.loadCapacity.overloaded} nearCapacity={server.loadCapacity.nearCapacity} />
              {server.flags.length ? <Badge tone="warning">{server.flags.length} flags</Badge> : null}
            </div>
            <p className="text-sm text-text-secondary">{server.profile.nodeId} • {server.profile.region} • {server.profile.hostname || server.profile.endpoint || "No hostname"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {showRouteLink ? <Button variant="outline" onClick={() => navigate(appRoutes.vpnServerDetail(server.id))}>Open full page</Button> : null}
            {canManageServers ? <Button variant="outline" onClick={onRestartVpn}>Restart VPN</Button> : null}
            {canManageServers ? <Button variant="outline" onClick={onReconcile}>Reconcile</Button> : null}
            {canManageServers ? <Button variant="outline" onClick={onMigrateRouters}>Migrate routers</Button> : null}
            <Button onClick={onAddFlag}>Add flag</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Routers</p><p className="mt-3 text-sm text-text-primary">{server.attachedRoutersCount}</p></div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Peers</p><p className="mt-3 text-sm text-text-primary">{server.attachedPeersCount}</p></div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Online routers</p><p className="mt-3 text-sm text-text-primary">{server.onlineRoutersCount}</p></div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Created</p><p className="mt-3 text-sm text-text-primary">{formatDateTime(server.profile.createdAt)}</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageServers ? (!server.profile.enabled ? <Button variant="outline" onClick={onReactivate}>Reactivate server</Button> : <Button variant="danger" onClick={onDisable}>Disable server</Button>) : null}
          {canManageServers ? (server.profile.maintenanceMode ? <Button variant="outline" onClick={onClearMaintenance}>Clear maintenance</Button> : <Button variant="outline" onClick={onEnableMaintenance}>Enter maintenance</Button>) : null}
          <Button variant="outline" onClick={onMarkReviewed}>Mark reviewed</Button>
          <Button variant="outline" onClick={onAddNote}>Add note</Button>
        </div>
      </Card>

      <VpnServerHealthPanel server={server} />
      <VpnServerTrafficPanel server={server} trafficDetail={trafficDetail} />
      <VpnServerDiagnosticsPanel serverId={server.profile.id} />
      <VpnServerRoutersPanel items={routers} loading={routersLoading} onRefresh={onRefreshRouters} />
      <VpnServerPeersPanel items={peers} loading={peersLoading} onRefresh={onRefreshPeers} />
      <VpnServerActivityPanel serverId={server.profile.id} />
      <VpnServerFlagsPanel server={server} onRemoveFlag={onRemoveFlag} />
      <VpnServerNotesPanel server={server} />
    </div>
  );
}
