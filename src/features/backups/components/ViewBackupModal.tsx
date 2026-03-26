import { Copy, Download } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCopyToClipboard } from "@/hooks/utils/useCopyToClipboard";
import { useBackupContent, useBackupDetail } from "@/features/backups/hooks/useBackups";
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

export function ViewBackupModal({
  open,
  routerId,
  backup,
  onClose,
}: {
  open: boolean;
  routerId: string;
  backup: RouterBackup | null;
  onClose: () => void;
}) {
  const { copy } = useCopyToClipboard();
  const detailQuery = useBackupDetail(routerId, backup?.id, open);
  const contentQuery = useBackupContent(routerId, backup?.id, open);
  const resolvedBackup = detailQuery.data || backup;
  const content = contentQuery.data || resolvedBackup?.exportText || "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={resolvedBackup?.filename || "Router backup"}
      description="Review, copy, or download the raw RouterOS export."
      maxWidthClass="max-w-5xl"
    >
      <div className="grid gap-3 rounded-2xl border border-background-border bg-background-panel p-4 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Created by</p>
          <p className="mt-2 text-sm text-text-primary">{resolvedBackup?.createdBy || "Unknown"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Trigger</p>
          <p className="mt-2 text-sm text-text-primary">{resolvedBackup?.triggeredBy || "manual"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Created at</p>
          <p className="mt-2 text-sm text-text-primary">{resolvedBackup?.createdAt ? new Date(resolvedBackup.createdAt).toLocaleString() : "Unknown"}</p>
        </div>
        {resolvedBackup?.note ? (
          <div className="md:col-span-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Note</p>
            <p className="mt-2 text-sm text-text-primary">{resolvedBackup.note}</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          variant="outline"
          leftIcon={<Copy className="h-4 w-4" />}
          disabled={!content}
          onClick={() => void copy(content, "Backup copied")}
        >
          Copy
        </Button>
        <Button
          leftIcon={<Download className="h-4 w-4" />}
          disabled={!content}
          onClick={() => downloadText(resolvedBackup?.filename || "router-backup.rsc", content)}
        >
          Download
        </Button>
      </div>

      {detailQuery.isError ? (
        <InlineError message={detailQuery.error instanceof Error ? detailQuery.error.message : "Unable to load backup detail"} />
      ) : null}

      {contentQuery.isError ? (
        <InlineError message={contentQuery.error instanceof Error ? contentQuery.error.message : "Unable to load backup content"} />
      ) : null}

      <div className="rounded-2xl border border-background-border bg-slate-950 p-4">
        <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-100">
          {contentQuery.isPending ? "Loading backup content..." : content || "No export content returned for this backup."}
        </pre>
      </div>
    </Modal>
  );
}
