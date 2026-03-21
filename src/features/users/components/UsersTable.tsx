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
  onEditProfile,
  onDelete,
}: {
  rows: UserRow[];
  onOpenDetails: (row: UserRow) => void;
  onSuspend?: (row: UserRow) => void;
  onReactivate?: (row: UserRow) => void;
  onVerify?: (row: UserRow) => void;
  onResendVerification?: (row: UserRow) => void;
  onPasswordReset?: (row: UserRow) => void;
  onForceLogout?: (row: UserRow) => void;
  onExtendTrial?: (row: UserRow) => void;
  onAddNote?: (row: UserRow) => void;
  onAddFlag?: (row: UserRow) => void;
  onEditProfile?: (row: UserRow) => void;
  onDelete?: (row: UserRow) => void;
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
            className="inline-flex items-center gap-2 font-medium text-text-primary transition hover:text-primary"
            onClick={(event) => {
              event.stopPropagation();
              openFullPage(row.original);
            }}
          >
            {navigatingUserId === row.original.id ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
            {row.original.name}
          </button>
          <p className="font-mono text-xs text-text-muted">{row.original.company}</p>
        </div>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ row }) => <div><p className="text-sm text-text-primary">{row.original.email}</p><p className="font-mono text-xs text-text-muted">{row.original.phone}</p></div>,
    },
    { header: 'Account', cell: ({ row }) => <UserStatusBadge status={row.original.accountStatus} /> },
    { header: 'Subscription', cell: ({ row }) => <SubscriptionStatusBadge status={row.original.subscriptionStatus} /> },
    { header: 'Routers', cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.onlineRouters}/{row.original.routersCount} online</span> },
    { header: 'MRR', cell: ({ row }) => <span className="text-sm text-text-primary">{formatCurrency(row.original.monthlyValue || 0)}</span> },
    { header: 'Billing', cell: ({ row }) => <UserStatusBadge status={row.original.billingState} /> },
    { header: 'Risk', cell: ({ row }) => <UserStatusBadge status={row.original.riskStatus} /> },
    { header: 'Last login', cell: ({ row }) => <span className="font-mono text-sm text-text-secondary">{formatDateTime(row.original.lastLoginAt)}</span> },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <Dropdown
          items={[
            { label: 'Open full page', onClick: () => openFullPage(row.original) },
            { label: 'Open workspace', onClick: () => onOpenDetails(row.original) },
            onEditProfile ? { label: 'Edit profile', onClick: () => onEditProfile(row.original) } : null,
            row.original.verificationStatus !== 'verified' && onVerify
              ? { label: 'Verify user', onClick: () => onVerify(row.original) }
              : onExtendTrial ? { label: 'Extend trial', onClick: () => onExtendTrial(row.original) } : null,
            row.original.verificationStatus !== 'verified' && onResendVerification
              ? { label: 'Resend verification', onClick: () => onResendVerification(row.original) }
              : onAddNote ? { label: 'Add note', onClick: () => onAddNote(row.original) } : null,
            onPasswordReset ? { label: 'Send password reset', onClick: () => onPasswordReset(row.original) } : null,
            onForceLogout ? { label: 'Force logout', onClick: () => onForceLogout(row.original) } : null,
            onAddFlag ? { label: 'Flag account', onClick: () => onAddFlag(row.original) } : null,
            row.original.accountStatus === 'suspended'
              ? (onReactivate ? { label: 'Reactivate account', onClick: () => onReactivate(row.original) } : null)
              : (onSuspend ? { label: 'Suspend account', onClick: () => onSuspend(row.original), danger: true } : null),
            onDelete ? { label: 'Delete subscriber', onClick: () => onDelete(row.original), danger: true } : null,
          ].filter(Boolean) as Array<{ label: string; onClick: () => void; danger?: boolean }>}
        />
      ),
    },
  ], [navigatingUserId, navigate, onAddFlag, onAddNote, onDelete, onEditProfile, onExtendTrial, onForceLogout, onOpenDetails, onPasswordReset, onReactivate, onResendVerification, onSuspend, onVerify]);

  return <DataTable data={rows} columns={columns} onRowClick={openFullPage} emptyTitle="No users found" emptyDescription="Adjust your filters or onboard a new customer to populate the directory." />;
}
