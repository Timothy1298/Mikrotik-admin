import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAdminNotifications, markAdminNotificationRead, markAllAdminNotificationsRead, searchAdminWorkspace } from "@/features/admin-shell/api/adminShell";

const notificationsKey = ["admin-shell", "notifications"] as const;

export function useAdminSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ["admin-shell", "search", query],
    queryFn: () => searchAdminWorkspace(query),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useAdminNotifications(enabled = true) {
  return useQuery({
    queryKey: notificationsKey,
    queryFn: getAdminNotifications,
    enabled,
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useMarkAdminNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAdminNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsKey });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update notification");
    },
  });
}

export function useMarkAllAdminNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAdminNotificationsRead,
    onSuccess: async (result) => {
      toast.success(result.message || "Notifications updated");
      await queryClient.invalidateQueries({ queryKey: notificationsKey });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update notifications");
    },
  });
}
