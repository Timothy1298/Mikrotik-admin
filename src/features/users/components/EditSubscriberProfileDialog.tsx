import { useEffect, useState, type FormEvent } from 'react';
import { InlineError } from '@/components/feedback/InlineError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import type { EditUserProfilePayload, UserDetail } from '@/features/users/types/user.types';

export function EditSubscriberProfileDialog({
  open,
  loading,
  user,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  user: UserDetail;
  onClose: () => void;
  onConfirm: (payload: EditUserProfilePayload) => void;
}) {
  const [form, setForm] = useState<EditUserProfilePayload>({
    name: user.profile.name,
    phone: user.profile.phone || '',
    company: user.profile.company || '',
    country: user.profile.country || '',
    reason: '',
  });
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: user.profile.name,
      phone: user.profile.phone || '',
      company: user.profile.company || '',
      country: user.profile.country || '',
      reason: '',
    });
    setInlineError(null);
  }, [open, user]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name?.trim()) {
      setInlineError('Name is required.');
      return;
    }

    setInlineError(null);
    onConfirm({
      name: form.name.trim(),
      phone: form.phone?.trim() || undefined,
      company: form.company?.trim() || undefined,
      country: form.country?.trim() || undefined,
      reason: form.reason?.trim() || undefined,
    });
  };

  const handleChange = <T extends keyof EditUserProfilePayload>(key: T, value: EditUserProfilePayload[T]) => {
    setInlineError(null);
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <Modal
      open={open}
      title="Edit Subscriber Profile"
      description="Update the subscriber profile fields that admins are allowed to correct."
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            required
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Company"
            value={form.company}
            onChange={(event) => handleChange('company', event.target.value)}
          />
          <Input
            label="Country"
            value={form.country}
            onChange={(event) => handleChange('country', event.target.value)}
          />
        </div>

        <Textarea
          label="Reason"
          placeholder="Why are these profile fields being updated?"
          value={form.reason}
          onChange={(event) => handleChange('reason', event.target.value)}
        />

        {inlineError ? <InlineError message={inlineError} /> : null}

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
