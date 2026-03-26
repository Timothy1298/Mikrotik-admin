import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { HotspotVoucher } from "@/features/hotspot/types/hotspot.types";
import { formatBytes } from "@/lib/formatters/bytes";
import { formatDateTime } from "@/lib/formatters/date";

export function HotspotVouchersTable({
  rows,
  status,
  onStatusChange,
  onRevoke,
  isLoading,
}: {
  rows: HotspotVoucher[];
  status: string;
  onStatusChange: (value: string) => void;
  onRevoke: (voucher: HotspotVoucher) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<HotspotVoucher>[]>(() => [
    { header: "Voucher", cell: ({ row }) => <div><p className="font-medium text-text-primary">{row.original.username}</p><p className="font-mono text-xs text-primary">{row.original.password}</p></div> },
    { header: "Profile", accessorKey: "profile" },
    { header: "Limits", cell: ({ row }) => <div><p className="text-sm text-text-primary">{row.original.dataLimitBytes ? formatBytes(row.original.dataLimitBytes) : "Unlimited"}</p><p className="text-xs text-text-muted">{row.original.timeLimitSeconds ? `${Math.round(row.original.timeLimitSeconds / 3600)} hrs` : "No time cap"}</p></div> },
    { header: "Status", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.status}</span> },
    { header: "Expires", cell: ({ row }) => <span className="font-mono text-xs text-text-secondary">{formatDateTime(row.original.expiresAt)}</span> },
    { header: "Actions", cell: ({ row }) => row.original.status === "unused" ? <Button size="sm" variant="outline" onClick={() => onRevoke(row.original)}>Revoke</Button> : null },
  ], [onRevoke]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="w-full max-w-xs">
          <Select
            label="Voucher status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            options={[
              { label: "All", value: "" },
              { label: "Unused", value: "unused" },
              { label: "Used", value: "used" },
              { label: "Expired", value: "expired" },
              { label: "Revoked", value: "revoked" },
            ]}
          />
        </div>
      </div>
      <DataTable data={rows} columns={columns} isLoading={isLoading} emptyTitle="No vouchers found" emptyDescription="Generate hotspot vouchers to manage printed or desk-issued access codes." />
    </div>
  );
}
