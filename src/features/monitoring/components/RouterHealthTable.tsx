import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { HealthStatusBadge } from "@/features/monitoring/components/HealthStatusBadge";
import type { RouterRow } from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

export function RouterHealthTable({
  rows,
  onOpen,
  emptyTitle = "No routers found",
  emptyDescription = "No routers matched the current health filters.",
}: {
  rows: RouterRow[];
  onOpen: (row: RouterRow) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const columns = useMemo<ColumnDef<RouterRow>[]>(() => [
    { header: "Router", cell: ({ row }) => <div><p className="font-medium text-text-primary">{row.original.name}</p><p className="font-mono text-xs text-text-muted">{row.original.id}</p></div> },
    { header: "Customer", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.customer?.name || "Unassigned"}</span> },
    { header: "Status", cell: ({ row }) => <HealthStatusBadge status={row.original.connectionStatus} /> },
    { header: "Setup", cell: ({ row }) => <HealthStatusBadge status={row.original.setupStatus} /> },
    { header: "Tunnel", cell: ({ row }) => <HealthStatusBadge status={row.original.healthSummary.state} /> },
    { header: "Last seen", cell: ({ row }) => <span className="font-mono text-xs text-text-secondary">{formatDateTime(row.original.lastSeen)}</span> },
    { header: "Handshake", cell: ({ row }) => <span className="font-mono text-xs text-text-secondary">{formatDateTime(row.original.lastHandshake)}</span> },
    { header: "Server", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.serverNode}</span> },
  ], []);

  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle={emptyTitle} emptyDescription={emptyDescription} />;
}
