import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  addRouterFlag,
  addRouterNote,
  adoptRouterOnboardingClaim,
  cancelRouterOnboardingClaim,
  createRouterAdmin,
  getRouterDiscoveryResults,
  createRouterOnboardingClaim,
  deleteRouter,
  disableRouter,
  getRouterActivity,
  getRouterById,
  getRouterInterfaces,
  getRouterLiveHealth,
  getRouterOnboardingClaims,
  importDiscoveredRouter,
  markRouterReviewed,
  moveRouterServer,
  pingRouter,
  reactivateRouter,
  rebootRouter,
  startRouterDiscoveryScan,
  regenerateRouterSetup,
  reassignRouterPorts,
  removeRouterFlag,
  reprovisionRouter,
  runRouterCommand,
  resetRouterPeer,
  setRouterCredentials,
  verifyDiscoveredRouter,
  testRouterConnection,
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

export function useRouterOnboardingClaims(params?: { status?: string }) {
  return useQuery({
    queryKey: [...queryKeys.routerOnboardingClaims, params],
    queryFn: () => getRouterOnboardingClaims(params),
    staleTime: 0,
    refetchInterval: 10_000,
    refetchOnWindowFocus: false,
  });
}

export function useRouterDiscoveryResults(sessionId?: string) {
  return useQuery({
    queryKey: [...queryKeys.routerDiscoverySessions, sessionId],
    queryFn: () => getRouterDiscoveryResults(sessionId),
    staleTime: 0,
    refetchInterval: (query) => {
      const items = query.state.data || [];
      const activeSession = sessionId ? items.find((item) => item.id === sessionId) : items[0];
      return activeSession?.status === "scanning" || activeSession?.status === "pending" ? 3000 : false;
    },
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: { address?: string; count?: number } }) => pingRouter(id, payload),
    onSuccess: async (result, variables) => {
      toast[result.reachable ? "success" : "error"](result.reachable ? "Ping successful" : "Ping failed - router unreachable");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(variables.id) });
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

export function useSetRouterCredentials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { apiUsername: string; apiPassword?: string; apiPort: number; reason?: string } }) => setRouterCredentials(id, payload),
    onSuccess: async (_, variables) => {
      toast.success("RouterOS API credentials updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update RouterOS API credentials");
    },
  });
}

export function useTestRouterConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => testRouterConnection(id, reason),
    onSuccess: async (_, variables) => {
      toast.success("RouterOS API connection succeeded");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
    },
    onError: (error: Error) => {
      toast.error(error.message || "RouterOS API connection failed");
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

export function useCreateRouterOnboardingClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRouterOnboardingClaim,
    onSuccess: async () => {
      toast.success("Router claim generated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerOnboardingClaims });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate router claim");
    },
  });
}

export function useRouterDiscoveryScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startRouterDiscoveryScan,
    onSuccess: async () => {
      toast.success("Scanning local network...");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDiscoverySessions });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start router discovery");
    },
  });
}

export function useVerifyDiscoveredRouter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyDiscoveredRouter,
    onSuccess: async () => {
      toast.success("Router metadata fetched successfully");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDiscoverySessions });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not verify router credentials");
    },
  });
}

export function useImportDiscoveredRouter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importDiscoveredRouter,
    onSuccess: async () => {
      toast.success("Router imported successfully");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDiscoverySessions });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import discovered router");
    },
  });
}

export function useAdoptRouterOnboardingClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: { name?: string; reason?: string } }) => adoptRouterOnboardingClaim(id, payload),
    onSuccess: async () => {
      toast.success("Router adopted successfully");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerOnboardingClaims });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to adopt router claim");
    },
  });
}

export function useCancelRouterOnboardingClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelRouterOnboardingClaim(id, reason),
    onSuccess: async () => {
      toast.success("Router claim cancelled");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerOnboardingClaims });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel router claim");
    },
  });
}
