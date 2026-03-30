import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export type AdminProfileResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  adminRole?: string | null;
  twoFactorEnabled?: boolean;
  twoFactorPendingSetup?: boolean;
  createdAt: string;
};

export type TwoFactorSetupResponse = {
  secret: string;
  otpauthUrl: string;
  manualEntryKey: string;
  issuer: string;
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

export async function startTwoFactorSetup(payload: { currentPassword: string }) {
  const { data } = await apiClient.post<{ success: boolean; setup: TwoFactorSetupResponse }>(endpoints.profile.twoFactorSetup, payload);
  return data.setup;
}

export async function enableTwoFactor(payload: { code: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string; user: AdminProfileResponse }>(endpoints.profile.twoFactorEnable, payload);
  return data;
}

export async function disableTwoFactor(payload: { currentPassword: string; code: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string; user: AdminProfileResponse }>(endpoints.profile.twoFactorDisable, payload);
  return data;
}

export async function getResellerStatus() {
  const { data } = await apiClient.get<{ success: boolean; items?: unknown[]; error?: string }>(endpoints.admin.resellers);
  return data;
}
