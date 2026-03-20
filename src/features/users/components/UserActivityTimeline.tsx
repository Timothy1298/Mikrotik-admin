import { useEffect, useMemo, useState } from 'react';
import { ActivityTimeline } from '@/components/data-display/ActivityTimeline';
import { InlineError } from '@/components/feedback/InlineError';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUserActivity } from '@/features/users/hooks';
import type { UserDetail } from '@/features/users/types/user.types';
import { formatRelativeTime } from '@/lib/formatters/date';

function formatActivityMetadata(metadata?: string | Record<string, unknown> | null) {
  if (!metadata) return '';
  if (typeof metadata === 'string') return metadata;

  const entries = Object.entries(metadata)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .slice(0, 4)
    .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`);

  return entries.join(' • ');
}

export function UserActivityTimeline({ user }: { user: UserDetail }) {
  const [page, setPage] = useState(1);
  const activityQuery = useUserActivity(user.id, { page, limit: 10 });
  const pagination = activityQuery.data?.pagination;
  const [items, setItems] = useState(user.activity);

  useEffect(() => {
    setPage(1);
    setItems(user.activity);
  }, [user.id, user.activity]);

  useEffect(() => {
    if (!activityQuery.data?.items) return;
    setItems((current) => {
      if (page === 1) return activityQuery.data.items;
      const existingIds = new Set(current.map((item) => `${item.type}-${item.timestamp}-${item.summary}`));
      const next = [...current];
      activityQuery.data.items.forEach((item) => {
        const key = `${item.type}-${item.timestamp}-${item.summary}`;
        if (!existingIds.has(key)) {
          next.push(item);
        }
      });
      return next;
    });
  }, [activityQuery.data, page]);

  const timelineItems = useMemo(() => items.map((item) => ({
    title: item.summary,
    time: formatRelativeTime(item.timestamp),
    description: [item.source, formatActivityMetadata(item.metadata)].filter(Boolean).join(' • '),
  })), [items]);

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
      <ActivityTimeline items={timelineItems} />
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
