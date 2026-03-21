import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import type { PppoeSession } from "@/features/pppoe/types/pppoe.types";
import { formatBytes } from "@/lib/formatters/bytes";

export function PppoeSessionsTable({
  rows,
  onDisconnect,
  isLoading,
}: {
  rows: PppoeSession[];
  onDisconnect: (session: PppoeSession) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<PppoeSession>[]>(() => [
    { header: "Username", accessorKey: "name" },
    { header: "IP Address", cell: ({ row }) => <span className="font-mono text-sm text-text-secondary">{row.original.address || "Unknown"}</span> },
    { header: "Caller IP", cell: ({ row }) => <span className="font-mono text-sm text-text-secondary">{row.original.callerIp || "Unknown"}</span> },
    { header: "Upload", cell: ({ row }) => <span className="text-sm text-text-primary">{formatBytes(row.original.bytesOut || 0)}</span> },
    { header: "Download", cell: ({ row }) => <span className="text-sm text-text-primary">{formatBytes(row.original.bytesIn || 0)}</span> },
    { header: "Uptime", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.uptime || "Unknown"}</span> },
    { header: "Disconnect", cell: ({ row }) => <Button variant="danger" size="sm" onClick={(event) => { event.stopPropagation(); onDisconnect(row.original); }}>Disconnect</Button> },
  ], [onDisconnect]);

  return <DataTable data={rows} columns={columns} isLoading={isLoading} emptyTitle="No PPPoE sessions found" emptyDescription="Active PPPoE sessions will appear here and refresh every 10 seconds." />;
}
