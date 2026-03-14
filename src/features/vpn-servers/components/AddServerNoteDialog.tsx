import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function AddServerNoteDialog({
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
  const [category, setCategory] = useState("infrastructure");
  const [pinned, setPinned] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setBody(""); setCategory("infrastructure"); setPinned(false); setReason("");
    }
  }, [open]);

  return (
    <Modal open={open} title="Add server note" description="Capture internal infrastructure context for this VPN server." onClose={onClose}>
      <Select label="Category" value={category} onChange={(event) => setCategory(event.target.value)} options={[
        { label: "Infrastructure", value: "infrastructure" },
        { label: "Capacity", value: "capacity" },
        { label: "Maintenance", value: "maintenance" },
        { label: "Migration", value: "migration" },
        { label: "Monitoring", value: "monitoring" },
        { label: "Incident", value: "incident" },
        { label: "Follow up", value: "follow_up" },
      ]} />
      <Textarea label="Note" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write internal server context" />
      <Textarea label="Audit reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional reason captured with this admin action" />
      <Checkbox checked={pinned} onChange={(event) => setPinned(event.target.checked)} label="Pin note for faster visibility" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} disabled={!body.trim()} onClick={() => onConfirm({ body: body.trim(), category, pinned, reason: reason.trim() || undefined })}>Add note</Button>
      </div>
    </Modal>
  );
}
