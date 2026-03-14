import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function AddRouterNoteDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: { body: string; category: string; pinned?: boolean; reason?: string }) => void;
}) {
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("support");
  const [pinned, setPinned] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setBody("");
      setCategory("support");
      setPinned(false);
      setReason("");
    }
  }, [open]);

  return (
    <Modal open={open} title="Add router note" description="Capture internal operational context for future support, networking, or provisioning review." onClose={onClose}>
      <Select label="Category" value={category} onChange={(event) => setCategory(event.target.value)} options={[
        { label: "Support", value: "support" },
        { label: "Provisioning", value: "provisioning" },
        { label: "Monitoring", value: "monitoring" },
        { label: "Billing", value: "billing" },
        { label: "Infrastructure", value: "infrastructure" },
        { label: "Follow up", value: "follow_up" },
      ]} />
      <Textarea label="Note" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write internal router context" />
      <Textarea label="Audit reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional reason captured with this admin action" />
      <Checkbox checked={pinned} onChange={(event) => setPinned(event.target.checked)} label="Pin note for faster visibility" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} disabled={!body.trim()} onClick={() => onConfirm({ body: body.trim(), category, pinned, reason: reason.trim() || undefined })}>Add note</Button>
      </div>
    </Modal>
  );
}
