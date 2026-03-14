import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

export function AddUserNoteDialog({ open, loading, onClose, onConfirm }: { open: boolean; loading?: boolean; onClose: () => void; onConfirm: (payload: { body: string; category: string }) => void }) {
  const [category, setCategory] = useState('support');
  const [body, setBody] = useState('');
  return (
    <Modal open={open} title="Add internal note" description="Leave internal context for support, billing, networking, or onboarding teams." onClose={onClose}>
      <Select label="Category" value={category} onChange={(event) => setCategory(event.target.value)} options={[{ label: 'Support', value: 'support' }, { label: 'Billing', value: 'billing' }, { label: 'Networking', value: 'networking' }, { label: 'Onboarding', value: 'onboarding' }, { label: 'Technical', value: 'technical' }]} />
      <Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write internal note" />
      <div className="flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button isLoading={loading} onClick={() => onConfirm({ body, category })}>Add note</Button></div>
    </Modal>
  );
}
