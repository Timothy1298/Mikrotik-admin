import { UserActionDialog } from '@/features/users/components/UserActionDialog';

export function ResendVerificationDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <UserActionDialog {...props} title="Resend verification" description="Send a fresh verification email and log why manual intervention was needed." confirmLabel="Send verification email" />;
}
