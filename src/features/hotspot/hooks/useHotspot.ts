import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  createHotspotUser,
  deleteHotspotUser,
  disconnectSession,
  generateVouchers,
  getHotspotProfiles,
  getHotspotSessions,
  getHotspotUser,
  getHotspotUsers,
  updateHotspotUser,
} from "@/features/hotspot/api/hotspot";
import type { GenerateVouchersPayload, HotspotUserFilters, HotspotUserPayload } from "@/features/hotspot/types/hotspot.types";

export function useHotspotUsers(routerId: string, filters: HotspotUserFilters, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.hotspotUsers(routerId, filters),
    queryFn: () => getHotspotUsers(routerId, filters),
    enabled: Boolean(routerId) && (options.enabled ?? true),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useHotspotUser(routerId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.hotspotUser(routerId, userId),
    queryFn: () => getHotspotUser(routerId, userId),
    enabled: Boolean(routerId && userId),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useHotspotSessions(routerId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.hotspotSessions(routerId),
    queryFn: () => getHotspotSessions(routerId),
    enabled: Boolean(routerId) && (options.enabled ?? true),
    staleTime: 0,
    refetchInterval: 10_000,
    refetchOnWindowFocus: false,
  });
}

export function useHotspotProfiles(routerId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.hotspotProfiles(routerId),
    queryFn: () => getHotspotProfiles(routerId),
    enabled: Boolean(routerId) && (options.enabled ?? true),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

function invalidateHotspot(queryClient: ReturnType<typeof useQueryClient>, routerId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["routers", routerId, "hotspot"] }),
    queryClient.invalidateQueries({ queryKey: queryKeys.hotspotSessions(routerId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.hotspotProfiles(routerId) }),
  ]);
}

export function useCreateHotspotUser(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HotspotUserPayload) => createHotspotUser(routerId, payload),
    onSuccess: async () => {
      toast.success("Hotspot user created");
      await invalidateHotspot(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create hotspot user"),
  });
}

export function useUpdateHotspotUser(routerId: string, userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HotspotUserPayload) => updateHotspotUser(routerId, userId, payload),
    onSuccess: async () => {
      toast.success("Hotspot user updated");
      await invalidateHotspot(queryClient, routerId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.hotspotUser(routerId, userId) });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update hotspot user"),
  });
}

export function useDeleteHotspotUser(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteHotspotUser(routerId, userId),
    onSuccess: async () => {
      toast.success("Hotspot user deleted");
      await invalidateHotspot(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete hotspot user"),
  });
}

export function useGenerateVouchers(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateVouchersPayload) => generateVouchers(routerId, payload),
    onSuccess: async () => {
      toast.success("Vouchers generated");
      await invalidateHotspot(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to generate vouchers"),
  });
}

export function useDisconnectSession(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => disconnectSession(routerId, sessionId),
    onSuccess: async () => {
      toast.success("Session disconnected");
      await invalidateHotspot(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to disconnect session"),
  });
}
