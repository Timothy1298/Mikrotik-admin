import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  addRouterFlag,
  addRouterNote,
  adoptRouterOnboardingClaim,
  cancelRouterOnboardingClaim,
  createRouterAdmin,
  getRouterConnectivity,
  getRouterDiagnostics,
  getRouterDiscoveryResults,
  getRouterDownstreamMikrotiks,
  getRouterFlags,
  getRouterMonitoring,
  getRouterNotes,
  getRouterPorts,
  getRouterProvisioning,
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
  markRouterBootstrapApplied,
  moveRouterServer,
  pingRouter,
  promoteObservedRouterPeer,
  reactivateRouter,
  unlinkRouterClient,
  rebootRouter,
  startRouterDiscoveryScan,
  regenerateRouterSetup,
  reassignRouterPorts,
  removeRouterFlag,
  reprovisionRouter,
  runRouterCommand,
  resetRouterPeer,
  discoverRouterDownstreamMikrotiks,
  setRouterCredentials,
  setRouterAccess,
  setRouterSafeMode,
  observeRouterRuntimePeer,
  updateRouterManagementPolicy,
  trackRouterRuntimePeer,
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

export function useRouterConnectivity(id: string) {
  return useQuery({
    queryKey: [...queryKeys.routerDetail(id), "connectivity"],
    queryFn: () => getRouterConnectivity(id),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useRouterPorts(id: string) {
  return useQuery({
    queryKey: [...queryKeys.routerDetail(id), "ports"],
    queryFn: () => getRouterPorts(id),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useRouterMonitoring(id: string) {
  return useQuery({
    queryKey: [...queryKeys.routerDetail(id), "monitoring"],
    queryFn: () => getRouterMonitoring(id),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useRouterProvisioning(id: string) {
  return useQuery({
    queryKey: [...queryKeys.routerDetail(id), "provisioning"],
    queryFn: () => getRouterProvisioning(id),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useRouterDiagnostics(id: string) {
  return useQuery({
    queryKey: [...queryKeys.routerDetail(id), "diagnostics"],
    queryFn: () => getRouterDiagnostics(id),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useRouterNotes(id: string) {
  return useQuery({
    queryKey: [...queryKeys.routerDetail(id), "notes"],
    queryFn: () => getRouterNotes(id),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useRouterFlags(id: string) {
  return useQuery({
    queryKey: [...queryKeys.routerDetail(id), "flags"],
    queryFn: () => getRouterFlags(id),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useRouterDownstreamMikrotiks(id: string) {
  return useQuery({
    queryKey: [...queryKeys.routerDetail(id), "downstream-mikrotiks"],
    queryFn: () => getRouterDownstreamMikrotiks(id),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
    retry: false,
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

function useRouterMutation<TResult extends { message?: string }, TArgs extends unknown[]>(mutationFn: (...args: TArgs) => Promise<TResult>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async (result, variables) => {
      const id = String(variables[0]);
      toast.success(result?.message || successMessage);
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

export function useUnlinkRouterClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => unlinkRouterClient(id, reason),
    onSuccess: async (result, variables) => {
      toast.success(result.message || "Router unlinked from VPN client");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.vpnClients });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Router action failed");
    },
  });
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

export function useUpdateRouterManagementPolicy() {
  return useRouterMutation(updateRouterManagementPolicy, "Router management policy updated");
}

export function useTrackRouterRuntimePeer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, peerId, payload }: { id: string; peerId: string; payload: { name: string; reason?: string } }) => trackRouterRuntimePeer(id, peerId, payload),
    onSuccess: async (result, variables) => {
      toast.success(`Runtime peer is now tracked as ${result.name}`);
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to track runtime peer");
    },
  });
}

export function useObserveRouterRuntimePeer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      peerId,
      payload,
    }: {
      id: string;
      peerId: string;
      payload: { classification: "mikrotik_router" | "wireguard_service" | "site_gateway" | "unknown"; assetLabel?: string; reason?: string };
    }) => observeRouterRuntimePeer(id, peerId, payload),
    onSuccess: async (result, variables) => {
      toast.success(`Peer added to inventory as ${result.classification.replace(/_/g, " ")}`);
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to observe runtime peer");
    },
  });
}

export function usePromoteObservedRouterPeer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, observedPeerId, payload }: { id: string; observedPeerId: string; payload: { name: string; reason?: string } }) =>
      promoteObservedRouterPeer(id, observedPeerId, payload),
    onSuccess: async (result, variables) => {
      toast.success(`Observed peer promoted as ${result.name}`);
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to promote observed peer");
    },
  });
}

export function useDiscoverRouterDownstreamMikrotiks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: {
      id: string;
      payload?: {
        reason?: string;
        dryRun?: boolean;
        maxProbeTargets?: number;
        timeoutMs?: number;
        enableNeighborDiscovery?: boolean;
        enableRouteInspection?: boolean;
        enableSubnetProbe?: boolean;
        allowedSubnetCidrs?: string[];
        excludeCidrs?: string[];
      };
    }) => discoverRouterDownstreamMikrotiks(id, payload),
    onSuccess: async (result, variables) => {
      toast.success(result.dryRun ? "Dry-run discovery completed" : "Downstream MikroTik discovery completed");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to discover downstream MikroTik routers");
    },
  });
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

export function useSetRouterAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { managementHost?: string; hostname?: string; apiPort?: number; sshPort?: number; reason?: string } }) => setRouterAccess(id, payload),
    onSuccess: async (_, variables) => {
      toast.success("Router management endpoint updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update router management endpoint");
    },
  });
}

export function useSetRouterSafeMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { enabled: boolean; requireBreakGlass?: boolean; breakGlassCode?: string; note?: string; reason?: string } }) => setRouterSafeMode(id, payload),
    onSuccess: async (_, variables) => {
      toast.success("Router safe mode updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update router safe mode");
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

export function useMarkRouterBootstrapApplied() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: { note?: string; reason?: string } }) => markRouterBootstrapApplied(id, payload),
    onSuccess: async (_, variables) => {
      toast.success("Bootstrap package marked as applied");
      await queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.routers });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark bootstrap package as applied");
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
