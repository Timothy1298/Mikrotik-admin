import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { useState } from 'react';

export function UserActionDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = 'primary',
  loading,
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Add context for this action',
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  loading?: boolean;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      <Textarea
        label={reasonLabel}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder={reasonPlaceholder}
      />
      <p className="text-sm text-slate-500">{requireReason ? 'Reason is required for this action.' : 'Optional but recommended for audit clarity.'}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          variant={confirmVariant}
          isLoading={loading}
          disabled={requireReason && !reason.trim()}
          onClick={() => onConfirm(reason.trim())}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
