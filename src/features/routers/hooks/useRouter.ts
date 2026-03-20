import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  addRouterFlag,
  addRouterNote,
  createRouterAdmin,
  deleteRouter,
  disableRouter,
  getRouterActivity,
  getRouterById,
  getRouterInterfaces,
  getRouterLiveHealth,
  markRouterReviewed,
  moveRouterServer,
  pingRouter,
  reactivateRouter,
  rebootRouter,
  regenerateRouterSetup,
  reassignRouterPorts,
  removeRouterFlag,
  reprovisionRouter,
  runRouterCommand,
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

export function useRouterLiveHealth(id: string) {
  return useQuery({
    queryKey: [...queryKeys.routerDetail(id), "live-health"],
    queryFn: () => getRouterLiveHealth(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchInterval: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useRouterInterfaces(id: string) {
  return useQuery({
    queryKey: [...queryKeys.routerDetail(id), "interfaces"],
    queryFn: () => getRouterInterfaces(id),
    enabled: Boolean(id),
    staleTime: 30_000,
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

export function useRebootRouter() {
  return useRouterMutation(rebootRouter, "Reboot command sent to router");
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

export function usePingRouter() {
  return useMutation({
    mutationFn: (id: string) => pingRouter(id),
    onSuccess: (result) => {
      toast[result.reachable ? "success" : "error"](result.reachable ? "Ping successful" : "Ping failed - router unreachable");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ping failed");
    },
  });
}

export function useRunRouterCommand() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { command: string; reason: string } }) => runRouterCommand(id, payload),
    onError: (error: Error) => {
      toast.error(error.message || "Command execution failed");
    },
  });
}

export function useCreateRouterAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRouterAdmin,
    onSuccess: async () => {
      toast.success("Router created successfully");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create router");
    },
  });
}
