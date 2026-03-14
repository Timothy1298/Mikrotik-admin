import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/data-display/DataTable';
import { Dropdown } from '@/components/ui/Dropdown';
import { appRoutes } from '@/config/routes';
import { formatCurrency } from '@/lib/formatters/currency';
import { formatDateTime } from '@/lib/formatters/date';
import { SubscriptionStatusBadge } from '@/features/users/components/SubscriptionStatusBadge';
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import type { UserRow } from '@/features/users/types/user.types';

export function UsersTable({
  rows,
  onOpenDetails,
  onSuspend,
  onReactivate,
  onVerify,
  onResendVerification,
  onPasswordReset,
  onForceLogout,
  onExtendTrial,
  onAddNote,
  onAddFlag,
}: {
  rows: UserRow[];
  onOpenDetails: (row: UserRow) => void;
  onSuspend: (row: UserRow) => void;
  onReactivate: (row: UserRow) => void;
  onVerify: (row: UserRow) => void;
  onResendVerification: (row: UserRow) => void;
  onPasswordReset: (row: UserRow) => void;
  onForceLogout: (row: UserRow) => void;
  onExtendTrial: (row: UserRow) => void;
  onAddNote: (row: UserRow) => void;
  onAddFlag: (row: UserRow) => void;
}) {
  const navigate = useNavigate();
  const [navigatingUserId, setNavigatingUserId] = useState<string | null>(null);

  const openFullPage = (user: UserRow) => {
    if (navigatingUserId) return;
    setNavigatingUserId(user.id);
    requestAnimationFrame(() => {
      navigate(appRoutes.userDetail(user.id));
    });
  };

  const columns = useMemo<ColumnDef<UserRow>[]>(() => [
    {
      header: 'User',
      cell: ({ row }) => (
        <div className="space-y-1">
          <button
            type="button"
            className="inline-flex items-center gap-2 font-medium text-slate-100 transition hover:text-brand-100"
            onClick={(event) => {
              event.stopPropagation();
              openFullPage(row.original);
            }}
          >
            {navigatingUserId === row.original.id ? <Loader2 className="h-4 w-4 animate-spin text-brand-100" /> : null}
            {row.original.name}
          </button>
          <p className="font-mono text-xs text-slate-500">{row.original.company}</p>
        </div>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ row }) => <div><p className="text-sm text-slate-200">{row.original.email}</p><p className="font-mono text-xs text-slate-500">{row.original.phone}</p></div>,
    },
    { header: 'Account', cell: ({ row }) => <UserStatusBadge status={row.original.accountStatus} /> },
    { header: 'Subscription', cell: ({ row }) => <SubscriptionStatusBadge status={row.original.subscriptionStatus} /> },
    { header: 'Routers', cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.onlineRouters}/{row.original.routersCount} online</span> },
    { header: 'MRR', cell: ({ row }) => <span className="text-sm text-slate-200">{formatCurrency(row.original.monthlyValue || 0)}</span> },
    { header: 'Billing', cell: ({ row }) => <UserStatusBadge status={row.original.billingState} /> },
    { header: 'Risk', cell: ({ row }) => <UserStatusBadge status={row.original.riskStatus} /> },
    { header: 'Last login', cell: ({ row }) => <span className="font-mono text-sm text-slate-400">{formatDateTime(row.original.lastLoginAt)}</span> },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <Dropdown
          items={[
            { label: 'Open full page', onClick: () => openFullPage(row.original) },
            { label: 'Open workspace', onClick: () => onOpenDetails(row.original) },
            row.original.verificationStatus !== 'verified'
              ? { label: 'Verify user', onClick: () => onVerify(row.original) }
              : { label: 'Extend trial', onClick: () => onExtendTrial(row.original) },
            row.original.verificationStatus !== 'verified'
              ? { label: 'Resend verification', onClick: () => onResendVerification(row.original) }
              : { label: 'Add note', onClick: () => onAddNote(row.original) },
            { label: 'Send password reset', onClick: () => onPasswordReset(row.original) },
            { label: 'Force logout', onClick: () => onForceLogout(row.original) },
            { label: 'Flag account', onClick: () => onAddFlag(row.original) },
            row.original.accountStatus === 'suspended'
              ? { label: 'Reactivate account', onClick: () => onReactivate(row.original) }
              : { label: 'Suspend account', onClick: () => onSuspend(row.original), danger: true },
          ]}
        />
      ),
    },
  ], [navigatingUserId, navigate, onAddFlag, onAddNote, onExtendTrial, onForceLogout, onOpenDetails, onPasswordReset, onReactivate, onResendVerification, onSuspend, onVerify]);

  return <DataTable data={rows} columns={columns} onRowClick={openFullPage} emptyTitle="No users found" emptyDescription="Adjust your filters or onboard a new customer to populate the directory." />;
}
