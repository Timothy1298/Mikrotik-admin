import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AdminNotification, AdminSearchResult } from "@/features/admin-shell/types/admin-shell.types";

export async function searchAdminWorkspace(q: string) {
  const { data } = await apiClient.get<{ success: boolean; items: AdminSearchResult[] }>(endpoints.admin.search, { params: { q } });
  return data.items || [];
}

export async function getAdminNotifications() {
  const { data } = await apiClient.get<{ success: boolean; items: AdminNotification[]; unreadCount: number }>(endpoints.admin.notifications);
  return data;
}

export async function markAdminNotificationRead(id: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.notificationRead(id));
  return data;
}

export async function markAllAdminNotificationsRead() {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.notificationsReadAll);
  return data;
}
