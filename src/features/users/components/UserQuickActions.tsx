import { BadgeCheck, Ban, Clock3, FilePlus2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { UserDetail } from '@/features/users/types/user.types';

export function UserQuickActions({ user, onSuspend, onReactivate, onVerify, onExtendTrial, onAddNote }: { user: UserDetail; onSuspend: () => void; onReactivate: () => void; onVerify: () => void; onExtendTrial: () => void; onAddNote: () => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {user.state.accountStatus === 'suspended' ? (
        <Button variant="outline" leftIcon={<PlayCircle className="h-4 w-4" />} onClick={onReactivate}>Reactivate</Button>
      ) : (
        <Button variant="outline" leftIcon={<Ban className="h-4 w-4" />} onClick={onSuspend}>Suspend</Button>
      )}
      {user.state.verificationStatus !== 'verified' ? <Button variant="outline" leftIcon={<BadgeCheck className="h-4 w-4" />} onClick={onVerify}>Mark verified</Button> : null}
      <Button variant="outline" leftIcon={<Clock3 className="h-4 w-4" />} onClick={onExtendTrial}>Extend trial</Button>
      <Button leftIcon={<FilePlus2 className="h-4 w-4" />} onClick={onAddNote}>Add note</Button>
    </div>
  );
}
