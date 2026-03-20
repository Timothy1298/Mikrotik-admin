import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { HealthStatusBadge } from "@/features/monitoring/components/HealthStatusBadge";
import type { MonitoringPeerRow } from "@/features/monitoring/types/monitoring.types";
import { formatBytes } from "@/lib/formatters/bytes";
import { formatDateTime } from "@/lib/formatters/date";

export function PeerHealthTable({ rows, onOpen }: { rows: MonitoringPeerRow[]; onOpen: (row: MonitoringPeerRow) => void }) {
  const columns = useMemo<ColumnDef<MonitoringPeerRow>[]>(() => [
    { header: "Peer", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.peerName || "Missing peer"}</p><p className="font-mono text-xs text-slate-500">{row.original.id}</p></div> },
    { header: "Router", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.router.name}</span> },
    { header: "User", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.user?.name || "Unknown"}</span> },
    { header: "State", cell: ({ row }) => <HealthStatusBadge status={row.original.handshakeState} /> },
    { header: "Enabled", cell: ({ row }) => <HealthStatusBadge status={row.original.enabled ? "enabled" : "disabled"} /> },
    { header: "Last handshake", cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{formatDateTime(row.original.lastHandshake)}</span> },
    { header: "Total Transfer", cell: ({ row }) => <span className="text-sm text-slate-200">{formatBytes(row.original.transferRx + row.original.transferTx)}</span> },
  ], []);

  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No peers found" emptyDescription="No peer health items matched the current filters." />;
}
