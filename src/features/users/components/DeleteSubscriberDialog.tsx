import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { InlineError } from '@/components/feedback/InlineError';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';

export function DeleteSubscriberDialog({
  open,
  loading,
  userName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  userName?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleClose = () => {
    setReason('');
    setInlineError(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setInlineError('A deletion reason is required.');
      return;
    }

    setInlineError(null);
    onConfirm(reason.trim());
  };

  return (
    <Modal
      open={open}
      title="Delete Subscriber"
      description="This permanently removes the subscriber account from the system."
      onClose={handleClose}
    >
      <div className="rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-slate-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" />
          <p>
            This will permanently delete {userName ? <span className="font-semibold text-slate-100">{userName}</span> : 'the subscriber account'}.
            {' '}This action cannot be undone.
          </p>
        </div>
      </div>

      <Textarea
        label="Reason"
        placeholder="Why is this account being deleted?"
        value={reason}
        onChange={(event) => {
          setInlineError(null);
          setReason(event.target.value);
        }}
      />

      {inlineError ? <InlineError message={inlineError} /> : null}

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="button" variant="danger" isLoading={loading} onClick={handleConfirm}>
          Delete Subscriber
        </Button>
      </div>
    </Modal>
  );
}
