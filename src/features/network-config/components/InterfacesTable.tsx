import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import type { NetworkInterface } from "@/features/network-config/types/network-config.types";

function formatBytes(value: number) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let current = value;
  let index = 0;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  return `${current.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function InterfacesTable({
  rows,
  onToggleEnabled,
  isLoading,
}: {
  rows: NetworkInterface[];
  onToggleEnabled: (item: NetworkInterface, enabled: boolean) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<NetworkInterface>[]>(() => [
    { header: "Name", cell: ({ row }) => <span className="font-mono text-xs">{row.original.name || "-"}</span> },
    { header: "Type", cell: ({ row }) => <span>{row.original.type || "-"}</span> },
    { header: "MTU", cell: ({ row }) => <span>{row.original.mtu || "-"}</span> },
    { header: "Running", cell: ({ row }) => <Badge tone={row.original.running ? "success" : "neutral"}>{row.original.running ? "running" : "idle"}</Badge> },
    {
      header: "Disabled",
      cell: ({ row }) => (
        <Switch
          checked={!row.original.disabled}
          label={!row.original.disabled ? "On" : "Off"}
          onClick={() => onToggleEnabled(row.original, row.original.disabled)}
        />
      ),
    },
    { header: "Download", cell: ({ row }) => <span>{formatBytes(row.original.rxBytes)}</span> },
    { header: "Upload", cell: ({ row }) => <span>{formatBytes(row.original.txBytes)}</span> },
  ], [onToggleEnabled]);

  return <DataTable data={rows} columns={columns} isLoading={isLoading} emptyTitle="No interfaces found" emptyDescription="The router did not return interface information." />;
}
