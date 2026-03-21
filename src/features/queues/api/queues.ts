import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApplyPlanPayload, QueuePayload, QueueStats, RouterQueue } from "@/features/queues/types/queue.types";

export async function getRouterQueues(routerId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: RouterQueue[]; stats: QueueStats }>(endpoints.admin.routerQueues(routerId));
  return {
    items: data.data || [],
    stats: data.stats || { total: 0, active: 0, totalDownloadKbps: 0, totalUploadKbps: 0 },
  };
}

export async function createRouterQueue(routerId: string, payload: QueuePayload) {
  const { data } = await apiClient.post<{ success: boolean; data: RouterQueue }>(endpoints.admin.routerQueues(routerId), payload);
  return data.data;
}

export async function updateRouterQueue(routerId: string, queueId: string, payload: Partial<QueuePayload>) {
  const { data } = await apiClient.put<{ success: boolean; data: RouterQueue }>(endpoints.admin.routerQueue(routerId, queueId), payload);
  return data.data;
}

export async function deleteRouterQueue(routerId: string, queueId: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(endpoints.admin.routerQueue(routerId, queueId));
  return data.data;
}

export async function applyServicePlan(routerId: string, payload: ApplyPlanPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: RouterQueue }>(endpoints.admin.routerApplyPlan(routerId), payload);
  return data.data;
}
