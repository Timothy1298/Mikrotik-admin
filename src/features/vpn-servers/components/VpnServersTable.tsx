import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/data-display/DataTable";
import { Dropdown } from "@/components/ui/Dropdown";
import { appRoutes } from "@/config/routes";
import { VpnServerHealthBadge } from "@/features/vpn-servers/components/VpnServerHealthBadge";
import { VpnServerLoadBadge } from "@/features/vpn-servers/components/VpnServerLoadBadge";
import { VpnServerMaintenanceBadge } from "@/features/vpn-servers/components/VpnServerMaintenanceBadge";
import { VpnServerStatusBadge } from "@/features/vpn-servers/components/VpnServerStatusBadge";
import type { VpnServerRow } from "@/features/vpn-servers/types/vpn-server.types";
import { formatDateTime } from "@/lib/formatters/date";

export function VpnServersTable({
  rows,
  onOpenDetails,
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
}: {
  rows: VpnServerRow[];
  onOpenDetails: (row: VpnServerRow) => void;
  onDisable: (row: VpnServerRow) => void;
  onReactivate: (row: VpnServerRow) => void;
  onEnableMaintenance: (row: VpnServerRow) => void;
  onClearMaintenance: (row: VpnServerRow) => void;
  onMigrateRouters: (row: VpnServerRow) => void;
  onRestartVpn: (row: VpnServerRow) => void;
  onReconcile: (row: VpnServerRow) => void;
  onMarkReviewed: (row: VpnServerRow) => void;
  onAddNote: (row: VpnServerRow) => void;
  onAddFlag: (row: VpnServerRow) => void;
}) {
  const navigate = useNavigate();
  const [navigatingServerId, setNavigatingServerId] = useState<string | null>(null);

  const openFullPage = (server: VpnServerRow) => {
    if (navigatingServerId) return;
    setNavigatingServerId(server.id);
    requestAnimationFrame(() => navigate(appRoutes.vpnServerDetail(server.id)));
  };

  const columns = useMemo<ColumnDef<VpnServerRow>[]>(() => [
    {
      header: "Server",
      cell: ({ row }) => (
        <div className="space-y-1">
          <button type="button" className="inline-flex items-center gap-2 font-medium text-slate-100 transition hover:text-brand-100" onClick={(event) => { event.stopPropagation(); openFullPage(row.original); }}>
            {navigatingServerId === row.original.id ? <Loader2 className="h-4 w-4 animate-spin text-brand-100" /> : null}
            {row.original.name}
          </button>
          <p className="font-mono text-xs text-slate-500">{row.original.nodeId}</p>
        </div>
      ),
    },
    { header: "Region", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.region}</span> },
    { header: "Status", cell: ({ row }) => <VpnServerStatusBadge status={row.original.status} /> },
    { header: "Health", cell: ({ row }) => <VpnServerHealthBadge status={row.original.healthSummary.status} /> },
    { header: "Maintenance", cell: ({ row }) => <VpnServerMaintenanceBadge active={row.original.maintenanceMode} /> },
    { header: "Routers", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.onlineRouterCount}/{row.original.routerCount} online</span> },
    { header: "Peers", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.activePeerCount}</span> },
    { header: "Load", cell: ({ row }) => <VpnServerLoadBadge overloaded={row.original.loadCapacitySummary.overloaded} nearCapacity={row.original.loadCapacitySummary.nearCapacity} /> },
    { header: "Last heartbeat", cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{formatDateTime(row.original.lastHeartbeatAt)}</span> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown
          items={[
            { label: "Open full page", onClick: () => openFullPage(row.original) },
            { label: "Open workspace", onClick: () => onOpenDetails(row.original) },
            !row.original.enabled ? { label: "Reactivate server", onClick: () => onReactivate(row.original) } : { label: "Disable server", onClick: () => onDisable(row.original), danger: true },
            row.original.maintenanceMode ? { label: "Clear maintenance", onClick: () => onClearMaintenance(row.original) } : { label: "Enter maintenance", onClick: () => onEnableMaintenance(row.original) },
            { label: "Migrate routers", onClick: () => onMigrateRouters(row.original) },
            { label: "Restart VPN", onClick: () => onRestartVpn(row.original) },
            { label: "Reconcile", onClick: () => onReconcile(row.original) },
            { label: "Mark reviewed", onClick: () => onMarkReviewed(row.original) },
            { label: "Add note", onClick: () => onAddNote(row.original) },
            { label: "Flag server", onClick: () => onAddFlag(row.original) },
          ]}
        />
      ),
    },
  ], [navigatingServerId, navigate, onAddFlag, onAddNote, onClearMaintenance, onDisable, onEnableMaintenance, onMarkReviewed, onMigrateRouters, onOpenDetails, onReactivate, onReconcile, onRestartVpn]);

  return <DataTable data={rows} columns={columns} onRowClick={openFullPage} emptyTitle="No VPN servers found" emptyDescription="Adjust your filters or add a server to populate the infrastructure directory." />;
}
