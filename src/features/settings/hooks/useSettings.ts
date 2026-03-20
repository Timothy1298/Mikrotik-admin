import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";
import { queryKeys } from "@/config/queryKeys";
import { getSettings } from "@/features/settings/api/getSettings";
import { getAdminProfile, getPlatformConfig, updateAdminProfile } from "@/features/settings/api/updateProfile";

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
      if (auth.token && auth.user) {
        auth.setSession(auth.token, {
          ...auth.user,
          name: data.user.name || variables.name || auth.user.name,
        });
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
