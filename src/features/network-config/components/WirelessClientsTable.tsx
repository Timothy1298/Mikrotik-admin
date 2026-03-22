import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Signal, SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import { DataTable } from "@/components/data-display/DataTable";
import type { WirelessClient } from "@/features/network-config/types/network-config.types";

function renderSignal(signal: number) {
  if (signal >= -60) return <SignalHigh className="h-4 w-4 text-success" />;
  if (signal >= -75) return <SignalMedium className="h-4 w-4 text-warning" />;
  if (signal < 0) return <SignalLow className="h-4 w-4 text-danger" />;
  return <Signal className="h-4 w-4 text-text-muted" />;
}

export function WirelessClientsTable({ rows, isLoading }: { rows: WirelessClient[]; isLoading?: boolean }) {
  const columns = useMemo<ColumnDef<WirelessClient>[]>(() => [
    { header: "MAC Address", cell: ({ row }) => <span className="font-mono text-xs">{row.original.macAddress || "-"}</span> },
    { header: "Interface", cell: ({ row }) => <span>{row.original.interface || "-"}</span> },
    {
      header: "Signal Strength",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {renderSignal(row.original.signal)}
          <span>{row.original.signal ? `${row.original.signal} dBm` : "-"}</span>
        </div>
      ),
    },
    { header: "TX Rate", cell: ({ row }) => <span>{row.original.txRate || "-"}</span> },
    { header: "RX Rate", cell: ({ row }) => <span>{row.original.rxRate || "-"}</span> },
    { header: "Uptime", cell: ({ row }) => <span>{row.original.uptime || "-"}</span> },
  ], []);

  return <DataTable data={rows} columns={columns} isLoading={isLoading} emptyTitle="No wireless clients found" emptyDescription="No wireless registration-table entries were returned by the router." />;
}
