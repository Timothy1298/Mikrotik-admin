import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatters/currency';
import { formatDateTime } from '@/lib/formatters/date';
import { SubscriptionStatusBadge } from '@/features/users/components/SubscriptionStatusBadge';
import type { UserDetail } from '@/features/users/types/user.types';

export function UserBillingPanel({ user }: { user: UserDetail }) {
  const billingSummary = user.billing?.summary;
  const transactions = user.billing?.recentTransactions || user.billing?.transactions || [];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <CardHeader>
          <div><CardTitle>Billing summary</CardTitle><CardDescription>Plan, billing cycle, next charge, and overdue pressure.</CardDescription></div>
        </CardHeader>
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex items-center justify-between"><span>Current status</span><SubscriptionStatusBadge status={billingSummary?.status || 'none'} /></div>
          <div className="flex items-center justify-between"><span>Monthly value</span><span>{formatCurrency(billingSummary?.monthlyValue || user.billing?.pricingAmount || 0, String(user.billing?.currency || 'USD'))}</span></div>
          <div className="flex items-center justify-between"><span>Next billing date</span><span>{formatDateTime(billingSummary?.nextBillingDate || user.billing?.nextBillingDate || null)}</span></div>
          <div className="flex items-center justify-between"><span>Trial ending soon</span><span>{billingSummary?.trialEndingSoon ? 'Yes' : 'No'}</span></div>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <div><CardTitle>Invoices and payments</CardTitle><CardDescription>User-specific billing transactions and payment outcomes.</CardDescription></div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="font-mono text-slate-500"><tr><th className="pb-3">Reference</th><th className="pb-3">Type</th><th className="pb-3">Amount</th><th className="pb-3">Status</th><th className="pb-3">Created</th></tr></thead>
            <tbody className="divide-y divide-brand-500/15">
              {transactions.length ? transactions.map((transaction) => (
                <tr key={String(transaction.transactionId || transaction._id)}>
                  <td className="py-4 font-mono text-slate-100">{String(transaction.transactionId || 'N/A')}</td>
                  <td className="py-4 text-slate-300">{String(transaction.type || '-')}</td>
                  <td className="py-4 text-slate-300">{formatCurrency(Number(transaction.amount || 0), String(transaction.currency || 'USD'))}</td>
                  <td className="py-4"><SubscriptionStatusBadge status={String(transaction.status || 'pending')} /></td>
                  <td className="py-4 font-mono text-slate-300">{formatDateTime(String(transaction.createdAt || ''))}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-500">No invoices or payment records available for this account.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
