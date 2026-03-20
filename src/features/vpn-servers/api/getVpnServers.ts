import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  VpnServerActivityItem,
  VpnServerDetail,
  VpnServerDiagnosticsResult,
  VpnServerDirectoryResponse,
  VpnServerPeerItem,
  VpnServerPaginationMeta,
  VpnServerQuery,
  VpnServerRouterItem,
  VpnServerStats,
  VpnServerTrafficDetail,
} from "@/features/vpn-servers/types/vpn-server.types";

export async function getVpnServers(params: VpnServerQuery) {
  const { data } = await apiClient.get<{ success: boolean; items: VpnServerDirectoryResponse["items"]; pagination: VpnServerDirectoryResponse["pagination"] }>(endpoints.admin.vpnServers, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getVpnServerStats() {
  const { data } = await apiClient.get<{ success: boolean; stats: VpnServerStats }>(endpoints.admin.vpnServersStats);
  return data.stats;
}

export async function getVpnServerById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: VpnServerDetail }>(endpoints.admin.vpnServerDetail(id));
  return data.data;
}

export async function getVpnServerRouters(id: string, params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<{ success: boolean; items: VpnServerRouterItem[]; pagination: VpnServerDirectoryResponse["pagination"] }>(endpoints.admin.vpnServerRouters(id), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getVpnServerPeers(id: string, params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<{ success: boolean; items: VpnServerPeerItem[]; pagination: VpnServerDirectoryResponse["pagination"] }>(endpoints.admin.vpnServerPeers(id), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getVpnServerActivity(id: string, params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<{ success: boolean; items: VpnServerActivityItem[]; pagination: VpnServerPaginationMeta }>(endpoints.admin.vpnServerActivity(id), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getVpnServerTrafficDetail(id: string) {
  const { data } = await apiClient.get<{ success: boolean; traffic: VpnServerTrafficDetail }>(endpoints.admin.vpnServerTraffic(id));
  return data.traffic;
}

export async function getVpnServerDiagnostics(id: string) {
  const { data } = await apiClient.get<{ success: boolean; diagnostics: VpnServerDiagnosticsResult }>(endpoints.admin.vpnServerDiagnostics(id));
  return data.diagnostics;
}

export async function addVpnServer(payload: { nodeId: string; name: string; region?: string; hostname?: string; endpoint?: string; maxPeers?: number; maxRouters?: number; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.addVpnServer, payload);
  return data;
}

export async function disableVpnServer(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.disableVpnServer(id), { reason });
  return data;
}

export async function reactivateVpnServer(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.reactivateVpnServer(id), { reason });
  return data;
}

export async function enableServerMaintenance(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.enableServerMaintenance(id), { reason });
  return data;
}

export async function clearServerMaintenance(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.clearServerMaintenance(id), { reason });
  return data;
}

export async function migrateServerRouters(id: string, payload: { targetServerId: string; routerIds?: string[]; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message?: string }>(endpoints.admin.migrateServerRouters(id), payload);
  return data;
}

export async function restartServerVpn(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.restartServerVpn(id), { reason });
  return data;
}

export async function reconcileVpnServer(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.reconcileVpnServer(id), { reason });
  return data;
}

export async function markVpnServerReviewed(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.markVpnServerReviewed(id), { reason });
  return data;
}

export async function addServerNote(id: string, payload: { body: string; category: string; pinned?: boolean; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.vpnServerNotes(id), payload);
  return data;
}

export async function addServerFlag(id: string, payload: { flag: string; severity: string; description?: string; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.vpnServerFlags(id), payload);
  return data;
}

export async function removeServerFlag(id: string, flagId: string, reason?: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.admin.removeVpnServerFlag(id, flagId), { data: { reason } });
  return data;
}
