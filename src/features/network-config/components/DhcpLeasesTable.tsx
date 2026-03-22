import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Dropdown } from "@/components/ui/Dropdown";
import type { DhcpLease } from "@/features/network-config/types/network-config.types";

function statusTone(status: string) {
  if (status === "bound" || status === "active") return "success";
  if (status === "waiting") return "warning";
  return "neutral";
}

export function DhcpLeasesTable({
  rows,
  onMakeStatic,
  onDelete,
  isLoading,
}: {
  rows: DhcpLease[];
  onMakeStatic: (lease: DhcpLease) => void;
  onDelete: (lease: DhcpLease) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<DhcpLease>[]>(() => [
    { header: "IP Address", cell: ({ row }) => <span className="font-mono text-xs">{row.original.address || row.original.activeAddress || "-"}</span> },
    { header: "MAC Address", cell: ({ row }) => <span className="font-mono text-xs">{row.original.macAddress || "-"}</span> },
    { header: "Hostname", cell: ({ row }) => <span>{row.original.hostname || "-"}</span> },
    { header: "Status", cell: ({ row }) => <Badge tone={statusTone(row.original.status)}>{row.original.status || "unknown"}</Badge> },
    { header: "Expires", cell: ({ row }) => <span>{row.original.expiresAt || "-"}</span> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown
          items={[
            { label: "Make Static", onClick: () => onMakeStatic(row.original) },
            { label: "Delete", onClick: () => onDelete(row.original), danger: true },
          ]}
        />
      ),
    },
  ], [onDelete, onMakeStatic]);

  return <DataTable data={rows} columns={columns} isLoading={isLoading} emptyTitle="No DHCP leases found" emptyDescription="No DHCP leases were returned by the router." />;
}
