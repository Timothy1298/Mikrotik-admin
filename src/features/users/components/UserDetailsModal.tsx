import { X } from 'lucide-react';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageLoader } from '@/components/feedback/PageLoader';
import { Button } from '@/components/ui/Button';
import { UserDetailsWorkspace } from '@/features/users/components/UserDetailsWorkspace';
import type { UserDetail } from '@/features/users/types/user.types';

export function UserDetailsModal({
  open,
  loading,
  user,
  error,
  onClose,
  onRefresh,
  refreshing,
  ...workspaceProps
}: {
  open: boolean;
  loading?: boolean;
  user?: UserDetail;
  error?: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(15,23,42,0.85)] p-4 backdrop-blur-sm md:p-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-background-border bg-background-panel">
        <div className="flex items-center justify-between gap-4 border-b border-background-border px-5 py-4 md:px-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">User workspace</p>
            <h2 className="mt-2 text-2xl font-semibold text-text-primary">{user?.profile.name || 'Loading account details'}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
          {loading ? <PageLoader /> : error || !user ? <ErrorState title="Unable to load user details" description="The account workspace could not be loaded. Retry after checking the admin users API." onAction={onRefresh ? () => void onRefresh() : undefined} /> : <UserDetailsWorkspace user={user} showRouteLink onRefresh={onRefresh} refreshing={refreshing} {...workspaceProps} />}
        </div>
      </div>
    </div>
  );
}
