import { useState } from "react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { CreateInvoicePayload } from "@/features/billing/types/billing.types";

export function CreateInvoiceDialog({ open, loading, accountId, accountName, onClose, onConfirm }: { open: boolean; loading: boolean; accountId: string; accountName: string; onClose: () => void; onConfirm: (payload: CreateInvoicePayload) => void }) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleClose = () => {
    setAmount("");
    setCurrency("KES");
    setDueDate("");
    setDescription("");
    setReason("");
    setInlineError(null);
    onClose();
  };

  const handleSubmit = () => {
    const numericAmount = Number(amount);
    if (!accountId || !description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setInlineError("Amount and description are required.");
      return;
    }
    setInlineError(null);
    onConfirm({ accountId, amount: numericAmount, currency, dueDate: dueDate || undefined, description: description.trim(), reason: reason.trim() || undefined });
  };

  return (
    <Modal open={open} title="Create Manual Invoice" description="Generate an ad-hoc invoice for the selected subscriber." onClose={handleClose}>
      <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Subscriber: <span className="font-semibold text-slate-100">{accountName}</span></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1500.00" />
        <Select label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value)} options={[{ label: "KES", value: "KES" }, { label: "USD", value: "USD" }, { label: "UGX", value: "UGX" }, { label: "TZS", value: "TZS" }]} />
      </div>
      <Input label="Due Date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      <Input label="Description" placeholder="e.g. Custom setup fee" value={description} onChange={(event) => setDescription(event.target.value)} />
      <Textarea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
      {inlineError ? <InlineError message={inlineError} /> : null}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
        <Button isLoading={loading} onClick={handleSubmit}>Create Invoice</Button>
      </div>
    </Modal>
  );
}
