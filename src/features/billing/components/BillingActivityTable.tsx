import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import type { BillingActivityItem } from "@/features/billing/types/billing.types";
import { formatDateTime } from "@/lib/formatters/date";

export function BillingActivityTable({ rows, onOpen }: { rows: BillingActivityItem[]; onOpen: (row: BillingActivityItem) => void }) {
  const columns = useMemo<ColumnDef<BillingActivityItem>[]>(() => [
    { header: "Event", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.summary}</p><p className="text-xs text-slate-500">{row.original.type}</p></div> },
    { header: "Source", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.source}</span> },
    { header: "Actor", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.actor?.name || row.original.actor?.email || "system"}</span> },
    { header: "Timestamp", cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{formatDateTime(row.original.timestamp)}</span> },
  ], []);
  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No billing activity found" emptyDescription="No billing activity matched the current filters." />;
}
