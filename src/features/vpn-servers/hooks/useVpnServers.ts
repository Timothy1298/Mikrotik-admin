import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  addServerFlag,
  addServerNote,
  addVpnServer,
  clearServerMaintenance,
  disableVpnServer,
  enableServerMaintenance,
  getVpnServerById,
  getVpnServerPeers,
  getVpnServerRouters,
  getVpnServers,
  getVpnServerStats,
  markVpnServerReviewed,
  migrateServerRouters,
  reactivateVpnServer,
  reconcileVpnServer,
  removeServerFlag,
  restartServerVpn,
} from "@/features/vpn-servers/api/getVpnServers";
import type { VpnServerQuery } from "@/features/vpn-servers/types/vpn-server.types";

export function useVpnServers(filters: VpnServerQuery) {
  return useQuery({
    queryKey: [...queryKeys.vpnServers, filters],
    queryFn: () => getVpnServers(filters),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useVpnServerStats() {
  return useQuery({
    queryKey: [...queryKeys.vpnServers, "stats"],
    queryFn: getVpnServerStats,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useVpnServer(id: string) {
  return useQuery({
    queryKey: queryKeys.vpnServerDetail(id),
    queryFn: () => getVpnServerById(id),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useVpnServerRouters(id: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.vpnServerDetail(id), "routers", params],
    queryFn: () => getVpnServerRouters(id, params),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useVpnServerPeers(id: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.vpnServerDetail(id), "peers", params],
    queryFn: () => getVpnServerPeers(id, params),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

function useVpnServerMutation<TArgs extends unknown[]>(mutationFn: (...args: TArgs) => Promise<{ message?: string }>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async (_, variables) => {
      const id = variables[0] ? String(variables[0]) : "";
      toast.success(successMessage);
      await queryClient.invalidateQueries({ queryKey: queryKeys.vpnServers });
      if (id) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.vpnServerDetail(id) });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "VPN server action failed");
    },
  });
}

export function useAddVpnServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof addVpnServer>[0]) => addVpnServer(payload),
    onSuccess: async () => {
      toast.success("VPN server added successfully");
      await queryClient.invalidateQueries({ queryKey: queryKeys.vpnServers });
    },
    onError: (error: Error) => {
      toast.error(error.message || "VPN server action failed");
    },
  });
}

export function useDisableVpnServer() {
  return useVpnServerMutation(disableVpnServer, "VPN server disabled successfully");
}

export function useReactivateVpnServer() {
  return useVpnServerMutation(reactivateVpnServer, "VPN server reactivated successfully");
}

export function useEnableServerMaintenance() {
  return useVpnServerMutation(enableServerMaintenance, "VPN server entered maintenance mode");
}

export function useClearServerMaintenance() {
  return useVpnServerMutation(clearServerMaintenance, "VPN server maintenance cleared");
}

export function useMigrateServerRouters() {
  return useVpnServerMutation(migrateServerRouters, "Router migration request processed");
}

export function useRestartServerVpn() {
  return useVpnServerMutation(restartServerVpn, "VPN restart triggered successfully");
}

export function useReconcileVpnServer() {
  return useVpnServerMutation(reconcileVpnServer, "VPN reconciliation completed");
}

export function useMarkVpnServerReviewed() {
  return useVpnServerMutation(markVpnServerReviewed, "VPN server marked as reviewed");
}

export function useAddServerNote() {
  return useVpnServerMutation(addServerNote, "VPN server note added");
}

export function useAddServerFlag() {
  return useVpnServerMutation(addServerFlag, "VPN server flag added successfully");
}

export function useRemoveServerFlag() {
  return useVpnServerMutation(removeServerFlag, "VPN server flag removed successfully");
}
