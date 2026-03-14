import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';

export function SubscriptionStatusBadge({ status }: { status: string }) {
  return <UserStatusBadge status={status} />;
}
