import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

export function ReactivateUserDialog({ open, loading, onClose, onConfirm }: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <Modal open={open} title="Reactivate user" description="Restore account access and capture why the account is being re-enabled." onClose={onClose}>
      <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for reactivation" />
      <div className="flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button isLoading={loading} onClick={() => onConfirm(reason)}>Reactivate account</Button></div>
    </Modal>
  );
}
