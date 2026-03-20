import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export type AdminProfileResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  adminRole?: string | null;
  createdAt: string;
};

export async function getAdminProfile() {
  const { data } = await apiClient.get<{ success: boolean; user: AdminProfileResponse }>(endpoints.profile.get);
  return data.user;
}

export async function updateAdminProfile(payload: { name?: string; currentPassword?: string; newPassword?: string }) {
  const { data } = await apiClient.put<{ success: boolean; message: string; user: { id: string; name: string; email: string } }>(endpoints.profile.update, payload);
  return data;
}

export async function getPlatformConfig() {
  const { data } = await apiClient.get<{ success: boolean; config: { routerMonthlyPrice: number; trialDays: number; serverRegion: string; appVersion: string } }>(endpoints.admin.platformConfig);
  return data.config;
}
