import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  bulkDeleteVpnClients,
  createVpnClient,
  deleteVpnClient,
  disableVpnClient,
  downloadVpnClientAutoconfig,
  downloadVpnClientConfig,
  downloadVpnClientMikrotik,
  enableVpnClient,
  getVpnClientByName,
  getVpnClients,
  pingVpnClient,
  regenerateVpnClientKeys,
  updateVpnClient,
} from "@/features/vpn-clients/api/vpnClients";
import type { CreateVpnClientPayload, DownloadMikrotikScriptPayload, UpdateVpnClientPayload, VpnClientDetail, VpnClientQuery } from "@/features/vpn-clients/types/vpn-client.types";

const vpnClientsBase = [...queryKeys.vpnClients] as const;

export function useVpnClients(filters: VpnClientQuery = {}) {
  return useQuery({
    queryKey: [...vpnClientsBase, "list", filters],
    queryFn: () => getVpnClients(filters),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useVpnClient(name: string) {
  return useQuery({
    queryKey: [...vpnClientsBase, "detail", name],
    queryFn: () => getVpnClientByName(name),
    enabled: Boolean(name),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

function useVpnClientMutation<TArgs extends unknown[]>(mutationFn: (...args: TArgs) => Promise<{ message?: string }>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async (data) => {
      toast.success(data.message || successMessage);
      await queryClient.invalidateQueries({ queryKey: vpnClientsBase });
    },
    onError: (error: Error) => {
      toast.error(error.message || "VPN client action failed");
    },
  });
}

export function useCreateVpnClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVpnClientPayload) => createVpnClient(payload),
    onSuccess: async (data) => {
      toast.success(data.message || "VPN client created");
      await queryClient.invalidateQueries({ queryKey: vpnClientsBase });
    },
    onError: (error: Error) => toast.error(error.message || "VPN client action failed"),
  });
}

export function useUpdateVpnClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, payload }: { name: string; payload: UpdateVpnClientPayload }) => updateVpnClient(name, payload),
    onSuccess: async (data, variables) => {
      toast.success(data.message || "VPN client updated");
      await queryClient.invalidateQueries({ queryKey: vpnClientsBase });
      const updated = data.data as VpnClientDetail | undefined;
      if (updated?.name) {
        queryClient.setQueryData([...vpnClientsBase, "detail", updated.name], updated);
      }
      await queryClient.invalidateQueries({ queryKey: [...vpnClientsBase, "detail", variables.name] });
    },
    onError: (error: Error) => toast.error(error.message || "VPN client action failed"),
  });
}

export function useRegenerateVpnClientKeys() {
  return useVpnClientMutation(regenerateVpnClientKeys, "VPN client keys regenerated");
}

export function useEnableVpnClient() {
  return useVpnClientMutation(enableVpnClient, "VPN client enabled");
}

export function useDisableVpnClient() {
  return useVpnClientMutation(disableVpnClient, "VPN client disabled");
}

export function useDeleteVpnClient() {
  return useVpnClientMutation(deleteVpnClient, "VPN client deleted");
}

export function useBulkDeleteVpnClients() {
  return useVpnClientMutation(bulkDeleteVpnClients, "VPN clients deleted");
}

export function usePingVpnClient() {
  return useMutation({
    mutationFn: ({ name, target, count }: { name: string; target?: string; count?: number }) => pingVpnClient(name, target, count),
    onSuccess: (data) => {
      toast.success(data.message || "Ping completed");
    },
    onError: (error: Error) => toast.error(error.message || "VPN client action failed"),
  });
}

export function useDownloadVpnClientConfig() {
  return useMutation({
    mutationFn: (name: string) => downloadVpnClientConfig(name),
    onError: (error: Error) => toast.error(error.message || "Download failed"),
  });
}

export function useDownloadVpnClientAutoconfig() {
  return useMutation({
    mutationFn: (name: string) => downloadVpnClientAutoconfig(name),
    onError: (error: Error) => toast.error(error.message || "Download failed"),
  });
}

export function useDownloadVpnClientMikrotik() {
  return useMutation({
    mutationFn: (payload: DownloadMikrotikScriptPayload) => downloadVpnClientMikrotik(payload),
    onError: (error: Error) => toast.error(error.message || "Download failed"),
  });
}
