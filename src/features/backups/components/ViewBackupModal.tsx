import { Copy, Download } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCopyToClipboard } from "@/hooks/utils/useCopyToClipboard";
import { useBackupContent } from "@/features/backups/hooks/useBackups";
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
  const contentQuery = useBackupContent(routerId, backup?.id, open);
  const content = contentQuery.data || backup?.exportText || "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={backup?.filename || "Router backup"}
      description="Review, copy, or download the raw RouterOS export."
      maxWidthClass="max-w-5xl"
    >
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
          onClick={() => downloadText(backup?.filename || "router-backup.rsc", content)}
        >
          Download
        </Button>
      </div>

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
