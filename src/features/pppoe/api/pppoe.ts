import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  PppoePagination,
  PppoeProfile,
  PppoeProfilePayload,
  PppoeSecret,
  PppoeSecretFilters,
  PppoeSecretPayload,
  PppoeSession,
} from "@/features/pppoe/types/pppoe.types";

export async function getPppoeSecrets(routerId: string, params: PppoeSecretFilters = {}) {
  const { data } = await apiClient.get<{ success: boolean; data: PppoeSecret[]; pagination: PppoePagination }>(endpoints.admin.pppoeSecrets(routerId), { params });
  return { items: data.data || [], pagination: data.pagination };
}

export async function createPppoeSecret(routerId: string, payload: PppoeSecretPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: PppoeSecret }>(endpoints.admin.pppoeSecrets(routerId), payload);
  return data.data;
}

export async function updatePppoeSecret(routerId: string, secretId: string, payload: PppoeSecretPayload) {
  const { data } = await apiClient.put<{ success: boolean; data: PppoeSecret }>(endpoints.admin.pppoeSecret(routerId, secretId), payload);
  return data.data;
}

export async function deletePppoeSecret(routerId: string, secretId: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(endpoints.admin.pppoeSecret(routerId, secretId));
  return data.data;
}

export async function getPppoeSessions(routerId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: PppoeSession[] }>(endpoints.admin.pppoeSessions(routerId));
  return data.data || [];
}

export async function disconnectPppoeSession(routerId: string, sessionId: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(endpoints.admin.pppoeSession(routerId, sessionId));
  return data.data;
}

export async function getPppoeProfiles(routerId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: PppoeProfile[] }>(endpoints.admin.pppoeProfiles(routerId));
  return data.data || [];
}

export async function createPppoeProfile(routerId: string, payload: PppoeProfilePayload) {
  const { data } = await apiClient.post<{ success: boolean; data: PppoeProfile }>(endpoints.admin.pppoeProfiles(routerId), payload);
  return data.data;
}

export async function updatePppoeProfile(routerId: string, profileId: string, payload: PppoeProfilePayload) {
  const { data } = await apiClient.put<{ success: boolean; data: PppoeProfile }>(`${endpoints.admin.pppoeProfiles(routerId)}/${profileId}`, payload);
  return data.data;
}

export async function deletePppoeProfile(routerId: string, profileId: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(`${endpoints.admin.pppoeProfiles(routerId)}/${profileId}`);
  return data.data;
}
