import { AlertTriangle, CreditCard, Router, Shield } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency } from '@/lib/formatters/currency';
import { formatDateTime } from '@/lib/formatters/date';
import type { UserDetail } from '@/features/users/types/user.types';

export function UserSummaryCards({ user }: { user: UserDetail }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Routers owned" value={String(user.summary.routersOwned)} description={`${user.summary.onlineRouters} online / ${user.summary.offlineRouters} offline`} icon={Router} tone={user.summary.offlineRouters ? 'warning' : 'success'} />
      <StatCard title="Monthly spend" value={formatCurrency(user.summary.totalMonthlySpend)} description={`Subscription state: ${user.state.subscriptionStatus}`} icon={CreditCard} tone={user.state.billingState === 'overdue' ? 'danger' : 'info'} />
      <StatCard title="Open tickets" value={String(user.summary.openTickets)} description={`Support tier: ${user.profile.supportTier}`} icon={AlertTriangle} tone={user.summary.openTickets ? 'warning' : 'success'} />
      <StatCard title="Last login" value={user.summary.lastLogin ? formatDateTime(user.summary.lastLogin) : 'Never'} description={`Failed logins tracked: ${user.summary.failedLoginCount}`} icon={Shield} tone={user.summary.failedLoginCount ? 'warning' : 'success'} />
    </div>
  );
}
