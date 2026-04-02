import { useState } from "react";
import { Archive, Clock3, FileText } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { CreateBackupDialog } from "@/features/backups/components/CreateBackupDialog";
import { BackupsTable } from "@/features/backups/components/BackupsTable";
import { ViewBackupModal } from "@/features/backups/components/ViewBackupModal";
import { useBackups, useCreateBackup, useDeleteBackup } from "@/features/backups/hooks/useBackups";
import type { RouterBackup } from "@/features/backups/types/backup.types";

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function RouterBackupsPanel({ routerId }: { routerId: string }) {
  const [selectedBackup, setSelectedBackup] = useState<RouterBackup | null>(null);
  const createDisclosure = useDisclosure(false);
  const viewDisclosure = useDisclosure(false);
  const backupsQuery = useBackups(routerId);
  const createMutation = useCreateBackup(routerId);
  const deleteMutation = useDeleteBackup(routerId);

  const rows = backupsQuery.data?.items || [];
  const latest = rows[0] || null;

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Backups</CardTitle>
          <CardDescription>Capture RouterOS exports, review historical config snapshots, and download `.rsc` backups before making changes.</CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Stored backups</p>
            <Archive className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Restore readiness</p>
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-sm font-semibold text-text-primary">{latest?.metadata?.restoreCompatible === false ? "Review required" : "Validated"}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {latest?.metadata?.lastRestoreTestAt
              ? `Validated ${new Date(latest.metadata.lastRestoreTestAt).toLocaleString()}`
              : (latest?.metadata?.routerosVersion || latest?.triggeredBy || "Unavailable")}
          </p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Last backup</p>
            <Clock3 className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-sm font-semibold text-text-primary">{latest?.createdAt ? new Date(latest.createdAt).toLocaleString() : "Never"}</p>
          {latest?.metadata?.serialNumber ? <p className="mt-1 text-xs text-text-secondary">Serial {latest.metadata.serialNumber}</p> : null}
        </div>
      </div>

      {backupsQuery.isError ? <InlineError message={backupsQuery.error instanceof Error ? backupsQuery.error.message : "Unable to load router backups"} /> : null}

      <BackupsTable
        rows={rows}
        isLoading={backupsQuery.isPending}
        onCreate={createDisclosure.onOpen}
        onView={(backup) => {
          setSelectedBackup(backup);
          viewDisclosure.onOpen();
        }}
        onDownload={(backup) => {
          if (backup.exportText) {
            downloadText(backup.filename, backup.exportText);
            return;
          }
          setSelectedBackup(backup);
          viewDisclosure.onOpen();
        }}
        onDelete={(backup) => {
          if (!window.confirm(`Delete backup ${backup.filename}?`)) return;
          deleteMutation.mutate(backup.id);
        }}
      />

      <CreateBackupDialog
        open={createDisclosure.open}
        loading={createMutation.isPending}
        onClose={createDisclosure.onClose}
        onConfirm={(note) => createMutation.mutate(note, { onSuccess: () => createDisclosure.onClose() })}
      />

      <ViewBackupModal
        open={viewDisclosure.open}
        routerId={routerId}
        backup={selectedBackup}
        onClose={() => {
          setSelectedBackup(null);
          viewDisclosure.onClose();
        }}
      />
    </Card>
  );
}
