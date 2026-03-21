import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  applyServicePlan,
  createRouterQueue,
  deleteRouterQueue,
  getRouterQueues,
  updateRouterQueue,
} from "@/features/queues/api/queues";
import type { ApplyPlanPayload, QueuePayload } from "@/features/queues/types/queue.types";

function invalidateQueues(queryClient: ReturnType<typeof useQueryClient>, routerId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.routerQueues(routerId) });
}

export function useQueues(routerId: string) {
  return useQuery({
    queryKey: queryKeys.routerQueues(routerId),
    queryFn: () => getRouterQueues(routerId),
    enabled: Boolean(routerId),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateQueue(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: QueuePayload) => createRouterQueue(routerId, payload),
    onSuccess: async () => {
      toast.success("Queue created");
      await invalidateQueues(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create queue"),
  });
}

export function useUpdateQueue(routerId: string, queueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<QueuePayload>) => updateRouterQueue(routerId, queueId, payload),
    onSuccess: async () => {
      toast.success("Queue updated");
      await invalidateQueues(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update queue"),
  });
}

export function useDeleteQueue(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queueId: string) => deleteRouterQueue(routerId, queueId),
    onSuccess: async () => {
      toast.success("Queue removed");
      await invalidateQueues(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to remove queue"),
  });
}

export function useApplyPlan(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplyPlanPayload) => applyServicePlan(routerId, payload),
    onSuccess: async () => {
      toast.success("Service plan applied to subscriber");
      await invalidateQueues(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to apply service plan"),
  });
}
