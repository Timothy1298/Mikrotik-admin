import { ArrowRight, Clock3, Plus, ShieldAlert, Ticket, UserPlus2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { SectionLoader } from '@/components/feedback/SectionLoader';
import { TableLoader } from '@/components/feedback/TableLoader';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { userManagementTabs } from '@/config/module-tabs';
import { appRoutes } from '@/config/routes';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { AddSubscriberDialog, UsersStatsRow } from '@/features/users/components';
import { useUsers, useUsersStats } from '@/features/users/hooks';
import { useDisclosure } from '@/hooks/ui/useDisclosure';
import { formatDateTime } from '@/lib/formatters/date';
import { can } from '@/lib/permissions/can';
import { permissions } from '@/lib/permissions/permissions';

export function UserManagementOverviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser(true);
  const addDisclosure = useDisclosure(false);
  const statsQuery = useUsersStats();
  const recentUsersQuery = useUsers({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
  const reviewUsersQuery = useUsers({ riskStatus: 'flagged', limit: 5 });
  if (statsQuery.isPending) {
    return <TableLoader />;
  }

  if (statsQuery.isError || !statsQuery.data) {
    return <ErrorState title="Unable to load user management overview" description="The admin user overview could not be loaded. Retry after confirming the backend admin users API is available." onAction={() => void statsQuery.refetch()} />;
  }

  const stats = statsQuery.data;
  const watchCount = stats.overdueBillingUsers + stats.usersWithOpenSupportTickets + stats.usersWithOfflineRouters;

  return (
    <section className="space-y-6">
      <PageHeader title="User Management" description="Command-center overview for customer identity, trial pressure, billing risk, support impact, verification, and security review." meta="Sidebar-driven user operations" />
      {can(currentUser, permissions.usersManage) ? <div className="flex justify-end"><Button leftIcon={<Plus className="h-4 w-4" />} onClick={addDisclosure.onOpen}>Add Subscriber</Button></div> : null}

      <Tabs tabs={[...userManagementTabs]} value={location.pathname} onChange={navigate} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Primary actions</CardTitle>
            <CardDescription>Most-used subscriber operations, promoted for faster lookup during onboarding and account review.</CardDescription>
          </div>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          {can(currentUser, permissions.usersManage) ? <Button leftIcon={<Plus className="h-4 w-4" />} onClick={addDisclosure.onOpen}>Add Subscriber</Button> : null}
          <Button variant="outline" onClick={() => navigate(appRoutes.usersAll)}>Open All Subscribers</Button>
          <Button variant="outline" onClick={() => navigate(appRoutes.usersSuspended)}>Suspended Accounts</Button>
          <Button variant="outline" onClick={() => navigate(appRoutes.usersBillingRisk)}>Billing Risk Queue</Button>
          <Button variant="outline" onClick={() => navigate(appRoutes.usersSupportImpact)}>Support Impact Queue</Button>
        </div>
      </Card>

      <UsersStatsRow stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Attention load" value={String(watchCount)} progress={Math.min(100, watchCount * 5)} />
        <MetricCard title="Verification pending" value={String(stats.totalUsers - stats.verifiedUsers)} progress={stats.totalUsers ? Math.round(((stats.totalUsers - stats.verifiedUsers) / stats.totalUsers) * 100) : 0} />
        <MetricCard title="Billing pressure" value={String(stats.overdueBillingUsers)} progress={Math.min(100, stats.overdueBillingUsers * 10)} />
        <MetricCard title="Support-linked users" value={String(stats.usersWithOpenSupportTickets)} progress={Math.min(100, stats.usersWithOpenSupportTickets * 10)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Users needing attention</CardTitle>
              <CardDescription>Flagged, overdue, or support-impacted accounts that likely need an operator decision next.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            <StatCard title="Billing risk" value={String(stats.overdueBillingUsers)} description="Accounts with overdue subscription pressure." icon={Clock3} tone="warning" />
            <StatCard title="Security review" value={String(reviewUsersQuery.data?.pagination.total || 0)} description="Flagged accounts under manual or automated review." icon={ShieldAlert} tone="danger" />
            <StatCard title="Support impact" value={String(stats.usersWithOpenSupportTickets)} description="Users currently tied to active support workload." icon={Ticket} tone="info" />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick jumps</CardTitle>
              <CardDescription>Open the highest-signal user queues directly from the overview.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.usersVerificationQueue}>Verification Queue <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.usersBillingRisk}>Billing Risk <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.usersSecurityReview}>Security Review <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.usersSupportImpact}>Support Impact <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent signups</CardTitle>
              <CardDescription>Newest accounts entering the platform and likely to need onboarding visibility.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {recentUsersQuery.isPending ? <SectionLoader /> : recentUsersQuery.isError ? <ErrorState title="Unable to load recent signups" description="Retry after confirming the users directory endpoint is available." onAction={() => void recentUsersQuery.refetch()} /> : (recentUsersQuery.data?.items || []).length ? recentUsersQuery.data?.items.map((user) => (
              <div key={user.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-text-primary">{user.name}</p>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                  </div>
                  <span className="font-mono text-xs text-text-muted">{formatDateTime(user.createdAt)}</span>
                </div>
              </div>
            )) : <EmptyState icon={UserPlus2} title="No recent signups" description="Recent user records will appear here as the backend directory grows." />}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Review queue</CardTitle>
              <CardDescription>Flagged users requiring security or operational review before issues spread.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {reviewUsersQuery.isPending ? <SectionLoader /> : reviewUsersQuery.isError ? <ErrorState title="Unable to load review queue" description="Retry after confirming the flagged users query is available." onAction={() => void reviewUsersQuery.refetch()} /> : (reviewUsersQuery.data?.items || []).length ? reviewUsersQuery.data?.items.map((user) => (
              <div key={user.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-text-primary">{user.name}</p>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                  </div>
                  <Button variant="ghost" onClick={() => navigate(appRoutes.usersSecurityReview)}>Open queue</Button>
                </div>
              </div>
            )) : <EmptyState icon={ShieldAlert} title="Review queue is clear" description="No flagged users are awaiting review right now." />}
          </div>
        </Card>
      </div>

      <AddSubscriberDialog open={addDisclosure.open} onClose={addDisclosure.onClose} />
    </section>
  );
}
