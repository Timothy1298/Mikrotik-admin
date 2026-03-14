import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function SupportActionDialog({
  open,
  title,
  description,
  confirmLabel,
  loading,
  reasonOnly = true,
  textarea = false,
  select,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  reasonOnly?: boolean;
  textarea?: boolean;
  select?: { label: string; value: string; options: Array<{ label: string; value: string }>; onValueChange: (value: string) => void };
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
      {select ? <Select label={select.label} value={select.value} onChange={(event) => select.onValueChange(event.target.value)} options={select.options} /> : null}
      {textarea ? <Textarea label="Message / note" value={body} onChange={(event) => setBody(event.target.value)} rows={5} /> : null}
      <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional support workflow context" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} onClick={() => onConfirm({ reason, body })} disabled={textarea && !body.trim() && !reasonOnly}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
