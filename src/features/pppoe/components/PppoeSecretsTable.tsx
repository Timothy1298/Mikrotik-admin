import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { HotspotProfilesBadge } from "@/features/hotspot/components/HotspotProfilesBadge";
import type { PppoeSecret } from "@/features/pppoe/types/pppoe.types";

export function PppoeSecretsTable({
  rows,
  search,
  onSearchChange,
  onAddSubscriber,
  onEdit,
  onDelete,
  isLoading,
}: {
  rows: PppoeSecret[];
  search: string;
  onSearchChange: (value: string) => void;
  onAddSubscriber: () => void;
  onEdit: (secret: PppoeSecret) => void;
  onDelete: (secret: PppoeSecret) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<PppoeSecret>[]>(() => [
    {
      header: "Subscriber",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-100">{row.original.name}</p>
          <p className="text-xs text-slate-500">{row.original.comment || "No comment"}</p>
        </div>
      ),
    },
    { header: "Profile", cell: ({ row }) => <HotspotProfilesBadge profile={row.original.profile} /> },
    { header: "Service", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.service || "pppoe"}</span> },
    { header: "Remote Address", cell: ({ row }) => <span className="font-mono text-sm text-slate-400">{row.original.remoteAddress || "Dynamic"}</span> },
    {
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${row.original.online ? "bg-success animate-pulse" : row.original.isDisabled ? "bg-slate-500" : "bg-warning"}`} />
          <span className="text-sm text-slate-200">{row.original.online ? "online" : row.original.isDisabled ? "disabled" : "offline"}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown
          items={[
            { label: "Edit", onClick: () => onEdit(row.original) },
            { label: "Delete", onClick: () => onDelete(row.original), danger: true },
          ]}
        />
      ),
    },
  ], [onDelete, onEdit]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-md">
          <Input label="Search subscribers" placeholder="Search PPPoE username or comment" value={search} onChange={(event) => onSearchChange(event.target.value)} />
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={onAddSubscriber}>Add subscriber</Button>
      </div>
      <DataTable data={rows} columns={columns} isLoading={isLoading} emptyTitle="No PPPoE subscribers found" emptyDescription="Create a PPPoE subscriber to start managing customer authentication on this router." />
    </div>
  );
}
