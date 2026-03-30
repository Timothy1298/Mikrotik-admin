import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  CreateUserPayload,
  CreateUserResponse,
  EditUserProfilePayload,
  PaginationMeta,
  UserDirectoryResponse,
  UserDirectoryStats,
  UserDetail,
  UserSubResourceBilling,
  UsersQuery,
} from "@/features/users/types/user.types";

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

export async function createUser(payload: CreateUserPayload) {
  const { data } = await apiClient.post<{ success: boolean; message?: string; user: CreateUserResponse }>(endpoints.admin.createUser, payload);
  return data;
}

export async function editUserProfile(id: string, payload: EditUserProfilePayload) {
  const { data } = await apiClient.put<{ success: boolean; message: string; user: Partial<EditUserProfilePayload> }>(endpoints.admin.editUserProfile(id), payload);
  return data;
}

export async function deleteUser(id: string, reason?: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.admin.deleteUser(id), { data: { reason } });
  return data;
}

export async function getUserServices(id: string) {
  const { data } = await apiClient.get<{ success: boolean; services: UserDetail["services"] }>(endpoints.admin.userServices(id));
  return data.services;
}

export async function getUserRouters(id: string) {
  const { data } = await apiClient.get<{ success: boolean; items: UserDetail["routers"] }>(endpoints.admin.userRouters(id));
  return { items: data.items || [] };
}

export async function getUserBilling(id: string) {
  const { data } = await apiClient.get<{ success: boolean; billing: UserSubResourceBilling }>(endpoints.admin.userBilling(id));
  return data.billing;
}

export async function getUserActivity(id: string, params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<{ success: boolean; items: UserDetail["activity"]; pagination: PaginationMeta }>(endpoints.admin.userActivity(id), { params });
  return { items: data.items || [], pagination: data.pagination };
}

export async function getUserSecurity(id: string) {
  const { data } = await apiClient.get<{ success: boolean; security: UserDetail["security"] }>(endpoints.admin.userSecurity(id));
  return data.security;
}

export async function getUserSupport(id: string) {
  const { data } = await apiClient.get<{ success: boolean; summary: UserDetail["support"]["summary"]; items: UserDetail["support"]["tickets"]; pagination: PaginationMeta }>(endpoints.admin.userSupport(id));
  return { summary: data.summary, tickets: data.items || [], pagination: data.pagination };
}

export async function getUserNotes(id: string) {
  const { data } = await apiClient.get<{ success: boolean; items: UserDetail["notes"] }>(endpoints.admin.userNotes(id));
  return data.items || [];
}

export async function getUserFlags(id: string) {
  const { data } = await apiClient.get<{ success: boolean; riskStatus?: string; items: UserDetail["flags"] }>(endpoints.admin.userFlags(id));
  return { items: data.items || [], riskStatus: data.riskStatus || null };
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
