import { useEffect, useState } from "react";
import { CopyButton } from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { AddBalancePayload, AddBalanceResponse } from "@/features/billing/types/billing.types";
import { formatCurrency } from "@/lib/formatters/currency";

export function AddBalanceDialog({
  open,
  loading,
  accountName,
  currency,
  result,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  accountName: string;
  currency?: string;
  result: AddBalanceResponse["transaction"] | null;
  onClose: () => void;
  onConfirm: (payload: AddBalancePayload) => void;
}) {
  const [amount, setAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "paypal">("paystack");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setAmount("0");
      setPaymentMethod("paystack");
      setReason("");
    }
  }, [open]);

  return (
    <Modal open={open} title="Create Balance Top-Up Link" description={`Generate a hosted payment link for ${accountName}.`} onClose={onClose}>
      <div className="space-y-4">
        <Input label="Amount" type="number" min="1" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
        <Select
          label="Payment method"
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value as "paystack" | "paypal")}
          options={[
            { label: "Paystack", value: "paystack" },
            { label: "PayPal", value: "paypal" },
          ]}
        />
        <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional admin note" />

        {result ? (
          <div className="rounded-2xl border border-background-border bg-background-panel p-4">
            <p className="text-sm font-medium text-text-primary">Payment link ready</p>
            <p className="mt-2 text-sm text-text-secondary">{formatCurrency(result.amount, result.currency || currency || "USD")} via {result.paymentMethod}</p>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-background-border bg-background-elevated px-3 py-2">
              <p className="min-w-0 flex-1 truncate text-sm text-text-primary">{result.paymentLink}</p>
              <CopyButton value={result.paymentLink} />
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button
            isLoading={loading}
            onClick={() => onConfirm({ amount: Number(amount) || 0, paymentMethod, reason: reason.trim() || undefined })}
          >
            Generate Link
          </Button>
        </div>
      </div>
    </Modal>
  );
}
