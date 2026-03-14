import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

export function LogsSecurityActionDialog({
  open,
  title,
  description,
  confirmLabel,
  loading,
  requireBody = false,
  reasonLabel = "Reason",
  bodyLabel = "Note",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  requireBody?: boolean;
  reasonLabel?: string;
  bodyLabel?: string;
  onClose: () => void;
  onConfirm: (payload: { reason?: string; body?: string }) => void;
}) {
  const [reason, setReason] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setBody("");
    }
  }, [open]);

  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      {requireBody ? <Textarea label={bodyLabel} value={body} onChange={(event) => setBody(event.target.value)} rows={5} /> : null}
      <Input label={reasonLabel} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional review context or investigation note" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} onClick={() => onConfirm({ reason, body })} disabled={requireBody && !body.trim()}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
