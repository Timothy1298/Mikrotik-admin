import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AdminAccount, CreateAdminPayload, UpdateAdminPayload } from "@/features/settings/types/admin-management.types";

export async function getAdminAccounts() {
  const { data } = await apiClient.get<{ success: boolean; items: AdminAccount[] }>(endpoints.admin.adminAccounts);
  return data.items;
}

export async function createAdminAccount(payload: CreateAdminPayload) {
  const { data } = await apiClient.post<{ success: boolean; admin: AdminAccount }>(endpoints.admin.adminAccounts, payload);
  return data.admin;
}

export async function updateAdminAccount(id: string, payload: UpdateAdminPayload) {
  const { data } = await apiClient.put<{ success: boolean; admin: AdminAccount }>(endpoints.admin.adminAccountDetail(id), payload);
  return data.admin;
}

export async function deactivateAdmin(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; admin: AdminAccount }>(endpoints.admin.deactivateAdminAccount(id), { reason });
  return data.admin;
}

export async function activateAdmin(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; admin: AdminAccount }>(endpoints.admin.activateAdminAccount(id), { reason });
  return data.admin;
}

export async function deleteAdmin(id: string, reason: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.admin.adminAccountDetail(id), { data: { reason } });
  return data;
}
