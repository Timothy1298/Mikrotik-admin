import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

export function SuspendUserDialog({ open, loading, onClose, onConfirm }: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <Modal open={open} title="Suspend user" description="This disables login and should be used with a clear operational reason." onClose={onClose}>
      <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for suspension" />
      <div className="flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="danger" isLoading={loading} onClick={() => onConfirm(reason)}>Suspend account</Button></div>
    </Modal>
  );
}
