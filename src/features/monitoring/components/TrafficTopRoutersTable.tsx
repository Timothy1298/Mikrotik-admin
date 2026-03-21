import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import type { TrafficRouterRow } from "@/features/monitoring/types/monitoring.types";
import { formatBytes } from "@/lib/formatters/bytes";

export function TrafficTopRoutersTable({ rows, onOpen }: { rows: TrafficRouterRow[]; onOpen: (row: TrafficRouterRow) => void }) {
  const columns = useMemo<ColumnDef<TrafficRouterRow>[]>(() => [
    { header: "Router", cell: ({ row }) => <div><p className="font-medium text-text-primary">{row.original.name}</p><p className="text-xs text-text-muted">{row.original.serverNode}</p></div> },
    { header: "Customer", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.user?.name || "Unknown"}</span> },
    { header: "Ingress", cell: ({ row }) => <span className="text-sm text-text-primary">{formatBytes(row.original.transferRx)}</span> },
    { header: "Egress", cell: ({ row }) => <span className="text-sm text-text-primary">{formatBytes(row.original.transferTx)}</span> },
    { header: "Total", cell: ({ row }) => <span className="font-medium text-text-primary">{formatBytes(row.original.totalTransferBytes)}</span> },
  ], []);

  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No router traffic found" emptyDescription="No router traffic data was returned." />;
}
