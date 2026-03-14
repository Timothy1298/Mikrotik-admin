import { useMemo, useState } from 'react';
import { Flag, RefreshCw, ShieldAlert, Ticket, UserPlus2, Wallet } from 'lucide-react';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TableLoader } from '@/components/feedback/TableLoader';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataToolbar } from '@/components/shared/DataToolbar';
import { MetricCard } from '@/components/shared/MetricCard';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { Card } from '@/components/ui/Card';
import {
  AddUserFlagDialog,
  AddUserNoteDialog,
  ExtendTrialDialog,
  ForceLogoutDialog,
  ReactivateUserDialog,
  RemoveUserFlagDialog,
  ResendVerificationDialog,
  SendPasswordResetDialog,
  SuspendUserDialog,
  UserDetailsModal,
  UserFilters,
  UsersStatsRow,
  UsersTable,
  VerifyUserDialog,
} from '@/features/users/components';
import {
  useAddUserFlag,
  useAddUserNote,
  useExtendUserTrial,
  useForceLogoutUser,
  useReactivateUser,
  useRemoveUserFlag,
  useResendVerification,
  useSendPasswordReset,
  useSuspendUser,
  useUser,
  useUsers,
  useUsersStats,
  useVerifyUser,
} from '@/features/users/hooks';
import type { UserRow, UsersQuery } from '@/features/users/types/user.types';
import type { UserManagementSection } from '@/features/users/utils/user-management-sections';
import { userManagementSections } from '@/features/users/utils/user-management-sections';
import { useDisclosure } from '@/hooks/ui/useDisclosure';
import { formatCurrency } from '@/lib/formatters/currency';

const sectionIcons: Record<UserManagementSection, typeof ShieldAlert> = {
  all: UserPlus2,
  active: UserPlus2,
  trials: UserPlus2,
  suspended: ShieldAlert,
  verification: ShieldAlert,
  'billing-risk': Wallet,
  'security-review': ShieldAlert,
  'support-impact': Ticket,
  'internal-notes': Flag,
};

