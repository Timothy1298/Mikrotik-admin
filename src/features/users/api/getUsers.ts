import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { UserDirectoryResponse, UserDirectoryStats, UserDetail, UsersQuery } from "@/features/users/types/user.types";

export async function getUsers(params: UsersQuery) {
  const { data } = await apiClient.get<{ success: boolean; items: UserDirectoryResponse["items"]; pagination: UserDirectoryResponse["pagination"] }>(endpoints.admin.users, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getUsersStats() {
  const { data } = await apiClient.get<{ success: boolean; stats: UserDirectoryStats }>(endpoints.admin.usersStats);
  return data.stats;
}

export async function getUserById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: UserDetail }>(endpoints.admin.userDetail(id));
  return data.data;
}

export async function suspendUser(id: string, reason: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.suspendUser(id), { reason });
  return data;
}

export async function reactivateUser(id: string, reason: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.reactivateUser(id), { reason });
  return data;
}

export async function verifyUser(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.verifyUser(id), { reason });
  return data;
}

export async function resendVerification(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.resendVerification(id), { reason });
  return data;
}

export async function sendPasswordReset(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.sendPasswordReset(id), { reason });
  return data;
}

export async function forceLogoutUser(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.forceLogoutUser(id), { reason });
  return data;
}

export async function extendUserTrial(id: string, days: number, reason: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; trialEndsAt: string }>(endpoints.admin.extendUserTrial(id), { days, reason });
  return data;
}

export async function addUserNote(id: string, payload: { body: string; category: string; pinned?: boolean }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.addUserNote(id), payload);
  return data;
}

export async function addUserFlag(id: string, payload: { flag: string; severity: string; description?: string; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.flagUser(id), payload);
  return data;
}

export async function removeUserFlag(id: string, flagId: string, reason?: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.admin.removeUserFlag(id, flagId), { data: { reason } });
  return data;
}
