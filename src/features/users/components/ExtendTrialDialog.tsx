import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export function ExtendTrialDialog({ open, loading, onClose, onConfirm }: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (days: number, reason: string) => void }) {
  const [days, setDays] = useState('7');
  const [reason, setReason] = useState('');
  return (
    <Modal open={open} title="Extend user trial" description="Extend the trial period and capture an operational reason for audit clarity." onClose={onClose}>
      <Input type="number" label="Extra days" value={days} onChange={(event) => setDays(event.target.value)} />
      <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for extending the trial" />
      <div className="flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button isLoading={loading} onClick={() => onConfirm(Number(days || 7), reason)}>Extend trial</Button></div>
    </Modal>
  );
}
