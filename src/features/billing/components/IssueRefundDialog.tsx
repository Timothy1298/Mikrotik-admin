import { useState } from "react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { IssueRefundPayload } from "@/features/billing/types/billing.types";

export function IssueRefundDialog({ open, loading, accountId, accountName, onClose, onConfirm }: { open: boolean; loading: boolean; accountId: string; accountName: string; onClose: () => void; onConfirm: (payload: IssueRefundPayload) => void }) {
  const [originalTransactionId, setOriginalTransactionId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleClose = () => {
    setOriginalTransactionId("");
    setAmount("");
    setCurrency("KES");
    setDescription("");
    setReason("");
    setInlineError(null);
    onClose();
  };

  const handleSubmit = () => {
    const numericAmount = Number(amount);
    if (!accountId || !description.trim() || !reason.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setInlineError("Refund amount, description, and reason are required.");
      return;
    }
    setInlineError(null);
    onConfirm({ accountId, originalTransactionId: originalTransactionId.trim() || undefined, amount: numericAmount, currency, description: description.trim(), reason: reason.trim() });
  };

  return (
    <Modal open={open} title="Issue Refund / Credit Note" description="Record a refund after funds have already been returned to the subscriber." onClose={handleClose}>
      <div className="rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-slate-200">This will record a refund transaction. Ensure the actual funds have been returned to the subscriber through your payment channel before recording.</div>
      <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Subscriber: <span className="font-semibold text-slate-100">{accountName}</span></div>
      <Input label="Original Transaction ID or Reference" hint="Leave blank for credit notes not tied to a specific transaction" value={originalTransactionId} onChange={(event) => setOriginalTransactionId(event.target.value)} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Refund Amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
        <Select label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value)} options={[{ label: "KES", value: "KES" }, { label: "USD", value: "USD" }, { label: "UGX", value: "UGX" }, { label: "TZS", value: "TZS" }]} />
      </div>
      <Input label="Description" placeholder="e.g. Service was unavailable for 5 days" value={description} onChange={(event) => setDescription(event.target.value)} />
      <Textarea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
      {inlineError ? <InlineError message={inlineError} /> : null}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
        <Button variant="danger" isLoading={loading} onClick={handleSubmit}>Record Refund</Button>
      </div>
    </Modal>
  );
}
