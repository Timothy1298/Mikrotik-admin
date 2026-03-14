import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function AddServerFlagDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: { flag: string; severity: string; description?: string; reason?: string }) => void;
}) {
  const [flag, setFlag] = useState("manual_review");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setFlag("manual_review"); setSeverity("medium"); setDescription(""); setReason("");
    }
  }, [open]);

  return (
    <Modal open={open} title="Add server flag" description="Mark the server for infrastructure follow-up and review visibility." onClose={onClose}>
      <Select label="Flag" value={flag} onChange={(event) => setFlag(event.target.value)} options={[
        { label: "Overloaded", value: "overloaded" },
        { label: "Unhealthy", value: "unhealthy" },
        { label: "Under maintenance", value: "under_maintenance" },
        { label: "Migration blocked", value: "migration_blocked" },
        { label: "Manual review", value: "manual_review" },
        { label: "Degraded", value: "degraded" },
      ]} />
      <Select label="Severity" value={severity} onChange={(event) => setSeverity(event.target.value)} options={[
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ]} />
      <Textarea label="Description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Explain why this flag is being added" />
      <Textarea label="Audit reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional reason captured with the admin action" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} onClick={() => onConfirm({ flag, severity, description: description.trim() || undefined, reason: reason.trim() || undefined })}>Add flag</Button>
      </div>
    </Modal>
  );
}
