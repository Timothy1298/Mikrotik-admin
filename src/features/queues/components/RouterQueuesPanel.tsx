import { useState } from "react";
import { Gauge, Network, Wifi } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { InlineError } from "@/components/feedback/InlineError";
import { useApplyPlan, useCreateQueue, useDeleteQueue, useQueues, useUpdateQueue } from "@/features/queues/hooks/useQueues";
import { ApplyPlanDialog } from "@/features/queues/components/ApplyPlanDialog";
import { CreateQueueDialog } from "@/features/queues/components/CreateQueueDialog";
import { EditQueueDialog } from "@/features/queues/components/EditQueueDialog";
import { QueuesTable } from "@/features/queues/components/QueuesTable";
import type { QueuePayload, RouterQueue } from "@/features/queues/types/queue.types";

function formatLimit(kbps: number) {
  return `${(kbps / 1000).toFixed(kbps >= 1000 ? 1 : 2)} Mbps`;
}

export function RouterQueuesPanel({ routerId }: { routerId: string }) {
  const [selectedQueue, setSelectedQueue] = useState<RouterQueue | null>(null);
  const createDisclosure = useDisclosure(false);
  const editDisclosure = useDisclosure(false);
  const applyDisclosure = useDisclosure(false);
  const queuesQuery = useQueues(routerId);
  const createMutation = useCreateQueue(routerId);
  const updateMutation = useUpdateQueue(routerId, selectedQueue?.id || "");
  const deleteMutation = useDeleteQueue(routerId);
  const applyMutation = useApplyPlan(routerId);

  const rows = queuesQuery.data?.items || [];
  const stats = queuesQuery.data?.stats || { total: 0, active: 0, totalDownloadKbps: 0, totalUploadKbps: 0 };

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Queues</CardTitle>
          <CardDescription>Manage simple queue bandwidth enforcement, bind service plans to subscriber IPs, and monitor aggregate download/upload capacity on this router.</CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Total queues</p>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Active</p>
            <Wifi className="h-4 w-4 text-success" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Total download</p>
            <Gauge className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-lg font-semibold text-text-primary">{formatLimit(stats.totalDownloadKbps)}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Total upload</p>
            <Network className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-lg font-semibold text-text-primary">{formatLimit(stats.totalUploadKbps)}</p>
        </div>
      </div>

      {queuesQuery.isError ? <InlineError message={queuesQuery.error instanceof Error ? queuesQuery.error.message : "Unable to load router queues"} /> : null}

      <QueuesTable
        rows={rows}
        onAddQueue={createDisclosure.onOpen}
        onApplyPlan={applyDisclosure.onOpen}
        onEdit={(queue) => {
          setSelectedQueue(queue);
          editDisclosure.onOpen();
        }}
        onDelete={(queue) => {
          if (!window.confirm(`Delete queue ${queue.name}?`)) return;
          deleteMutation.mutate(queue.id);
        }}
        isLoading={queuesQuery.isPending}
      />

      <CreateQueueDialog
        open={createDisclosure.open}
        loading={createMutation.isPending}
        onClose={createDisclosure.onClose}
        onConfirm={(payload: QueuePayload) => createMutation.mutate(payload, { onSuccess: () => createDisclosure.onClose() })}
      />

      <EditQueueDialog
        open={editDisclosure.open}
        queue={selectedQueue}
        loading={updateMutation.isPending}
        onClose={editDisclosure.onClose}
        onConfirm={(payload) => updateMutation.mutate(payload, { onSuccess: () => editDisclosure.onClose() })}
      />

      <ApplyPlanDialog
        open={applyDisclosure.open}
        loading={applyMutation.isPending}
        onClose={applyDisclosure.onClose}
        onConfirm={(payload) => applyMutation.mutate(payload, { onSuccess: () => applyDisclosure.onClose() })}
      />
    </Card>
  );
}
