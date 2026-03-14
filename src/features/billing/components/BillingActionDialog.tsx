import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function BillingActionDialog({
  open,
  title,
  description,
  confirmLabel,
  loading,
  daysInput = false,
  noteBody = false,
  flagInput = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  daysInput?: boolean;
  noteBody?: boolean;
  flagInput?: boolean;
  onClose: () => void;
  onConfirm: (payload: { days?: number; reason?: string; body?: string; category?: string; flag?: string; severity?: string; description?: string }) => void;
}) {
  const [days, setDays] = useState("7");
  const [reason, setReason] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("billing");
  const [flag, setFlag] = useState("manual_review");
  const [severity, setSeverity] = useState("medium");
  const [flagDescription, setFlagDescription] = useState("");

  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      {daysInput ? <Input label="Days" type="number" value={days} onChange={(event) => setDays(event.target.value)} /> : null}
      {noteBody ? (
        <>
          <Select label="Category" value={category} onChange={(event) => setCategory(event.target.value)} options={[
            { label: "Billing", value: "billing" },
            { label: "Payment", value: "payment" },
            { label: "Subscription", value: "subscription" },
            { label: "Overdue", value: "overdue" },
            { label: "Grace period", value: "grace_period" },
            { label: "Follow-up", value: "follow_up" },
          ]} />
          <Textarea label="Note" value={body} onChange={(event) => setBody(event.target.value)} />
        </>
      ) : null}
      {flagInput ? (
        <>
          <Select label="Flag" value={flag} onChange={(event) => setFlag(event.target.value)} options={[
            { label: "Manual review", value: "manual_review" },
            { label: "Grace period", value: "grace_period" },
            { label: "Payment failure watch", value: "payment_failure_watch" },
            { label: "Suspension pending", value: "suspension_pending" },
            { label: "VIP billing", value: "VIP_billing" },
          ]} />
          <Select label="Severity" value={severity} onChange={(event) => setSeverity(event.target.value)} options={[
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
          ]} />
          <Textarea label="Flag description" value={flagDescription} onChange={(event) => setFlagDescription(event.target.value)} />
        </>
      ) : null}
      <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Operational reason or audit context" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} onClick={() => onConfirm({ days: Number(days || 0), reason, body, category, flag, severity, description: flagDescription })} disabled={noteBody && !body.trim()}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
