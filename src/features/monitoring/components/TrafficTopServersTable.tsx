import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import type { TrafficServerRow } from "@/features/monitoring/types/monitoring.types";
import { formatBytes } from "@/lib/formatters/bytes";

export function TrafficTopServersTable({ rows, onOpen }: { rows: TrafficServerRow[]; onOpen: (row: TrafficServerRow) => void }) {
  const columns = useMemo<ColumnDef<TrafficServerRow>[]>(() => [
    { header: "Server", cell: ({ row }) => <span className="font-medium text-text-primary">{row.original.nodeId}</span> },
    { header: "Ingress", cell: ({ row }) => <span className="text-sm text-text-primary">{formatBytes(row.original.transferRx)}</span> },
    { header: "Egress", cell: ({ row }) => <span className="text-sm text-text-primary">{formatBytes(row.original.transferTx)}</span> },
    { header: "Total", cell: ({ row }) => <span className="font-medium text-text-primary">{formatBytes(row.original.totalTransferBytes)}</span> },
  ], []);

  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No server traffic found" emptyDescription="No server traffic counters were returned." />;
}
