import { UserActionDialog } from '@/features/users/components/UserActionDialog';

export function ForceLogoutDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <UserActionDialog {...props} title="Force logout" description="Revoke all active sessions for this user. Use this for security review, account recovery, or operational containment." confirmLabel="Revoke all sessions" confirmVariant="danger" />;
}
