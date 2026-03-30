import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import type { PppoeSession } from "@/features/pppoe/types/pppoe.types";
import { formatBytes } from "@/lib/formatters/bytes";

export function PppoeSessionsTable({
  rows,
  controlModeBySessionId,
  canSwitchProfileBySessionId,
  onAdjustBandwidth,
  onSwitchProfile,
  onDisconnect,
  isLoading,
}: {
  rows: PppoeSession[];
  controlModeBySessionId?: Record<string, "profile" | "override">;
  canSwitchProfileBySessionId?: Record<string, boolean>;
  onAdjustBandwidth: (session: PppoeSession) => void;
  onSwitchProfile: (session: PppoeSession) => void;
  onDisconnect: (session: PppoeSession) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<PppoeSession>[]>(() => [
    { header: "Username", accessorKey: "name" },
    {
      header: "Control",
      cell: ({ row }) => (
        <span className="text-sm text-text-primary">{controlModeBySessionId?.[row.original.id] === "override" ? "Override" : "Profile"}</span>
      ),
    },
    { header: "IP Address", cell: ({ row }) => <span className="font-mono text-sm text-text-secondary">{row.original.address || "Unknown"}</span> },
    { header: "Caller IP", cell: ({ row }) => <span className="font-mono text-sm text-text-secondary">{row.original.callerIp || "Unknown"}</span> },
    { header: "Upload", cell: ({ row }) => <span className="text-sm text-text-primary">{formatBytes(row.original.bytesOut || 0)}</span> },
    { header: "Download", cell: ({ row }) => <span className="text-sm text-text-primary">{formatBytes(row.original.bytesIn || 0)}</span> },
    { header: "Uptime", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.uptime || "Unknown"}</span> },
    {
      header: "Actions",
      cell: ({ row }) => {
        const canSwitchProfile = canSwitchProfileBySessionId?.[row.original.id] ?? true;
        return (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); onAdjustBandwidth(row.original); }}>
              Adjust bandwidth
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!canSwitchProfile}
              title={canSwitchProfile ? "Switch this connected client to another profile" : "This session is not linked to a saved PPPoE subscriber, so profile switching is unavailable."}
              onClick={(event) => {
                event.stopPropagation();
                onSwitchProfile(row.original);
              }}
            >
              Switch profile
            </Button>
            <Button variant="danger" size="sm" onClick={(event) => { event.stopPropagation(); onDisconnect(row.original); }}>Disconnect</Button>
          </div>
        );
      },
    },
  ], [canSwitchProfileBySessionId, controlModeBySessionId, onAdjustBandwidth, onDisconnect, onSwitchProfile]);

  return <DataTable data={rows} columns={columns} isLoading={isLoading} emptyTitle="No PPPoE sessions found" emptyDescription="Active PPPoE sessions will appear here and refresh every 10 seconds." />;
}
