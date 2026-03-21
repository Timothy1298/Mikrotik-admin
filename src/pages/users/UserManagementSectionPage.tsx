import { useEffect, useMemo, useState } from 'react';
import { Flag, Plus, RefreshCw, ShieldAlert, Ticket, UserPlus2, Wallet } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TableLoader } from '@/components/feedback/TableLoader';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataToolbar } from '@/components/shared/DataToolbar';
import { MetricCard } from '@/components/shared/MetricCard';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { userManagementTabs } from '@/config/module-tabs';
import {
  AddUserFlagDialog,
  AddUserNoteDialog,
  AddSubscriberDialog,
  DeleteSubscriberDialog,
  EditSubscriberProfileDialog,
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
  useDeleteUser,
  useEditUserProfile,
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
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { can } from '@/lib/permissions/can';
import { permissions } from '@/lib/permissions/permissions';

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

const defaultUserFilters: Pick<UsersQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'> = {
  page: 1,
  limit: 50,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

function areUserFiltersEqual(current: UsersQuery, next: UsersQuery) {
  const currentEntries = Object.entries(current);
  const nextEntries = Object.entries(next);

  if (currentEntries.length !== nextEntries.length) {
    return false;
  }

  return currentEntries.every(([key, value]) => next[key as keyof UsersQuery] === value);
}

export function UserManagementSectionPage({ section }: { section: UserManagementSection }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser(true);
  const sectionMeta = userManagementSections[section];
  const lockedFilters = sectionMeta.lockedFilters ?? {};
  const sectionFilters = { ...lockedFilters, ...defaultUserFilters };
  const hiddenFields = Object.keys(lockedFilters) as Array<keyof UsersQuery>;

  const [filters, setFilters] = useState<UsersQuery>(sectionFilters);
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
  const deleteDisclosure = useDisclosure(false);
  const editProfileDisclosure = useDisclosure(false);
  const addSubscriberDisclosure = useDisclosure(false);

  const effectiveFilters = useMemo(() => ({ ...filters, ...lockedFilters }), [filters, lockedFilters]);
  const usersQuery = useUsers(effectiveFilters);
  const statsQuery = useUsersStats();
  const detailQuery = useUser(selectedUser?.id || '');

  useEffect(() => {
    setFilters((current) => (areUserFiltersEqual(current, sectionFilters) ? current : sectionFilters));
  }, [section]);

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
  const deleteMutation = useDeleteUser();
  const editProfileMutation = useEditUserProfile();

  const baseRows = usersQuery.data?.items || [];
  const rows = section === 'internal-notes'
    ? baseRows.filter((row) => (row.flagCount || 0) > 0 || ['watchlist', 'flagged'].includes(row.riskStatus))
    : baseRows;
  const total = section === 'internal-notes' ? rows.length : (usersQuery.data?.pagination.total || rows.length);
  const totalMrr = rows.reduce((sum, row) => sum + (row.monthlyValue || 0), 0);
  const totalFlags = rows.reduce((sum, row) => sum + (row.flagCount || 0), 0);
  const totalOpenTickets = rows.reduce((sum, row) => sum + (row.openTickets || 0), 0);
  const pagination = usersQuery.data?.pagination;

  const metrics = useMemo(() => [
    { title: 'Visible users', value: String(total), progress: Math.min(100, total || 0), icon: UserPlus2 },
    { title: 'Visible MRR', value: formatCurrency(totalMrr), progress: Math.min(100, Math.round(totalMrr > 0 ? 100 : 0)), icon: Wallet },
    { title: 'Open tickets', value: String(totalOpenTickets), progress: Math.min(100, totalOpenTickets * 5), icon: Ticket },
    { title: 'Flagged context', value: String(totalFlags), progress: Math.min(100, totalFlags * 10), icon: Flag },
  ], [total, totalFlags, totalMrr, totalOpenTickets]);

  const activeFiltersCount = Object.entries(filters).filter(([, value]) => value && value !== '').length;
  const Icon = sectionIcons[section];
  const canManageUsers = can(currentUser, permissions.usersManage);
  const canDeleteUsers = can(currentUser, permissions.usersDelete);

  const openUserContext = (user: UserRow) => {
    setSelectedUser(user);
    detailDisclosure.onOpen();
  };

  return (
    <section className="space-y-6">
      <PageHeader title={sectionMeta.title} description={sectionMeta.description} meta="User management" />

      <Tabs tabs={[...userManagementTabs]} value={location.pathname} onChange={navigate} />

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
            <div className="icon-block-primary rounded-2xl p-2 text-text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{sectionMeta.title}</p>
              <p className="font-mono text-xs text-text-muted">{total} visible users{activeFiltersCount ? ` • ${activeFiltersCount} active filters` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={`${effectiveFilters.sortBy || 'createdAt'}:${effectiveFilters.sortOrder || 'desc'}`}
              onChange={(event) => {
                const [sortBy, sortOrder] = event.target.value.split(':');
                setFilters((current) => ({ ...current, sortBy, sortOrder: sortOrder as 'asc' | 'desc', page: 1, ...lockedFilters }));
              }}
              options={[
                { label: 'Newest first', value: 'createdAt:desc' },
                { label: 'Oldest first', value: 'createdAt:asc' },
                { label: 'Name A-Z', value: 'name:asc' },
                { label: 'Name Z-A', value: 'name:desc' },
                { label: 'Highest MRR', value: 'monthlyValue:desc' },
                { label: 'Most routers', value: 'routersCount:desc' },
                { label: 'Most support tickets', value: 'openTickets:desc' },
              ]}
            />
            {usersQuery.isFetching && !usersQuery.isPending ? <p className="font-mono text-xs text-text-muted">Refreshing data...</p> : null}
            {section === 'all' && canManageUsers ? <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={addSubscriberDisclosure.onOpen}>Add Subscriber</Button> : null}
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
              onSuspend={canManageUsers ? (user) => { setSelectedUser(user); suspendDisclosure.onOpen(); } : undefined}
              onReactivate={canManageUsers ? (user) => { setSelectedUser(user); reactivateDisclosure.onOpen(); } : undefined}
              onVerify={canManageUsers ? (user) => { setSelectedUser(user); verifyDisclosure.onOpen(); } : undefined}
              onResendVerification={canManageUsers ? (user) => { setSelectedUser(user); resendDisclosure.onOpen(); } : undefined}
              onPasswordReset={canManageUsers ? (user) => { setSelectedUser(user); passwordResetDisclosure.onOpen(); } : undefined}
              onForceLogout={canManageUsers ? (user) => { setSelectedUser(user); forceLogoutDisclosure.onOpen(); } : undefined}
              onExtendTrial={canManageUsers ? (user) => { setSelectedUser(user); extendDisclosure.onOpen(); } : undefined}
              onAddNote={canManageUsers ? (user) => { setSelectedUser(user); noteDisclosure.onOpen(); } : undefined}
              onAddFlag={canManageUsers ? (user) => { setSelectedUser(user); flagDisclosure.onOpen(); } : undefined}
              onEditProfile={canManageUsers ? (user) => { setSelectedUser(user); editProfileDisclosure.onOpen(); } : undefined}
              onDelete={canDeleteUsers ? (user) => { setSelectedUser(user); deleteDisclosure.onOpen(); } : undefined}
            />
          )}
        </div>
        {pagination ? (
          <div className="mt-4">
            <Pagination
              page={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setFilters((current) => ({ ...current, page, ...lockedFilters }))}
            />
          </div>
        ) : null}
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
        onDelete={deleteDisclosure.onOpen}
        onEditProfile={editProfileDisclosure.onOpen}
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
      <DeleteSubscriberDialog
        open={deleteDisclosure.open}
        loading={deleteMutation.isPending}
        userName={detailQuery.data?.profile.name || selectedUser?.name}
        onClose={deleteDisclosure.onClose}
        onConfirm={(reason) => selectedUser && deleteMutation.mutate([selectedUser.id, reason] as never, {
          onSuccess: () => {
            deleteDisclosure.onClose();
            detailDisclosure.onClose();
          },
        })}
      />
      {detailQuery.data ? (
        <EditSubscriberProfileDialog
          open={editProfileDisclosure.open}
          loading={editProfileMutation.isPending}
          user={detailQuery.data}
          onClose={editProfileDisclosure.onClose}
          onConfirm={(payload) => selectedUser && editProfileMutation.mutate([selectedUser.id, payload] as never, {
            onSuccess: () => editProfileDisclosure.onClose(),
          })}
        />
      ) : null}
      <AddSubscriberDialog open={addSubscriberDisclosure.open} onClose={addSubscriberDisclosure.onClose} />
    </section>
  );
}
