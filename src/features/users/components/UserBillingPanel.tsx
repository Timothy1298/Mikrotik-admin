import { InlineError } from '@/components/feedback/InlineError';
import { SectionLoader } from '@/components/feedback/SectionLoader';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUserBilling } from '@/features/users/hooks';
import { formatCurrency } from '@/lib/formatters/currency';
import { formatDateTime } from '@/lib/formatters/date';
import { SubscriptionStatusBadge } from '@/features/users/components/SubscriptionStatusBadge';
import type { UserDetail } from '@/features/users/types/user.types';

export function UserBillingPanel({ user }: { user: UserDetail }) {
  const billingQuery = useUserBilling(user.id);
  const billingSummary = billingQuery.data?.summary || user.billing?.summary;
  const subscriptions = billingQuery.data?.subscriptions || [];
  const transactions = billingQuery.data?.transactions || (user.billing?.recentTransactions || user.billing?.transactions || []).map((transaction) => ({
    id: String(transaction._id || transaction.id || transaction.transactionId || Math.random()),
    transactionId: String(transaction.transactionId || transaction._id || 'N/A'),
    type: String(transaction.type || '-'),
    amount: Number(transaction.amount || 0),
    currency: String(transaction.currency || user.billing?.currency || 'USD'),
    status: String(transaction.status || 'pending'),
    createdAt: String(transaction.createdAt || ''),
  }));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><CardTitle>Billing summary</CardTitle><CardDescription>Plan, billing cycle, next charge, and overdue pressure.</CardDescription></div>
            <RefreshButton loading={billingQuery.isFetching} onClick={() => void billingQuery.refetch()} />
          </div>
        </CardHeader>
        {billingQuery.isPending ? <SectionLoader /> : null}
        {billingQuery.isError ? <InlineError message="Billing data could not be refreshed. Showing the last loaded account snapshot." /> : null}
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex items-center justify-between"><span>Current status</span><SubscriptionStatusBadge status={billingSummary?.status || 'none'} /></div>
          <div className="flex items-center justify-between"><span>Monthly value</span><span>{formatCurrency(billingSummary?.monthlyValue || user.billing?.pricingAmount || 0, String(user.billing?.currency || 'USD'))}</span></div>
          <div className="flex items-center justify-between"><span>Next billing date</span><span>{formatDateTime(billingSummary?.nextBillingDate || user.billing?.nextBillingDate || null)}</span></div>
          <div className="flex items-center justify-between"><span>Trial ending soon</span><span>{billingSummary?.trialEndingSoon ? 'Yes' : 'No'}</span></div>
          {subscriptions[0] ? <div className="flex items-center justify-between"><span>Active plan</span><span>{subscriptions[0].planType}</span></div> : null}
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
                <tr key={transaction.id}>
                  <td className="py-4 font-mono text-slate-100">{transaction.transactionId}</td>
                  <td className="py-4 text-slate-300">{transaction.type}</td>
                  <td className="py-4 text-slate-300">{formatCurrency(transaction.amount, transaction.currency)}</td>
                  <td className="py-4"><SubscriptionStatusBadge status={transaction.status} /></td>
                  <td className="py-4 font-mono text-slate-300">{formatDateTime(transaction.createdAt)}</td>
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
