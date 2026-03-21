import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Gauge, Plus } from "lucide-react";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import type { RouterQueue } from "@/features/queues/types/queue.types";

function formatLimit(kbps: number) {
  if (!kbps) return "Unlimited";
  return `${(kbps / 1000).toFixed(kbps >= 1000 ? 1 : 2)} Mbps`;
}

export function QueuesTable({
  rows,
  onAddQueue,
  onApplyPlan,
  onEdit,
  onDelete,
  isLoading,
}: {
  rows: RouterQueue[];
  onAddQueue: () => void;
  onApplyPlan: () => void;
  onEdit: (queue: RouterQueue) => void;
  onDelete: (queue: RouterQueue) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<RouterQueue>[]>(() => [
    {
      header: "Name",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-100">{row.original.name}</p>
          <p className="text-xs text-slate-500">{row.original.queueType === "pcq" ? "PCQ-backed queue" : "Simple queue"}</p>
        </div>
      ),
    },
    { header: "Target IP", cell: ({ row }) => <span className="font-mono text-sm text-slate-400">{row.original.target}</span> },
    { header: "Download Limit", cell: ({ row }) => <span className="text-sm text-slate-200">{formatLimit(row.original.maxDownloadKbps)}</span> },
    { header: "Upload Limit", cell: ({ row }) => <span className="text-sm text-slate-200">{formatLimit(row.original.maxUploadKbps)}</span> },
    { header: "Comment", cell: ({ row }) => <span className="text-sm text-slate-400">{row.original.comment || "No comment"}</span> },
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
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" leftIcon={<Gauge className="h-4 w-4" />} onClick={onApplyPlan}>Apply service plan</Button>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={onAddQueue}>Add queue</Button>
      </div>
      <DataTable data={rows} columns={columns} isLoading={isLoading} emptyTitle="No queues found" emptyDescription="Create a manual queue or apply a service plan to start enforcing bandwidth on this router." />
    </div>
  );
}
