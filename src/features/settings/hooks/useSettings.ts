import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";
import { queryKeys } from "@/config/queryKeys";
import { getSettings } from "@/features/settings/api/getSettings";
import {
  updatePlatformConfig,
  disableTwoFactor,
  enableTwoFactor,
  getAdminProfile,
  getPlatformConfig,
  getResellerStatus,
  startTwoFactorSetup,
  updateAdminProfile,
} from "@/features/settings/api/updateProfile";
import {
  activateReseller,
  createReseller,
  deactivateReseller,
  deleteReseller,
  getResellers,
  updateReseller,
} from "@/features/settings/api/resellers";

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useAdminProfile() {
  return useQuery({
    queryKey: [...queryKeys.settings, "profile"],
    queryFn: getAdminProfile,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: async (data, variables) => {
      const auth = useAuthStore.getState();
      if (auth.user) {
        auth.setSession({
          ...auth.user,
          name: data.user.name || variables.name || auth.user.name,
        }, auth.sessionExpiresAt);
      }
      toast.success(data.message || "Profile updated successfully");
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

export function useResellerStatus() {
  return useQuery({
    queryKey: queryKeys.resellerStatus,
    queryFn: getResellerStatus,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function usePlatformConfig() {
  return useQuery({
    queryKey: [...queryKeys.settings, "platform-config"],
    queryFn: getPlatformConfig,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
  });
}

export function useUpdatePlatformConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePlatformConfig,
    onSuccess: async (data) => {
      toast.success(data.message || "Platform configuration updated");
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.settings, "platform-config"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update platform configuration");
    },
  });
}

export function useResellers(params?: { q?: string; status?: string }) {
  return useQuery({
    queryKey: [...queryKeys.resellerStatus, params],
    queryFn: () => getResellers(params),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

function useResellerMutation<TArgs extends unknown[], TResult extends { message?: string }>(mutationFn: (...args: TArgs) => Promise<TResult>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async (result) => {
      toast.success(result.message || successMessage);
      await queryClient.invalidateQueries({ queryKey: queryKeys.resellerStatus });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Reseller action failed");
    },
  });
}

export function useCreateReseller() {
  return useResellerMutation((payload: Parameters<typeof createReseller>[0]) => createReseller(payload), "Reseller created");
}

export function useUpdateReseller() {
  return useResellerMutation((id: string, payload: Parameters<typeof updateReseller>[1]) => updateReseller(id, payload), "Reseller updated");
}

export function useActivateReseller() {
  return useResellerMutation((id: string, reason?: string) => activateReseller(id, reason), "Reseller activated");
}

export function useDeactivateReseller() {
  return useResellerMutation((id: string, reason?: string) => deactivateReseller(id, reason), "Reseller deactivated");
}

export function useDeleteReseller() {
  return useResellerMutation((id: string, reason?: string) => deleteReseller(id, reason), "Reseller deleted");
}

export function useStartTwoFactorSetup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startTwoFactorSetup,
    onSuccess: async () => {
      toast.success("Authenticator setup secret generated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start 2FA setup");
    },
  });
}

export function useEnableTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enableTwoFactor,
    onSuccess: async (data) => {
      const auth = useAuthStore.getState();
      if (auth.user) {
        auth.setSession({
          ...auth.user,
          twoFactorEnabled: true,
        }, auth.sessionExpiresAt);
      }
      toast.success(data.message || "Two-factor authentication enabled");
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enable 2FA");
    },
  });
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: async (data) => {
      const auth = useAuthStore.getState();
      if (auth.user) {
        auth.setSession({
          ...auth.user,
          twoFactorEnabled: false,
        }, auth.sessionExpiresAt);
      }
      toast.success(data.message || "Two-factor authentication disabled");
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to disable 2FA");
    },
  });
}
