import { Modal } from "@/components/ui/Modal";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { InvoiceStatusBadge } from "@/features/billing/components/InvoiceStatusBadge";
import type { BillingTransaction } from "@/features/billing/types/billing.types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";

export function InvoiceDetailsModal({ open, invoice, onClose }: { open: boolean; invoice: BillingTransaction | null; onClose: () => void }) {
  if (!open || !invoice) return null;
  return (
    <Modal open={open} title={invoice.transactionId} description={invoice.description} onClose={onClose}>
      <Card>
        <CardHeader><div><CardTitle>Invoice details</CardTitle><CardDescription>Billing amount, due date, and linked account context.</CardDescription></div></CardHeader>
        <div className="space-y-3 text-sm text-slate-200">
          <div className="flex items-center justify-between"><span>Account</span><span>{invoice.account?.name || "Unknown"}</span></div>
          <div className="flex items-center justify-between"><span>Amount</span><span>{formatCurrency(invoice.amount, invoice.currency || "USD")}</span></div>
          <div className="flex items-center justify-between"><span>Status</span><InvoiceStatusBadge status={invoice.status} /></div>
          <div className="flex items-center justify-between"><span>Due date</span><span>{formatDateTime(invoice.dueDate)}</span></div>
          <div className="flex items-center justify-between"><span>Created</span><span>{formatDateTime(invoice.createdAt)}</span></div>
          <div className="flex items-center justify-between"><span>Settled</span><span>{formatDateTime(invoice.settledAt)}</span></div>
        </div>
      </Card>
    </Modal>
  );
}
