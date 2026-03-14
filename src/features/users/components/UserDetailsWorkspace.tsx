import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { appRoutes } from '@/config/routes';
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
}) {
  const navigate = useNavigate();

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
          <div className="flex flex-wrap gap-2">
            {showRouteLink ? <Button variant="outline" onClick={() => navigate(appRoutes.userDetail(user.id))}>Open full page</Button> : null}
            <Button variant="outline" onClick={onResendVerification}>Resend verification</Button>
            <Button variant="outline" onClick={onPasswordReset}>Send password reset</Button>
            <Button variant="outline" onClick={onForceLogout}>Force logout</Button>
            <Button onClick={onAddFlag}>Add flag</Button>
          </div>
        </div>
        <UserQuickActions
          user={user}
          onSuspend={onSuspend}
          onReactivate={onReactivate}
          onVerify={onVerify}
          onExtendTrial={onExtendTrial}
          onAddNote={onAddNote}
        />
      </Card>

      <UserSummaryCards user={user} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <UserProfileCard user={user} />
        <UserAccountHealthCard user={user} />
      </div>

      <UserServicesPanel user={user} />
      <UserRoutersTable user={user} />
      <UserBillingPanel user={user} />
      <UserSecurityPanel user={user} />
      <UserSupportPanel user={user} />
      <UserFlagsPanel user={user} onRemoveFlag={onRemoveFlag} />
      <UserInternalNotesPanel user={user} />
      <Card>
        <UserActivityTimeline user={user} />
      </Card>
    </div>
  );
}
