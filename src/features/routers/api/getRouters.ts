import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { RouterDetail, RouterDirectoryResponse, RouterDirectoryStats, RouterQuery } from "@/features/routers/types/router.types";

export async function getRouters(params: RouterQuery) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterDirectoryResponse["items"]; pagination: RouterDirectoryResponse["pagination"] }>(endpoints.admin.routers, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getRouterStats() {
  const { data } = await apiClient.get<{ success: boolean; stats: RouterDirectoryStats }>(endpoints.admin.routerStats);
  return data.stats;
}

export async function getRouterById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: RouterDetail }>(endpoints.admin.routerDetail(id));
  return data.data;
}

export async function getRouterActivity(id: string, params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterDetail["recentActivity"]; pagination: RouterDirectoryResponse["pagination"] }>(endpoints.admin.routerActivity(id), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function disableRouter(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.disableRouter(id), { reason });
  return data;
}

export async function reactivateRouter(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.reactivateRouter(id), { reason });
  return data;
}

export async function reprovisionRouter(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.reprovisionRouter(id), { reason });
  return data;
}

export async function regenerateRouterSetup(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; artifacts?: Record<string, unknown> }>(endpoints.admin.regenerateRouterSetup(id), { reason });
  return data;
}

export async function resetRouterPeer(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; artifacts?: Record<string, unknown> }>(endpoints.admin.resetRouterPeer(id), { reason });
  return data;
}

export async function reassignRouterPorts(id: string, payload: { ports?: { winbox: number; ssh: number; api: number } | null; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.reassignRouterPorts(id), payload);
  return data;
}

export async function moveRouterServer(id: string, payload: { targetServerNode: string; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message?: string }>(endpoints.admin.moveRouterServer(id), payload);
  return data;
}

export async function markRouterReviewed(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.markRouterReviewed(id), { reason });
  return data;
}

export async function addRouterNote(id: string, payload: { body: string; category: string; pinned?: boolean; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.routerNotes(id), payload);
  return data;
}

export async function addRouterFlag(id: string, payload: { flag: string; severity: string; description?: string; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.routerFlags(id), payload);
  return data;
}

export async function removeRouterFlag(id: string, flagId: string, reason?: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.admin.removeRouterFlag(id, flagId), { data: { reason } });
  return data;
}

export async function deleteRouter(id: string, reason?: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.admin.deleteRouter(id), { data: { reason } });
  return data;
}
