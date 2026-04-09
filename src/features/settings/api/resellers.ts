import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ResellerPayload, ResellerRecord } from "@/features/settings/types";

export async function getResellers(params?: { q?: string; status?: string }) {
  const { data } = await apiClient.get<{ success: boolean; items: ResellerRecord[] }>(endpoints.admin.resellers, { params });
  return data.items || [];
}

export async function createReseller(payload: ResellerPayload) {
  const { data } = await apiClient.post<{ success: boolean; message: string; reseller: ResellerRecord }>(endpoints.admin.resellers, payload);
  return data;
}

export async function updateReseller(id: string, payload: ResellerPayload) {
  const { data } = await apiClient.put<{ success: boolean; message: string; reseller: ResellerRecord }>(endpoints.admin.resellerDetail(id), payload);
  return data;
}

export async function activateReseller(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; reseller: ResellerRecord }>(endpoints.admin.activateReseller(id), { reason });
  return data;
}

export async function deactivateReseller(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; reseller: ResellerRecord }>(endpoints.admin.deactivateReseller(id), { reason });
  return data;
}

export async function deleteReseller(id: string, reason?: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.admin.resellerDetail(id), { data: { reason } });
  return data;
}