export function UserManagementSectionPage({ section }: { section: UserManagementSection }) {
  const sectionMeta = userManagementSections[section];
  const lockedFilters = sectionMeta.lockedFilters || {};
  const hiddenFields = Object.keys(lockedFilters) as Array<keyof UsersQuery>;

  const [filters, setFilters] = useState<UsersQuery>({ ...lockedFilters, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<{ id?: string; flag: string; severity: string; description?: string; createdBy: string; createdAt: string } | null>(null);

  const detailDisclosure = useDisclosure(false);
  const suspendDisclosure = useDisclosure(false);
  const reactivateDisclosure = useDisclosure(false);
  const verifyDisclosure = useDisclosure(false);
  const resendDisclosure = useDisclosure(false);
  const passwordResetDisclosure = useDisclosure(false);
  const forceLogoutDisclosure = useDisclosure(false);
  const extendDisclosure = useDisclosure(false);
  const noteDisclosure = useDisclosure(false);
  const flagDisclosure = useDisclosure(false);
  const removeFlagDisclosure = useDisclosure(false);

  const effectiveFilters = { ...filters, ...lockedFilters };
  const usersQuery = useUsers(effectiveFilters);
  const statsQuery = useUsersStats();
  const detailQuery = useUser(selectedUser?.id || '');

  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();
  const verifyMutation = useVerifyUser();
  const resendMutation = useResendVerification();
  const passwordResetMutation = useSendPasswordReset();
  const forceLogoutMutation = useForceLogoutUser();
  const extendMutation = useExtendUserTrial();
  const noteMutation = useAddUserNote();
  const addFlagMutation = useAddUserFlag();
  const removeFlagMutation = useRemoveUserFlag();

  const baseRows = usersQuery.data?.items || [];
  const rows = section === 'internal-notes'
    ? baseRows.filter((row) => (row.flagCount || 0) > 0 || ['watchlist', 'flagged'].includes(row.riskStatus))
    : baseRows;
  const total = section === 'internal-notes' ? rows.length : (usersQuery.data?.pagination.total || rows.length);
  const totalMrr = rows.reduce((sum, row) => sum + (row.monthlyValue || 0), 0);
  const totalFlags = rows.reduce((sum, row) => sum + (row.flagCount || 0), 0);
  const totalOpenTickets = rows.reduce((sum, row) => sum + (row.openTickets || 0), 0);

  const metrics = useMemo(() => [
    { title: 'Visible users', value: String(total), progress: Math.min(100, total || 0), icon: UserPlus2 },
    { title: 'Visible MRR', value: formatCurrency(totalMrr), progress: Math.min(100, Math.round(totalMrr > 0 ? 100 : 0)), icon: Wallet },
    { title: 'Open tickets', value: String(totalOpenTickets), progress: Math.min(100, totalOpenTickets * 5), icon: Ticket },
    { title: 'Flagged context', value: String(totalFlags), progress: Math.min(100, totalFlags * 10), icon: Flag },
  ], [total, totalFlags, totalMrr, totalOpenTickets]);

  const activeFiltersCount = Object.entries(filters).filter(([, value]) => value && value !== '').length;
  const Icon = sectionIcons[section];

  const openUserContext = (user: UserRow) => {
    setSelectedUser(user);
    detailDisclosure.onOpen();
  };

  return (
    <section className="space-y-6">
      <PageHeader title={sectionMeta.title} description={sectionMeta.description} meta="User management" />

      {section === 'all' && statsQuery.data ? <UsersStatsRow stats={statsQuery.data} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.title} title={metric.title} value={metric.value} progress={metric.progress} />)}
      </div>

      <UserFilters
        filters={effectiveFilters}
        hiddenFields={hiddenFields}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch, ...lockedFilters }))}
      />

      <Card>
        <DataToolbar>
          <div className="flex items-center gap-3">
            <div className="icon-block-primary rounded-2xl p-2 text-slate-100">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-100">{sectionMeta.title}</p>
              <p className="font-mono text-xs text-slate-500">{total} visible users{activeFiltersCount ? ` • ${activeFiltersCount} active filters` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {usersQuery.isFetching && !usersQuery.isPending ? <p className="font-mono text-xs text-slate-500">Refreshing data...</p> : null}
            <RefreshButton loading={usersQuery.isFetching || statsQuery.isFetching} onClick={() => { void usersQuery.refetch(); void statsQuery.refetch(); }} />
          </div>
        </DataToolbar>

        <div className="mt-4">
          {usersQuery.isPending ? (
            <TableLoader />
          ) : usersQuery.isError ? (
            <ErrorState title={`Unable to load ${sectionMeta.title.toLowerCase()}`} description="The user directory request failed. Retry after confirming the admin users API is reachable." onAction={() => void usersQuery.refetch()} />
          ) : (
            <UsersTable
              rows={rows}
              onOpenDetails={openUserContext}
              onSuspend={(user) => { setSelectedUser(user); suspendDisclosure.onOpen(); }}
              onReactivate={(user) => { setSelectedUser(user); reactivateDisclosure.onOpen(); }}
              onVerify={(user) => { setSelectedUser(user); verifyDisclosure.onOpen(); }}
              onResendVerification={(user) => { setSelectedUser(user); resendDisclosure.onOpen(); }}
              onPasswordReset={(user) => { setSelectedUser(user); passwordResetDisclosure.onOpen(); }}
              onForceLogout={(user) => { setSelectedUser(user); forceLogoutDisclosure.onOpen(); }}
              onExtendTrial={(user) => { setSelectedUser(user); extendDisclosure.onOpen(); }}
              onAddNote={(user) => { setSelectedUser(user); noteDisclosure.onOpen(); }}
              onAddFlag={(user) => { setSelectedUser(user); flagDisclosure.onOpen(); }}
            />
          )}
        </div>
      </Card>

      <UserDetailsModal
        open={detailDisclosure.open}
        loading={detailQuery.isPending}
        user={detailQuery.data}
        error={detailQuery.isError}
        onClose={detailDisclosure.onClose}
        onSuspend={suspendDisclosure.onOpen}
        onReactivate={reactivateDisclosure.onOpen}
        onVerify={verifyDisclosure.onOpen}
        onResendVerification={resendDisclosure.onOpen}
        onPasswordReset={passwordResetDisclosure.onOpen}
        onForceLogout={forceLogoutDisclosure.onOpen}
        onExtendTrial={extendDisclosure.onOpen}
        onAddNote={noteDisclosure.onOpen}
        onAddFlag={flagDisclosure.onOpen}
        onRemoveFlag={(flag) => { setSelectedFlag(flag); removeFlagDisclosure.onOpen(); }}
      />

      <SuspendUserDialog open={suspendDisclosure.open} loading={suspendMutation.isPending} onClose={suspendDisclosure.onClose} onConfirm={(reason) => selectedUser && suspendMutation.mutate([selectedUser.id, reason] as never, { onSuccess: () => suspendDisclosure.onClose() })} />
      <ReactivateUserDialog open={reactivateDisclosure.open} loading={reactivateMutation.isPending} onClose={reactivateDisclosure.onClose} onConfirm={(reason) => selectedUser && reactivateMutation.mutate([selectedUser.id, reason] as never, { onSuccess: () => reactivateDisclosure.onClose() })} />
      <VerifyUserDialog open={verifyDisclosure.open} loading={verifyMutation.isPending} onClose={verifyDisclosure.onClose} onConfirm={(reason) => selectedUser && verifyMutation.mutate([selectedUser.id, reason] as never, { onSuccess: () => verifyDisclosure.onClose() })} />
      <ResendVerificationDialog open={resendDisclosure.open} loading={resendMutation.isPending} onClose={resendDisclosure.onClose} onConfirm={(reason) => selectedUser && resendMutation.mutate([selectedUser.id, reason] as never, { onSuccess: () => resendDisclosure.onClose() })} />
      <SendPasswordResetDialog open={passwordResetDisclosure.open} loading={passwordResetMutation.isPending} onClose={passwordResetDisclosure.onClose} onConfirm={(reason) => selectedUser && passwordResetMutation.mutate([selectedUser.id, reason] as never, { onSuccess: () => passwordResetDisclosure.onClose() })} />
      <ForceLogoutDialog open={forceLogoutDisclosure.open} loading={forceLogoutMutation.isPending} onClose={forceLogoutDisclosure.onClose} onConfirm={(reason) => selectedUser && forceLogoutMutation.mutate([selectedUser.id, reason] as never, { onSuccess: () => forceLogoutDisclosure.onClose() })} />
      <ExtendTrialDialog open={extendDisclosure.open} loading={extendMutation.isPending} onClose={extendDisclosure.onClose} onConfirm={(days, reason) => selectedUser && extendMutation.mutate([selectedUser.id, days, reason] as never, { onSuccess: () => extendDisclosure.onClose() })} />
      <AddUserNoteDialog open={noteDisclosure.open} loading={noteMutation.isPending} onClose={noteDisclosure.onClose} onConfirm={(payload) => selectedUser && noteMutation.mutate([selectedUser.id, payload] as never, { onSuccess: () => noteDisclosure.onClose() })} />
      <AddUserFlagDialog open={flagDisclosure.open} loading={addFlagMutation.isPending} onClose={flagDisclosure.onClose} onConfirm={(payload) => selectedUser && addFlagMutation.mutate([selectedUser.id, payload] as never, { onSuccess: () => flagDisclosure.onClose() })} />
      <RemoveUserFlagDialog open={removeFlagDisclosure.open} loading={removeFlagMutation.isPending} flag={selectedFlag} onClose={removeFlagDisclosure.onClose} onConfirm={(reason) => {
        if (!selectedUser || !selectedFlag?.id) return;
        removeFlagMutation.mutate([selectedUser.id, selectedFlag.id, reason] as never, { onSuccess: () => removeFlagDisclosure.onClose() });
      }} />
    </section>
  );
}
