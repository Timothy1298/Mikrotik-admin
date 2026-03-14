import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { HealthStatusBadge } from "@/features/monitoring/components/HealthStatusBadge";
import type { AffectedCustomerRow } from "@/features/monitoring/types/monitoring.types";

export function CustomerImpactTable({ rows, onOpen }: { rows: AffectedCustomerRow[]; onOpen: (row: AffectedCustomerRow) => void }) {
  const columns = useMemo<ColumnDef<AffectedCustomerRow>[]>(() => [
    { header: "Customer", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.user.name || "Unknown"}</p><p className="text-xs text-slate-500">{row.original.user.email}</p></div> },
    { header: "Offline routers", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.offlineRouters}</span> },
    { header: "Unhealthy routers", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.unhealthyRouters}</span> },
    { header: "Provisioning failures", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.failedProvisioningRouters}</span> },
    { header: "Server impact", cell: ({ row }) => <HealthStatusBadge status={row.original.affectedByServer ? "affected" : "stable"} /> },
  ], []);

  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No affected customers" emptyDescription="No customer impact records matched the current filters." />;
}
