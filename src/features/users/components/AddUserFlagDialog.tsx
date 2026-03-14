import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

const flagOptions = [
  { label: 'VIP', value: 'vip' },
  { label: 'Watchlist', value: 'watchlist' },
  { label: 'Suspicious', value: 'suspicious' },
  { label: 'Overdue billing', value: 'overdue_billing' },
  { label: 'Support priority', value: 'support_priority' },
  { label: 'Manual review', value: 'manual_review' },
];

const severityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export function AddUserFlagDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: { flag: string; severity: string; description?: string; reason?: string }) => void;
}) {
  const [flag, setFlag] = useState('manual_review');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');

  return (
    <Modal open={open} title="Add account flag" description="Mark this account for follow-up, risk review, or internal operations handling." onClose={onClose}>
      <Select label="Flag type" value={flag} onChange={(event) => setFlag(event.target.value)} options={flagOptions} />
      <Select label="Severity" value={severity} onChange={(event) => setSeverity(event.target.value)} options={severityOptions} />
      <Textarea label="Description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Explain why this flag is being added" />
      <Textarea label="Audit reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional reason captured with the admin action" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} onClick={() => onConfirm({ flag, severity, description: description.trim() || undefined, reason: reason.trim() || undefined })}>Add flag</Button>
      </div>
    </Modal>
  );
}
