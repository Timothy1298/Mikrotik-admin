import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Eye, Plus } from "lucide-react";
import { DataTable } from "@/components/data-display/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { formatDateTime } from "@/lib/formatters/date";
import { formatBytes } from "@/lib/formatters/bytes";
import type { RouterBackup } from "@/features/backups/types/backup.types";

function triggerTone(triggeredBy: RouterBackup["triggeredBy"]) {
  switch (triggeredBy) {
    case "auto":
      return "success" as const;
    case "pre-change":
      return "warning" as const;
    default:
      return "info" as const;
  }
}

export function BackupsTable({
  rows,
  isLoading,
  onCreate,
  onView,
  onDownload,
  onDelete,
}: {
  rows: RouterBackup[];
  isLoading?: boolean;
  onCreate: () => void;
  onView: (backup: RouterBackup) => void;
  onDownload: (backup: RouterBackup) => void;
  onDelete: (backup: RouterBackup) => void;
}) {
  const columns = useMemo<ColumnDef<RouterBackup>[]>(() => [
    { header: "Date", cell: ({ row }) => <span className="text-sm text-text-primary">{formatDateTime(row.original.createdAt)}</span> },
    {
      header: "Triggered By",
      cell: ({ row }) => (
        <Badge tone={triggerTone(row.original.triggeredBy)}>
          {row.original.triggeredBy}
        </Badge>
      ),
    },
    { header: "Size", cell: ({ row }) => <span className="text-sm text-text-primary">{formatBytes(row.original.sizeBytes || 0)}</span> },
    { header: "Note", cell: ({ row }) => <span className="text-sm text-text-secondary">{row.original.note || "No note"}</span> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown
          items={[
            { label: "View", onClick: () => onView(row.original) },
            { label: "Download", onClick: () => onDownload(row.original) },
            { label: "Delete", onClick: () => onDelete(row.original), danger: true },
          ]}
        />
      ),
    },
  ], [onDelete, onDownload, onView]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" leftIcon={<Eye className="h-4 w-4" />} onClick={() => rows[0] && onView(rows[0])} disabled={!rows.length}>
          View latest
        </Button>
        <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={() => rows[0] && onDownload(rows[0])} disabled={!rows.length}>
          Download latest
        </Button>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
          Create backup now
        </Button>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        emptyTitle="No backups found"
        emptyDescription="Create a router export backup to capture the current RouterOS configuration."
      />
    </div>
  );
}
