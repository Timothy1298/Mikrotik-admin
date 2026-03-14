import { KeyValueGrid } from '@/components/data-display/KeyValueGrid';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/formatters/date';
import type { UserDetail } from '@/features/users/types/user.types';

export function UserProfileCard({ user }: { user: UserDetail }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Identity, onboarding, and customer organization context.</CardDescription>
        </div>
      </CardHeader>
      <KeyValueGrid items={[
        { label: 'Full name', value: user.profile.name },
        { label: 'Email', value: user.profile.email },
        { label: 'Company', value: user.profile.company },
        { label: 'Phone', value: user.profile.phone || 'N/A' },
        { label: 'Country', value: user.profile.country },
        { label: 'Timezone', value: user.profile.timezone },
        { label: 'Account ID', value: user.profile.id },
        { label: 'Created', value: formatDateTime(user.profile.createdAt) },
      ]} />
    </Card>
  );
}
