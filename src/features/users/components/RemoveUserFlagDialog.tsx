import type { UserDetail } from '@/features/users/types/user.types';
import { UserActionDialog } from '@/features/users/components/UserActionDialog';

export function RemoveUserFlagDialog({
  open,
  loading,
  flag,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  flag: UserDetail['flags'][number] | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  return (
    <UserActionDialog
      open={open}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Remove account flag"
      description={flag ? `Remove "${flag.flag}" from this account and capture why the review flag is being cleared.` : 'Remove the selected account flag.'}
      confirmLabel="Remove flag"
      confirmVariant="danger"
    />
  );
}
