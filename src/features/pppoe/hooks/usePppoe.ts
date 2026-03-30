import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  createPppoeProfile,
  createPppoeSecret,
  deletePppoeProfile,
  deletePppoeSecret,
  disconnectPppoeSession,
  getPppoeProfileOptions,
  getPppoeProfiles,
  getPppoeSecrets,
  getPppoeSessions,
  updatePppoeProfile,
  updatePppoeSecret,
} from "@/features/pppoe/api/pppoe";
import type { PppoeProfilePayload, PppoeSecretFilters, PppoeSecretPayload } from "@/features/pppoe/types/pppoe.types";
import { ApiError } from "@/lib/api/errors";

function invalidatePppoe(queryClient: ReturnType<typeof useQueryClient>, routerId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["routers", routerId, "pppoe"] }),
    queryClient.invalidateQueries({ queryKey: queryKeys.pppoeSessions(routerId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.pppoeProfiles(routerId) }),
  ]);
}

export function usePppoeSecrets(routerId: string, filters: PppoeSecretFilters, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.pppoeSecrets(routerId, filters),
    queryFn: () => getPppoeSecrets(routerId, filters),
    enabled: Boolean(routerId) && (options.enabled ?? true),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function usePppoeSessions(routerId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.pppoeSessions(routerId),
    queryFn: () => getPppoeSessions(routerId),
    enabled: Boolean(routerId) && (options.enabled ?? true),
    staleTime: 0,
    refetchInterval: 10_000,
    refetchOnWindowFocus: false,
  });
}

export function usePppoeProfiles(routerId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.pppoeProfiles(routerId),
    queryFn: () => getPppoeProfiles(routerId),
    enabled: Boolean(routerId) && (options.enabled ?? true),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function usePppoeProfileOptions(routerId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.pppoeProfileOptions(routerId),
    queryFn: () => getPppoeProfileOptions(routerId),
    enabled: Boolean(routerId) && (options.enabled ?? true),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreatePppoeSecret(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PppoeSecretPayload) => createPppoeSecret(routerId, payload),
    onSuccess: async () => {
      toast.success("PPPoE subscriber created");
      await invalidatePppoe(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create PPPoE subscriber"),
  });
}

export function useUpdatePppoeSecret(routerId: string, secretId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PppoeSecretPayload) => updatePppoeSecret(routerId, secretId, payload),
    onSuccess: async () => {
      toast.success("PPPoE subscriber updated");
      await invalidatePppoe(queryClient, routerId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.pppoeSecret(routerId, secretId) });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update PPPoE subscriber"),
  });
}

export function useDeletePppoeSecret(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (secretId: string) => deletePppoeSecret(routerId, secretId),
    onSuccess: async () => {
      toast.success("PPPoE subscriber deleted");
      await invalidatePppoe(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete PPPoE subscriber"),
  });
}

export function useDisconnectPppoeSession(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => disconnectPppoeSession(routerId, sessionId),
    onSuccess: async () => {
      toast.success("PPPoE session disconnected");
      await invalidatePppoe(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to disconnect PPPoE session"),
  });
}

export function useCreatePppoeProfile(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PppoeProfilePayload) => createPppoeProfile(routerId, payload),
    onSuccess: async () => {
      toast.success("PPPoE profile created");
      await invalidatePppoe(queryClient, routerId);
    },
    onError: (error: Error) => {
      const message = error instanceof ApiError && error.status === 404
        ? "PPPoE profile creation endpoint is unavailable in the running backend. Restart the API server and try again."
        : (error.message || "Failed to create PPPoE profile");
      toast.error(message);
    },
  });
}

export function useUpdatePppoeProfile(routerId: string, profileId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PppoeProfilePayload) => updatePppoeProfile(routerId, profileId, payload),
    onSuccess: async () => {
      toast.success("PPPoE profile updated");
      await invalidatePppoe(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update PPPoE profile"),
  });
}

export function useDeletePppoeProfile(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => deletePppoeProfile(routerId, profileId),
    onSuccess: async () => {
      toast.success("PPPoE profile deleted");
      await invalidatePppoe(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete PPPoE profile"),
  });
}
