import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { HealthStatusBadge } from "@/features/monitoring/components/HealthStatusBadge";
import type { VpnServerRow } from "@/features/vpn-servers/types/vpn-server.types";
import { formatDateTime } from "@/lib/formatters/date";

export function VpnServerHealthTable({ rows, onOpen }: { rows: VpnServerRow[]; onOpen: (row: VpnServerRow) => void }) {
  const columns = useMemo<ColumnDef<VpnServerRow>[]>(() => [
    { header: "Server", cell: ({ row }) => <div><p className="font-medium text-text-primary">{row.original.name}</p><p className="font-mono text-xs text-text-muted">{row.original.nodeId}</p></div> },
    { header: "Region", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.region}</span> },
    { header: "Health", cell: ({ row }) => <HealthStatusBadge status={row.original.healthSummary.status} /> },
    { header: "Status", cell: ({ row }) => <HealthStatusBadge status={row.original.status} /> },
    { header: "Maintenance", cell: ({ row }) => <HealthStatusBadge status={row.original.maintenanceMode ? "maintenance" : "active"} /> },
    { header: "Routers", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.routerCount}</span> },
    { header: "Peers", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.activePeerCount}</span> },
    { header: "Heartbeat", cell: ({ row }) => <span className="font-mono text-xs text-text-secondary">{formatDateTime(row.original.lastHeartbeatAt)}</span> },
  ], []);

  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No VPN servers found" emptyDescription="No VPN servers matched the current monitoring filters." />;
}
