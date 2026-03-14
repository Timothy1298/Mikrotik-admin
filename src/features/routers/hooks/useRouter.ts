import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  addRouterFlag,
  addRouterNote,
  deleteRouter,
  disableRouter,
  getRouterActivity,
  getRouterById,
  markRouterReviewed,
  moveRouterServer,
  reactivateRouter,
  regenerateRouterSetup,
  reassignRouterPorts,
  removeRouterFlag,
  reprovisionRouter,
  resetRouterPeer,
} from "@/features/routers/api/getRouters";

export function useRouter(id: string) {
  return useQuery({
    queryKey: queryKeys.routerDetail(id),
    queryFn: () => getRouterById(id),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useRouterActivity(id: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.routerDetail(id), "activity", params],
    queryFn: () => getRouterActivity(id, params),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

function useRouterMutation<TArgs extends unknown[]>(mutationFn: (...args: TArgs) => Promise<{ message?: string }>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async (_, variables) => {
      const id = String(variables[0]);
      toast.success(successMessage);
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(id) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Router action failed");
    },
  });
}

export function useDisableRouter() {
  return useRouterMutation(disableRouter, "Router disabled successfully");
}

export function useReactivateRouter() {
  return useRouterMutation(reactivateRouter, "Router reactivated successfully");
}

export function useReprovisionRouter() {
  return useRouterMutation(reprovisionRouter, "Router reprovisioned successfully");
}

export function useRegenerateRouterSetup() {
  return useRouterMutation(regenerateRouterSetup, "Router setup regenerated successfully");
}

export function useResetRouterPeer() {
  return useRouterMutation(resetRouterPeer, "Router peer reset successfully");
}

export function useReassignRouterPorts() {
  return useRouterMutation(reassignRouterPorts, "Router ports reassigned successfully");
}

export function useMoveRouterServer() {
  return useRouterMutation(moveRouterServer, "Router move request submitted");
}

export function useMarkRouterReviewed() {
  return useRouterMutation(markRouterReviewed, "Router marked as reviewed");
}

export function useAddRouterNote() {
  return useRouterMutation(addRouterNote, "Router note added");
}

export function useAddRouterFlag() {
  return useRouterMutation(addRouterFlag, "Router flag added successfully");
}

export function useRemoveRouterFlag() {
  return useRouterMutation(removeRouterFlag, "Router flag removed successfully");
}

export function useDeleteRouter() {
  return useRouterMutation(deleteRouter, "Router deleted successfully");
}
