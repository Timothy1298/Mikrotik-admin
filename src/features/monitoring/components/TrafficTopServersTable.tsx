import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import type { TrafficServerRow } from "@/features/monitoring/types/monitoring.types";

export function TrafficTopServersTable({ rows, onOpen }: { rows: TrafficServerRow[]; onOpen: (row: TrafficServerRow) => void }) {
  const columns = useMemo<ColumnDef<TrafficServerRow>[]>(() => [
    { header: "Server", cell: ({ row }) => <span className="font-medium text-slate-100">{row.original.nodeId}</span> },
    { header: "Ingress", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.transferRx.toLocaleString()}</span> },
    { header: "Egress", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.transferTx.toLocaleString()}</span> },
    { header: "Total", cell: ({ row }) => <span className="font-medium text-slate-100">{row.original.totalTransferBytes.toLocaleString()}</span> },
  ], []);

  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No server traffic found" emptyDescription="No server traffic counters were returned." />;
}
