import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import type { TrafficRouterRow } from "@/features/monitoring/types/monitoring.types";

export function TrafficTopRoutersTable({ rows, onOpen }: { rows: TrafficRouterRow[]; onOpen: (row: TrafficRouterRow) => void }) {
  const columns = useMemo<ColumnDef<TrafficRouterRow>[]>(() => [
    { header: "Router", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.name}</p><p className="text-xs text-slate-500">{row.original.serverNode}</p></div> },
    { header: "Customer", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.user?.name || "Unknown"}</span> },
    { header: "Ingress", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.transferRx.toLocaleString()}</span> },
    { header: "Egress", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.transferTx.toLocaleString()}</span> },
    { header: "Total", cell: ({ row }) => <span className="font-medium text-slate-100">{row.original.totalTransferBytes.toLocaleString()}</span> },
  ], []);

  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No router traffic found" emptyDescription="No router traffic data was returned." />;
}
