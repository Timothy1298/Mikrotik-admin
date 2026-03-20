import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ActivityTimeline } from '@/components/data-display/ActivityTimeline';
import { InlineError } from '@/components/feedback/InlineError';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUserActivity } from '@/features/users/hooks';
import type { UserDetail } from '@/features/users/types/user.types';

dayjs.extend(relativeTime);

export function UserActivityTimeline({ user }: { user: UserDetail }) {
  const [page, setPage] = useState(1);
  const activityQuery = useUserActivity(user.id, { page, limit: 10 });
  const items = activityQuery.data?.items || user.activity;
  const pagination = activityQuery.data?.pagination;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Activity timeline</CardTitle>
            <CardDescription>Recent operator, billing, and service events tied to this subscriber.</CardDescription>
          </div>
          <RefreshButton loading={activityQuery.isFetching} onClick={() => void activityQuery.refetch()} />
        </div>
      </CardHeader>
      {activityQuery.isError ? <InlineError message="Activity data could not be refreshed. Showing the last loaded account snapshot." /> : null}
      <ActivityTimeline items={items.map((item) => ({ title: item.summary, time: dayjs(item.timestamp).fromNow(), description: `${item.source}${item.metadata ? ` • ${item.metadata}` : ''}` }))} />
      {pagination && pagination.page < pagination.pages ? (
        <div className="pt-4">
          <Button variant="outline" onClick={() => setPage((current) => current + 1)}>
            Load More
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
