import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  deleteLease,
  getDhcpLeases,
  getNetworkInterfaces,
  getWirelessClients,
  makeStaticLease,
  setInterfaceEnabled,
} from "@/features/network-config/api/networkConfig";

function invalidateNetwork(queryClient: ReturnType<typeof useQueryClient>, routerId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["routers", routerId, "network"] }),
    queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(routerId) }),
  ]);
}

export function useDhcpLeases(routerId: string) {
  return useQuery({
    queryKey: queryKeys.networkDhcpLeases(routerId),
    queryFn: () => getDhcpLeases(routerId),
    enabled: Boolean(routerId),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useWirelessClients(routerId: string) {
  return useQuery({
    queryKey: queryKeys.networkWirelessClients(routerId),
    queryFn: () => getWirelessClients(routerId),
    enabled: Boolean(routerId),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useNetworkInterfaces(routerId: string) {
  return useQuery({
    queryKey: queryKeys.networkInterfaces(routerId),
    queryFn: () => getNetworkInterfaces(routerId),
    enabled: Boolean(routerId),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useMakeStaticLease(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaseId: string) => makeStaticLease(routerId, leaseId),
    onSuccess: async () => {
      toast.success("Lease made static");
      await invalidateNetwork(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to make lease static"),
  });
}

export function useDeleteLease(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaseId: string) => deleteLease(routerId, leaseId),
    onSuccess: async () => {
      toast.success("Lease deleted");
      await invalidateNetwork(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete lease"),
  });
}

export function useSetInterfaceEnabled(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, enabled }: { name: string; enabled: boolean }) => setInterfaceEnabled(routerId, name, enabled),
    onSuccess: async (_, variables) => {
      toast.success(variables.enabled ? "Interface enabled" : "Interface disabled");
      await invalidateNetwork(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to change interface state"),
  });
}
