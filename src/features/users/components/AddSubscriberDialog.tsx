import { useEffect, useState, type FormEvent } from 'react';
import { Mail, Phone, UserRound } from 'lucide-react';
import { InlineError } from '@/components/feedback/InlineError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateUser } from '@/features/users/hooks';
import type { CreateUserPayload } from '@/features/users/types/user.types';

type AddSubscriberFormState = CreateUserPayload;

const initialState: AddSubscriberFormState = {
  name: '',
  email: '',
  password: '',
  phone: '',
  company: '',
  country: '',
  reason: '',
};

export function AddSubscriberDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createUserMutation = useCreateUser();
  const [form, setForm] = useState<AddSubscriberFormState>(initialState);
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(initialState);
      setInlineError(null);
    }
  }, [open]);

  const handleChange = <T extends keyof AddSubscriberFormState>(key: T, value: AddSubscriberFormState[T]) => {
    setInlineError(null);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError(null);

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setInlineError('Full name, email, and initial password are required.');
      return;
    }

    if (form.password.trim().length < 6) {
      setInlineError('Initial password must be at least 6 characters.');
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        phone: form.phone?.trim() || undefined,
        company: form.company?.trim() || undefined,
        country: form.country?.trim() || undefined,
        reason: form.reason?.trim() || undefined,
      });
      onClose();
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : 'Failed to create subscriber');
    }
  };

  return (
    <Modal
      open={open}
      title="Add Subscriber"
      description="Create a new subscriber account and issue their initial portal credentials."
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Full Name"
            placeholder="e.g. John Kamau"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            leftIcon={<UserRound className="h-4 w-4" />}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />
        </div>

        <PasswordInput
          label="Initial Password"
          placeholder="Create a temporary password"
          hint="Min 6 characters — subscriber can change after first login."
          value={form.password}
          onChange={(event) => handleChange('password', event.target.value)}
          required
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Phone Number"
            placeholder="+254 700 000 000"
            value={form.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
            leftIcon={<Phone className="h-4 w-4" />}
          />
          <Input
            label="Company or Plan Name"
            placeholder="e.g. Gold Business Plan"
            value={form.company}
            onChange={(event) => handleChange('company', event.target.value)}
          />
        </div>

        <Input
          label="Country"
          placeholder="KE"
          value={form.country}
          onChange={(event) => handleChange('country', event.target.value)}
        />

        <Textarea
          label="Reason"
          placeholder="Why is admin creating this account?"
          value={form.reason}
          onChange={(event) => handleChange('reason', event.target.value)}
        />

        {inlineError ? <InlineError message={inlineError} /> : null}

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createUserMutation.isPending}>
            Create Subscriber
          </Button>
        </div>
      </form>
    </Modal>
  );
}
