import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", onClose, onConfirm }: { open: boolean; title: string; description: string; confirmLabel?: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      <div className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-danger">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">Please confirm this operation. It may affect live infrastructure or customer access.</p>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
