import { AlertTriangle, CheckCircle2, ShieldCheck, Ticket, User2, UserMinus, WifiOff } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import type { UserDirectoryStats } from '@/features/users/types/user.types';

export function UsersStatsRow({ stats }: { stats: UserDirectoryStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total users" value={String(stats.totalUsers)} description="All customer accounts tracked in the control plane." icon={User2} tone="info" />
      <StatCard title="Active users" value={String(stats.activeUsers)} description="Accounts currently able to access services." icon={CheckCircle2} tone="success" />
      <StatCard title="Trial users" value={String(stats.trialUsers)} description="Customers currently inside the trial lifecycle." icon={ShieldCheck} tone="info" />
      <StatCard title="Suspended" value={String(stats.suspendedUsers)} description="Accounts manually or operationally suspended." icon={UserMinus} tone="danger" />
      <StatCard title="Verified" value={String(stats.verifiedUsers)} description="Users with verified email and trusted onboarding." icon={ShieldCheck} tone="success" />
      <StatCard title="Overdue billing" value={String(stats.overdueBillingUsers)} description="Accounts or subscriptions requiring billing follow-up." icon={AlertTriangle} tone="warning" />
      <StatCard title="Offline routers" value={String(stats.usersWithOfflineRouters)} description="Customer routers currently inactive or offline." icon={WifiOff} tone="warning" />
      <StatCard title="Open tickets" value={String(stats.usersWithOpenSupportTickets)} description="Support backlog attached to customer accounts." icon={Ticket} tone="info" />
    </div>
  );
}
