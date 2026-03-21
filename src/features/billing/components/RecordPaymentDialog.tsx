import { useState } from "react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { RecordPaymentPayload } from "@/features/billing/types/billing.types";

export function RecordPaymentDialog({ open, loading, accountId, accountName, onClose, onConfirm }: { open: boolean; loading: boolean; accountId: string; accountName: string; onClose: () => void; onConfirm: (payload: RecordPaymentPayload) => void }) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [paymentMethod, setPaymentMethod] = useState<RecordPaymentPayload["paymentMethod"]>("manual");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleClose = () => {
    setAmount("");
    setCurrency("KES");
    setPaymentMethod("manual");
    setReference("");
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
    onConfirm({ accountId, amount: numericAmount, currency, description: description.trim(), paymentMethod, reference: reference.trim() || undefined, reason: reason.trim() || undefined });
  };

  return (
    <Modal open={open} title="Record Manual Payment" description="Capture an off-platform payment and attach it to the subscriber account." onClose={handleClose}>
      <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Subscriber: <span className="font-semibold text-text-primary">{accountName}</span></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1500.00" />
        <Select label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value)} options={[{ label: "KES", value: "KES" }, { label: "USD", value: "USD" }, { label: "UGX", value: "UGX" }, { label: "TZS", value: "TZS" }]} />
      </div>
      <Select label="Payment Method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as RecordPaymentPayload["paymentMethod"])} options={[{ label: "Manual / Cash", value: "manual" }, { label: "M-Pesa", value: "mpesa" }, { label: "Airtel Money", value: "airtel_money" }, { label: "Bank Transfer", value: "bank_transfer" }, { label: "Cash", value: "cash" }]} />
      <Input label="Payment Reference" hint="Mobile money code, bank reference, or receipt number" placeholder="e.g. M-Pesa code: QWE123456" value={reference} onChange={(event) => setReference(event.target.value)} />
      <Input label="Description" placeholder="e.g. Monthly subscription payment - March 2025" value={description} onChange={(event) => setDescription(event.target.value)} />
      <Textarea label="Admin notes" value={reason} onChange={(event) => setReason(event.target.value)} />
      {inlineError ? <InlineError message={inlineError} /> : null}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
        <Button isLoading={loading} onClick={handleSubmit}>Record Payment</Button>
      </div>
    </Modal>
  );
}
