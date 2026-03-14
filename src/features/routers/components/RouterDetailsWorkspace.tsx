import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RouterActivityPanel } from "@/features/routers/components/RouterActivityPanel";
import { RouterConnectivityPanel } from "@/features/routers/components/RouterConnectivityPanel";
import { RouterCustomerPanel } from "@/features/routers/components/RouterCustomerPanel";
import { RouterFlagsPanel } from "@/features/routers/components/RouterFlagsPanel";
import { RouterMonitoringPanel } from "@/features/routers/components/RouterMonitoringPanel";
import { RouterNotesPanel } from "@/features/routers/components/RouterNotesPanel";
import { RouterPortsPanel } from "@/features/routers/components/RouterPortsPanel";
import { RouterProvisioningPanel } from "@/features/routers/components/RouterProvisioningPanel";
import { RouterSetupBadge } from "@/features/routers/components/RouterSetupBadge";
import { RouterStatusBadge } from "@/features/routers/components/RouterStatusBadge";
import { RouterTunnelHealthBadge } from "@/features/routers/components/RouterTunnelHealthBadge";
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
            <p className="text-sm text-slate-400">{router.profile.id} • {router.customer?.name || "No customer"} • {router.profile.serverNode}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {showRouteLink ? <Button variant="outline" onClick={() => navigate(appRoutes.routerDetail(router.id))}>Open full page</Button> : null}
            <Button variant="outline" onClick={onRegenerateSetup}>Regenerate setup</Button>
            <Button variant="outline" onClick={onResetPeer}>Reset peer</Button>
            <Button variant="outline" onClick={onReassignPorts}>Reassign ports</Button>
            <Button onClick={onAddFlag}>Add flag</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Last seen</p><p className="mt-3 text-sm text-slate-100">{formatDateTime(router.monitoring.lastSeen)}</p></div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Last handshake</p><p className="mt-3 text-sm text-slate-100">{formatDateTime(router.connectivity.lastHandshake)}</p></div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">VPN IP</p><p className="mt-3 font-mono text-sm text-slate-100">{router.connectivity.vpnIp}</p></div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active ports</p><p className="mt-3 text-sm text-slate-100">{[router.accessPorts.winbox.publicPort, router.accessPorts.ssh.publicPort, router.accessPorts.api.publicPort].filter(Boolean).length}</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {router.profile.status === "inactive" ? <Button variant="outline" onClick={onReactivate}>Reactivate router</Button> : <Button variant="danger" onClick={onDisable}>Disable router</Button>}
          <Button variant="danger" onClick={onDelete}>Delete router</Button>
          <Button variant="outline" onClick={onReprovision}>Reprovision</Button>
          <Button variant="outline" onClick={onMoveServer}>Move server</Button>
          <Button variant="outline" onClick={onMarkReviewed}>Mark reviewed</Button>
          <Button variant="outline" onClick={onAddNote}>Add note</Button>
        </div>
      </Card>

      <RouterCustomerPanel router={router} />
      <RouterConnectivityPanel router={router} />
      <RouterPortsPanel router={router} />
      <RouterMonitoringPanel router={router} />
      <RouterProvisioningPanel router={router} />
      <RouterFlagsPanel router={router} onRemoveFlag={onRemoveFlag} />
      <RouterNotesPanel router={router} />
      <RouterActivityPanel router={router} />
    </div>
  );
}
