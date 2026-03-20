import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { appRoutes } from '@/config/routes';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { AddRouterAdminDialog } from '@/features/routers/components';
import { SubscriptionStatusBadge } from '@/features/users/components/SubscriptionStatusBadge';
import { UserAccountHealthCard } from '@/features/users/components/UserAccountHealthCard';
import { UserActivityTimeline } from '@/features/users/components/UserActivityTimeline';
import { UserBillingPanel } from '@/features/users/components/UserBillingPanel';
import { UserFlagsPanel } from '@/features/users/components/UserFlagsPanel';
import { UserInternalNotesPanel } from '@/features/users/components/UserInternalNotesPanel';
import { UserProfileCard } from '@/features/users/components/UserProfileCard';
import { UserQuickActions } from '@/features/users/components/UserQuickActions';
import { UserRoutersTable } from '@/features/users/components/UserRoutersTable';
import { UserSecurityPanel } from '@/features/users/components/UserSecurityPanel';
import { UserServicesPanel } from '@/features/users/components/UserServicesPanel';
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import { UserSummaryCards } from '@/features/users/components/UserSummaryCards';
import { UserSupportPanel } from '@/features/users/components/UserSupportPanel';
import type { UserDetail } from '@/features/users/types/user.types';
import { useDisclosure } from '@/hooks/ui/useDisclosure';
import { can } from '@/lib/permissions/can';
import { permissions } from '@/lib/permissions/permissions';
import { useNavigate } from 'react-router-dom';

export function UserDetailsWorkspace({
  user,
  showRouteLink = false,
  onSuspend,
  onReactivate,
  onVerify,
  onResendVerification,
  onPasswordReset,
  onForceLogout,
  onExtendTrial,
  onAddNote,
  onAddFlag,
  onRemoveFlag,
  onDelete,
  onEditProfile,
}: {
  user: UserDetail;
  showRouteLink?: boolean;
  onSuspend: () => void;
  onReactivate: () => void;
  onVerify: () => void;
  onResendVerification: () => void;
  onPasswordReset: () => void;
  onForceLogout: () => void;
  onExtendTrial: () => void;
  onAddNote: () => void;
  onAddFlag: () => void;
  onRemoveFlag: (flag: UserDetail['flags'][number]) => void;
  onDelete: () => void;
  onEditProfile: () => void;
}) {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser(true);
  const addRouterDisclosure = useDisclosure(false);
  const canManageUsers = can(currentUser, permissions.usersManage);
  const canDeleteUsers = can(currentUser, permissions.usersDelete);

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-100">{user.profile.name}</h2>
              <UserStatusBadge status={user.state.accountStatus} />
              <SubscriptionStatusBadge status={user.state.subscriptionStatus} />
              <UserStatusBadge status={user.state.verificationStatus} />
              <UserStatusBadge status={user.state.riskStatus} />
              <Badge tone="info">{user.profile.supportTier}</Badge>
            </div>
            <p className="text-sm text-slate-400">{user.profile.email} • {user.profile.company} • {user.profile.country}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Secondary tools</p>
            <div className="flex flex-wrap gap-2">
            {showRouteLink ? <Button variant="outline" onClick={() => navigate(appRoutes.userDetail(user.id))}>Open full page</Button> : null}
            {canManageUsers ? <Button variant="outline" leftIcon={<Pencil className="h-4 w-4" />} onClick={onEditProfile}>Edit Profile</Button> : null}
            {canManageUsers ? <Button variant="outline" onClick={onResendVerification}>Resend verification</Button> : null}
            {canManageUsers ? <Button variant="outline" onClick={onPasswordReset}>Send password reset</Button> : null}
            {canManageUsers ? <Button variant="outline" onClick={onForceLogout}>Force logout</Button> : null}
            {canManageUsers ? <Button onClick={onAddFlag}>Add flag</Button> : null}
            {canDeleteUsers ? <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={onDelete}>Delete Account</Button> : null}
            </div>
          </div>
        </div>
        {canManageUsers ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Primary actions</p>
        <UserQuickActions
          user={user}
          onSuspend={onSuspend}
          onReactivate={onReactivate}
          onVerify={onVerify}
          onExtendTrial={onExtendTrial}
          onAddNote={onAddNote}
        />
        </div>
        ) : null}
      </Card>

      <UserSummaryCards user={user} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <UserProfileCard user={user} onEdit={canManageUsers ? onEditProfile : undefined} />
        <UserAccountHealthCard user={user} />
      </div>

      <UserServicesPanel user={user} />
      <UserRoutersTable user={user} onAddRouter={addRouterDisclosure.onOpen} />
      <UserBillingPanel user={user} />
      <UserSecurityPanel user={user} />
      <UserSupportPanel user={user} />
      <UserFlagsPanel user={user} onAddFlag={canManageUsers ? onAddFlag : undefined} onRemoveFlag={onRemoveFlag} />
      <UserInternalNotesPanel user={user} onAddNote={canManageUsers ? onAddNote : undefined} />
      <UserActivityTimeline user={user} />
      <AddRouterAdminDialog open={addRouterDisclosure.open} onClose={addRouterDisclosure.onClose} initialUserId={user.id} />
    </div>
  );
}
