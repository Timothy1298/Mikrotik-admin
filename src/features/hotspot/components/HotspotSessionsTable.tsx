import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import type { HotspotSession } from "@/features/hotspot/types/hotspot.types";
import { formatBytes } from "@/lib/formatters/bytes";
import { formatDateTime } from "@/lib/formatters/date";

function formatDuration(startedAt: string | null) {
  if (!startedAt) return "Unknown";
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return "Unknown";
  const totalSeconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function HotspotSessionsTable({
  rows,
  onDisconnect,
  isLoading,
}: {
  rows: HotspotSession[];
  onDisconnect: (session: HotspotSession) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<HotspotSession>[]>(() => [
    { header: "Username", cell: ({ row }) => <span className="font-medium text-slate-100">{row.original.username || "Unknown"}</span> },
    { header: "IP address", cell: ({ row }) => <span className="font-mono text-sm text-slate-400">{row.original.ip || "Unknown"}</span> },
    { header: "MAC", cell: ({ row }) => <span className="font-mono text-sm text-slate-400">{row.original.mac || "Unknown"}</span> },
    { header: "Upload", cell: ({ row }) => <span className="text-sm text-slate-200">{formatBytes(row.original.uplinkBytes || 0)}</span> },
    { header: "Download", cell: ({ row }) => <span className="text-sm text-slate-200">{formatBytes(row.original.downlinkBytes || 0)}</span> },
    {
      header: "Session duration",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-sm text-slate-200">{formatDuration(row.original.startedAt)}</p>
          <p className="text-xs text-slate-500">{formatDateTime(row.original.startedAt)}</p>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => <Button variant="danger" size="sm" onClick={(event) => { event.stopPropagation(); onDisconnect(row.original); }}>Disconnect</Button>,
    },
  ], [onDisconnect]);

  return <DataTable data={rows} columns={columns} isLoading={isLoading} emptyTitle="No active hotspot sessions" emptyDescription="Active hotspot logins will appear here and refresh automatically every 10 seconds." />;
}
