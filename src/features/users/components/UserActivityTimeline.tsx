import { ActivityTimeline } from '@/components/data-display/ActivityTimeline';
import type { UserDetail } from '@/features/users/types/user.types';

export function UserActivityTimeline({ user }: { user: UserDetail }) {
  return <ActivityTimeline items={user.activity.map((item) => ({ title: item.summary, time: item.timestamp, description: `${item.source}${item.metadata ? ` • ${item.metadata}` : ''}` }))} />;
}
