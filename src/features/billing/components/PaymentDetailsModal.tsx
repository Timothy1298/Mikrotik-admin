import { Modal } from "@/components/ui/Modal";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { PaymentStatusBadge } from "@/features/billing/components/PaymentStatusBadge";
import type { BillingTransaction } from "@/features/billing/types/billing.types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";

export function PaymentDetailsModal({ open, payment, onClose }: { open: boolean; payment: BillingTransaction | null; onClose: () => void }) {
  if (!open || !payment) return null;
  return (
    <Modal open={open} title={payment.transactionId} description={payment.description} onClose={onClose}>
      <Card>
        <CardHeader><div><CardTitle>Payment details</CardTitle><CardDescription>Payment status, timestamps, and failure context.</CardDescription></div></CardHeader>
        <div className="space-y-3 text-sm text-text-primary">
          <div className="flex items-center justify-between"><span>Account</span><span>{payment.account?.name || "Unknown"}</span></div>
          <div className="flex items-center justify-between"><span>Amount</span><span>{formatCurrency(payment.amount, payment.currency || "USD")}</span></div>
          <div className="flex items-center justify-between"><span>Status</span><PaymentStatusBadge status={payment.status} /></div>
          <div className="flex items-center justify-between"><span>Method</span><span>{payment.paymentMethod || "Unknown"}</span></div>
          <div className="flex items-center justify-between"><span>Settled</span><span>{formatDateTime(payment.settledAt)}</span></div>
          <div className="flex items-center justify-between"><span>Failure</span><span>{payment.failureReason || "None"}</span></div>
        </div>
      </Card>
    </Modal>
  );
}
