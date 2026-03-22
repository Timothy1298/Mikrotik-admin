import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";
import { queryKeys } from "@/config/queryKeys";
import { getSettings } from "@/features/settings/api/getSettings";
import {
  disableTwoFactor,
  enableTwoFactor,
  getAdminProfile,
  getPlatformConfig,
  startTwoFactorSetup,
  updateAdminProfile,
} from "@/features/settings/api/updateProfile";

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
      toast.success("Profile updated successfully");
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
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
