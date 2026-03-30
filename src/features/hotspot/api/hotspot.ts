import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  GenerateVouchersPayload,
  HotspotPagination,
  HotspotProfile,
  HotspotProfilePayload,
  HotspotSession,
  HotspotUser,
  HotspotUserFilters,
  HotspotUserPayload,
  HotspotVoucher,
  HotspotVoucherFilters,
} from "@/features/hotspot/types/hotspot.types";

export async function getHotspotUsers(routerId: string, params: HotspotUserFilters = {}) {
  const { data } = await apiClient.get<{ success: boolean; data: HotspotUser[]; pagination: HotspotPagination }>(endpoints.admin.hotspotUsers(routerId), { params });
  return { items: data.data || [], pagination: data.pagination };
}

export async function getHotspotUser(routerId: string, userId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: HotspotUser & { recentSessions: HotspotSession[] } }>(endpoints.admin.hotspotUser(routerId, userId));
  return data.data;
}

export async function createHotspotUser(routerId: string, payload: HotspotUserPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: HotspotUser }>(endpoints.admin.hotspotUsers(routerId), payload);
  return data.data;
}

export async function updateHotspotUser(routerId: string, userId: string, payload: HotspotUserPayload) {
  const { data } = await apiClient.put<{ success: boolean; data: HotspotUser }>(endpoints.admin.hotspotUser(routerId, userId), payload);
  return data.data;
}

export async function deleteHotspotUser(routerId: string, userId: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(endpoints.admin.hotspotUser(routerId, userId));
  return data.data;
}

export async function getHotspotSessions(routerId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: HotspotSession[] }>(endpoints.admin.hotspotSessions(routerId));
  return data.data || [];
}

export async function disconnectSession(routerId: string, sessionId: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(endpoints.admin.hotspotSession(routerId, sessionId));
  return data.data;
}

export async function generateVouchers(routerId: string, payload: GenerateVouchersPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: Array<{ username: string; password: string }> }>(endpoints.admin.hotspotVouchers(routerId), payload);
  return data.data || [];
}

export async function getHotspotVouchers(routerId: string, params: HotspotVoucherFilters = {}) {
  const { data } = await apiClient.get<{ success: boolean; vouchers: HotspotVoucher[]; total: number; page: number; limit: number }>(endpoints.admin.hotspotVouchers(routerId), { params });
  return {
    items: data.vouchers || [],
    pagination: {
      page: data.page || 1,
      limit: data.limit || 50,
      total: data.total || 0,
      pages: Math.max(1, Math.ceil((data.total || 0) / Math.max(1, data.limit || 50))),
    } satisfies HotspotPagination,
  };
}

export async function revokeHotspotVoucher(routerId: string, voucherId: string) {
  const { data } = await apiClient.delete<{ success: boolean }>(`${endpoints.admin.hotspotVouchers(routerId)}/${voucherId}`);
  return data;
}

export async function getHotspotProfiles(routerId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: HotspotProfile[] }>(endpoints.admin.hotspotProfiles(routerId));
  return data.data || [];
}

export async function createHotspotProfile(routerId: string, payload: HotspotProfilePayload) {
  const { data } = await apiClient.post<{ success: boolean; data: HotspotProfile }>(endpoints.admin.hotspotProfiles(routerId), payload);
  return data.data;
}

export async function updateHotspotProfile(routerId: string, profileId: string, payload: HotspotProfilePayload) {
  const { data } = await apiClient.put<{ success: boolean; data: HotspotProfile }>(endpoints.admin.hotspotProfile(routerId, profileId), payload);
  return data.data;
}
