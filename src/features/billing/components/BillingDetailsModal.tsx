import { Modal } from "@/components/ui/Modal";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { SubscriptionStatusBadge } from "@/features/billing/components/SubscriptionStatusBadge";
import type { BillingAccountDetail } from "@/features/billing/types/billing.types";
import { formatDateTime } from "@/lib/formatters/date";

export function BillingDetailsModal({ open, detail, onClose }: { open: boolean; detail: BillingAccountDetail | null; onClose: () => void }) {
  if (!open || !detail) return null;
  return (
    <Modal open={open} title={detail.account.name} description={detail.account.email} onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><div><CardTitle>Billing summary</CardTitle><CardDescription>Current plan, cycle, and risk state.</CardDescription></div></CardHeader>
          <div className="space-y-3 text-sm text-slate-200">
            <div className="flex items-center justify-between"><span>Plan</span><span>{detail.overview.currentPlan}</span></div>
            <div className="flex items-center justify-between"><span>Status</span><SubscriptionStatusBadge status={detail.overview.subscriptionStatus} /></div>
            <div className="flex items-center justify-between"><span>Recurring value</span><span>${detail.overview.estimatedRecurringValue.toFixed(2)}</span></div>
            <div className="flex items-center justify-between"><span>Next billing</span><span>{formatDateTime(detail.overview.nextBillingDate)}</span></div>
            <div className="flex items-center justify-between"><span>Grace period</span><span>{detail.overview.gracePeriodActive ? "Active" : "No"}</span></div>
          </div>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>Entitlements</CardTitle><CardDescription>Derived service access from real billing state.</CardDescription></div></CardHeader>
          <div className="space-y-3 text-sm text-slate-200">
            <div className="flex items-center justify-between"><span>Router management</span><span>{detail.entitlements.routerManagementEnabled ? "Enabled" : "Disabled"}</span></div>
            <div className="flex items-center justify-between"><span>Monitoring</span><span>{detail.entitlements.monitoringEnabled ? "Enabled" : "Disabled"}</span></div>
            <div className="flex items-center justify-between"><span>Support tier</span><span>{detail.entitlements.supportTier}</span></div>
            <div className="flex items-center justify-between"><span>Billing hold</span><span>{detail.entitlements.billingHold ? "Yes" : "No"}</span></div>
            <div className="flex items-center justify-between"><span>Billable routers</span><span>{detail.entitlements.billableRouters}</span></div>
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader><div><CardTitle>Recent invoices / payments</CardTitle><CardDescription>Latest transaction preview from the billing account workspace.</CardDescription></div></CardHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            {detail.invoices.slice(0, 3).map((invoice) => <div key={invoice.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-3 text-sm text-slate-200">{invoice.transactionId} • ${invoice.amount.toFixed(2)} • {invoice.status}</div>)}
          </div>
          <div className="space-y-2">
            {detail.payments.slice(0, 3).map((payment) => <div key={payment.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-3 text-sm text-slate-200">{payment.transactionId} • ${payment.amount.toFixed(2)} • {payment.status}</div>)}
          </div>
        </div>
      </Card>
    </Modal>
  );
}
