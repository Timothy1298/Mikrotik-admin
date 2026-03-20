import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Activity } from "lucide-react";
import { ActivityTimeline } from "@/components/data-display/ActivityTimeline";
import { EmptyState } from "@/components/feedback/EmptyState";
import { InlineError } from "@/components/feedback/InlineError";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useVpnServerActivity } from "@/features/vpn-servers/hooks/useVpnServers";

dayjs.extend(relativeTime);

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function VpnServerActivityPanel({ serverId }: { serverId: string }) {
  const [page, setPage] = useState(1);
  const [timelineItems, setTimelineItems] = useState<Array<{ id: string; title: string; time: string; description: string }>>([]);
  const activityQuery = useVpnServerActivity(serverId, { page, limit: 10 });

  useEffect(() => {
    if (!activityQuery.data) return;
    const mapped = activityQuery.data.items.map((item) => ({
      id: item.id,
      title: titleCase(item.action || item.type),
      time: dayjs(item.timestamp).fromNow(),
      description: item.actor ? `${item.actor} — ${item.summary}` : item.summary,
    }));
    setTimelineItems((current) => {
      if (page === 1) return mapped;
      const seen = new Set(current.map((item) => item.id));
      return [...current, ...mapped.filter((item) => !seen.has(item.id))];
    });
  }, [activityQuery.data, page]);

  const handleRefresh = () => {
    setPage(1);
    void activityQuery.refetch();
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Server Activity</CardTitle>
          <CardDescription>Audit and system event history for this VPN server node.</CardDescription>
        </div>
        <RefreshButton loading={activityQuery.isFetching} onClick={handleRefresh} />
      </CardHeader>
      {activityQuery.isPending && !timelineItems.length ? <SectionLoader /> : null}
      {activityQuery.isError ? <InlineError message="Activity log unavailable" /> : null}
      {!activityQuery.isPending && !activityQuery.isError && !timelineItems.length ? <EmptyState icon={Activity} title="No activity recorded for this server yet" description="Admin and infrastructure events will appear here once operations are performed on this node." /> : null}
      {timelineItems.length ? <ActivityTimeline items={timelineItems.map(({ title, time, description }) => ({ title, time, description }))} /> : null}
      {activityQuery.data?.pagination && activityQuery.data.pagination.page < activityQuery.data.pagination.pages ? (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setPage((current) => current + 1)}>Load more</Button>
        </div>
      ) : null}
    </Card>
  );
}
