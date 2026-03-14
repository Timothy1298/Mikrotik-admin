import { UserActionDialog } from '@/features/users/components/UserActionDialog';

export function SendPasswordResetDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <UserActionDialog {...props} title="Send password reset" description="Trigger a password reset email for the user and capture the reason for the security action." confirmLabel="Send reset email" confirmVariant="danger" />;
}
