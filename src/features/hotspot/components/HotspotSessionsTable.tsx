import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { HotspotSession } from "@/features/hotspot/types/hotspot.types";
import { formatBytes } from "@/lib/formatters/bytes";
import { formatDateTime } from "@/lib/formatters/date";

function formatSeconds(totalSeconds: number | null | undefined) {
  if (!totalSeconds || totalSeconds <= 0) return "Unlimited";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatRate(bytesPerSecond: number | null | undefined) {
  if (!bytesPerSecond || bytesPerSecond <= 0) return "0 B/s";
  return `${formatBytes(bytesPerSecond)}/s`;
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
    { header: "Username", cell: ({ row }) => <span className="font-medium text-text-primary">{row.original.username || "Unknown"}</span> },
    {
      header: "Session",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-mono text-sm text-text-primary">{row.original.ip || "Unknown"}</p>
          <p className="text-xs text-text-muted">{row.original.deviceLabel || row.original.hostName || "Device label unavailable"}</p>
          <p className="font-mono text-xs text-text-muted">{row.original.mac || "Unknown"}</p>
        </div>
      ),
    },
    {
      header: "Profile",
      cell: ({ row }) => (
        <div className="space-y-1">
          <Badge tone="info">{row.original.profile || "default"}</Badge>
          <p className="text-xs text-text-muted">Server {row.original.server || "default"}</p>
        </div>
      ),
    },
    {
      header: "Traffic",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-sm text-text-primary">Total {formatBytes((row.original.uplinkBytes || 0) + (row.original.downlinkBytes || 0))}</p>
          <p className="text-xs text-text-muted">Up {formatBytes(row.original.uplinkBytes || 0)} • Down {formatBytes(row.original.downlinkBytes || 0)}</p>
          <p className="text-xs text-text-muted">Live up {formatRate(row.original.currentUplinkBps)} • Live down {formatRate(row.original.currentDownlinkBps)}</p>
          <p className="text-xs text-text-muted">Avg up {formatRate(row.original.averageUplinkBps)} • Avg down {formatRate(row.original.averageDownlinkBps)}</p>
        </div>
      ),
    },
    {
      header: "Connected",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-sm text-text-primary">{formatSeconds(row.original.uptimeSeconds)}</p>
          <p className="text-xs text-text-muted">{formatDateTime(row.original.startedAt)}</p>
        </div>
      ),
    },
    {
      header: "Time remaining",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-sm text-text-primary">{formatSeconds(row.original.sessionTimeLeftSeconds)}</p>
          <p className="text-xs text-text-muted">Idle {formatSeconds(row.original.idleTimeoutSeconds)} • Keepalive {formatSeconds(row.original.keepaliveTimeoutSeconds)}</p>
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
