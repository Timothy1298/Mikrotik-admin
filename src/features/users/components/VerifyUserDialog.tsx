import { UserActionDialog } from '@/features/users/components/UserActionDialog';

export function VerifyUserDialog(props: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  return <UserActionDialog {...props} title="Verify user" description="Manually mark this account as verified and capture why the onboarding status is being overridden." confirmLabel="Verify user" />;
}
