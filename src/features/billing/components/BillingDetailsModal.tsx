import { ShieldAlert, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { InvoiceStatusBadge } from "@/features/billing/components/InvoiceStatusBadge";
import { PaymentStatusBadge } from "@/features/billing/components/PaymentStatusBadge";
import { SubscriptionStatusBadge } from "@/features/billing/components/SubscriptionStatusBadge";
import type { BillingAccountDetail } from "@/features/billing/types/billing.types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";

export function BillingDetailsModal({ open, detail, onClose, onExtendTrial, onSuspend, onReactivate, onApplyGracePeriod, onResendInvoice, onRecordPayment, onCreateInvoice, onPayNow, onRunEnforcement }: { open: boolean; detail: BillingAccountDetail | null; onClose: () => void; onExtendTrial?: () => void; onSuspend?: () => void; onReactivate?: () => void; onApplyGracePeriod?: () => void; onResendInvoice?: () => void; onRecordPayment?: () => void; onCreateInvoice?: () => void; onPayNow?: () => void; onRunEnforcement?: () => void }) {
  if (!open || !detail) return null;
  const paymentActionVisible = ["past_due", "expired", "suspended"].includes(detail.overview.subscriptionStatus) || detail.overview.openInvoices > 0;
  return (
    <Modal open={open} title={detail.account.name} description={detail.account.email} onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><div><CardTitle>Billing summary</CardTitle><CardDescription>Current plan, cycle, and risk state.</CardDescription></div></CardHeader>
          <div className="space-y-3 text-sm text-text-primary">
            <div className="flex items-center justify-between"><span>Plan</span><span>{detail.overview.currentPlan}</span></div>
            <div className="flex items-center justify-between"><span>Status</span><SubscriptionStatusBadge status={detail.overview.subscriptionStatus} /></div>
            <div className="flex items-center justify-between"><span>Recurring value</span><span>{formatCurrency(detail.overview.estimatedRecurringValue, detail.account.currency || "USD")}</span></div>
            <div className="flex items-center justify-between"><span>Next billing</span><span>{formatDateTime(detail.overview.nextBillingDate)}</span></div>
            <div className="flex items-center justify-between"><span>Grace period</span><span>{detail.overview.gracePeriodActive ? "Active" : "No"}</span></div>
          </div>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>Entitlements</CardTitle><CardDescription>Derived service access from real billing state.</CardDescription></div></CardHeader>
          <div className="space-y-3 text-sm text-text-primary">
            <div className="flex items-center justify-between"><span>Router management</span><span>{detail.entitlements.routerManagementEnabled ? "Enabled" : "Disabled"}</span></div>
            <div className="flex items-center justify-between"><span>Monitoring</span><span>{detail.entitlements.monitoringEnabled ? "Enabled" : "Disabled"}</span></div>
            <div className="flex items-center justify-between"><span>Support tier</span><span>{detail.entitlements.supportTier}</span></div>
            <div className="flex items-center justify-between"><span>Billing hold</span><span>{detail.entitlements.billingHold ? "Yes" : "No"}</span></div>
            <div className="flex items-center justify-between"><span>Billable routers</span><span>{detail.entitlements.billableRouters}</span></div>
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Collections & automation</CardTitle>
              <CardDescription>Recover overdue subscriptions and trigger enforcement directly from this billing workspace.</CardDescription>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-3 text-text-secondary">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">
            <div className="flex items-center justify-between gap-3">
              <span>Subscription state</span>
              <SubscriptionStatusBadge status={detail.overview.subscriptionStatus} />
            </div>
            <p className="mt-3 text-xs text-text-muted">Use M-Pesa recovery when a subscriber is suspended, expired, or has open invoices pending collection.</p>
          </div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">
            <div className="flex items-center justify-between gap-3">
              <span>Automation</span>
              <span>{detail.entitlements.suspendedForBilling ? "Restricted" : "Watching"}</span>
            </div>
            <p className="mt-3 text-xs text-text-muted">Run enforcement manually if you want to re-check overdue subscriptions immediately instead of waiting for the scheduled cron.</p>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader><div><CardTitle>Recent invoices / payments</CardTitle><CardDescription>Latest transaction preview from the billing account workspace.</CardDescription></div></CardHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            {detail.invoices.slice(0, 3).map((invoice) => <div key={invoice.id} className="rounded-2xl border border-background-border bg-background-panel p-3 text-sm text-text-primary"><div className="flex items-center justify-between gap-3"><span className="font-mono text-xs text-text-secondary">{invoice.transactionId}</span><InvoiceStatusBadge status={invoice.status} /></div><div className="mt-2 flex items-center justify-between gap-3"><span>{formatCurrency(invoice.amount, invoice.currency || detail.account.currency || "USD")}</span><span className="font-mono text-xs text-text-muted">{formatDateTime(invoice.createdAt)}</span></div></div>)}
          </div>
          <div className="space-y-2">
            {detail.payments.slice(0, 3).map((payment) => <div key={payment.id} className="rounded-2xl border border-background-border bg-background-panel p-3 text-sm text-text-primary"><div className="flex items-center justify-between gap-3"><span className="font-mono text-xs text-text-secondary">{payment.transactionId}</span><PaymentStatusBadge status={payment.status} /></div><div className="mt-2 flex items-center justify-between gap-3"><span>{formatCurrency(payment.amount, payment.currency || detail.account.currency || "USD")}</span><span className="font-mono text-xs text-text-muted">{formatDateTime(payment.createdAt)}</span></div></div>)}
          </div>
        </div>
      </Card>
      <div className="mt-2 flex flex-wrap gap-2 border-t border-background-border pt-4">
        {detail.account.accountStatus !== "suspended" && onSuspend ? <Button variant="danger" onClick={onSuspend}>Suspend account</Button> : null}
        {detail.account.accountStatus === "suspended" && onReactivate ? <Button variant="outline" onClick={onReactivate}>Reactivate</Button> : null}
        {!detail.overview.gracePeriodActive && onApplyGracePeriod ? <Button variant="outline" onClick={onApplyGracePeriod}>Apply grace period</Button> : null}
        {detail.overview.subscriptionStatus === "trial" && onExtendTrial ? <Button variant="outline" onClick={onExtendTrial}>Extend trial</Button> : null}
        {detail.overview.openInvoices > 0 && onResendInvoice ? <Button variant="outline" onClick={onResendInvoice}>Resend invoice</Button> : null}
        {paymentActionVisible && onPayNow ? <Button leftIcon={<Smartphone className="h-4 w-4" />} onClick={onPayNow}>Pay now</Button> : null}
        {onRunEnforcement ? <Button variant="outline" leftIcon={<ShieldAlert className="h-4 w-4" />} onClick={onRunEnforcement}>Run enforcement</Button> : null}
        {onRecordPayment ? <Button onClick={onRecordPayment}>Record payment</Button> : null}
        {onCreateInvoice ? <Button variant="outline" onClick={onCreateInvoice}>Create invoice</Button> : null}
      </div>
    </Modal>
  );
}
