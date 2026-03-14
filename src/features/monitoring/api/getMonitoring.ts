import type { RouterDirectoryResponse, RouterRow } from "@/features/routers/types/router.types";
import type { VpnServerDirectoryResponse, VpnServerRow } from "@/features/vpn-servers/types/vpn-server.types";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  AffectedCustomerRow,
  CustomerImpactSummary,
  MonitoringActivityItem,
  MonitoringDiagnostics,
  MonitoringFilterState,
  MonitoringIncident,
  MonitoringIncidentNote,
  MonitoringListResponse,
  MonitoringOverview,
  MonitoringPeerRow,
  MonitoringTrends,
  PeerHealthSummary,
  ProvisioningSummary,
  RouterHealthSummary,
  TrafficRouterRow,
  TrafficServerRow,
  TrafficSummary,
  VpnServerHealthSummary,
} from "@/features/monitoring/types/monitoring.types";

export async function getMonitoringOverview() {
  const { data } = await apiClient.get<{ success: boolean; overview: MonitoringOverview }>(endpoints.admin.monitoringOverview);
  return data.overview;
}

export async function getMonitoringTrends(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; trends: MonitoringTrends }>(endpoints.admin.monitoringTrends, { params });
  return data.trends;
}

export async function getMonitoringActivity(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: MonitoringActivityItem[]; pagination: MonitoringListResponse<MonitoringActivityItem>["pagination"] }>(endpoints.admin.monitoringActivity, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getMonitoringDiagnostics() {
  const { data } = await apiClient.get<{ success: boolean; diagnostics: MonitoringDiagnostics }>(endpoints.admin.monitoringDiagnostics);
  return data.diagnostics;
}

export async function getRouterHealthSummary() {
  const { data } = await apiClient.get<{ success: boolean; summary: RouterHealthSummary }>(endpoints.admin.monitoringRouterSummary);
  return data.summary;
}

export async function getUnhealthyRouters(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterDirectoryResponse["items"]; pagination: RouterDirectoryResponse["pagination"] }>(endpoints.admin.monitoringRoutersUnhealthy, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getOfflineRouters(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterDirectoryResponse["items"]; pagination: RouterDirectoryResponse["pagination"] }>(endpoints.admin.monitoringRoutersOffline, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getProvisioningIssueRouters(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterDirectoryResponse["items"]; pagination: RouterDirectoryResponse["pagination"] }>(endpoints.admin.monitoringRoutersProvisioningIssues, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getStaleRouters(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterDirectoryResponse["items"]; pagination: RouterDirectoryResponse["pagination"] }>(endpoints.admin.monitoringRoutersStale, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getVpnServerHealthSummary() {
  const { data } = await apiClient.get<{ success: boolean; summary: VpnServerHealthSummary }>(endpoints.admin.monitoringVpnServerSummary);
  return data.summary;
}

export async function getUnhealthyVpnServers(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: VpnServerDirectoryResponse["items"]; pagination: VpnServerDirectoryResponse["pagination"] }>(endpoints.admin.monitoringVpnServersUnhealthy, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getOverloadedVpnServers(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: VpnServerDirectoryResponse["items"]; pagination: VpnServerDirectoryResponse["pagination"] }>(endpoints.admin.monitoringVpnServersOverloaded, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getStaleVpnServers(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: VpnServerDirectoryResponse["items"]; pagination: VpnServerDirectoryResponse["pagination"] }>(endpoints.admin.monitoringVpnServersStale, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getPeerHealthSummary() {
  const { data } = await apiClient.get<{ success: boolean; summary: PeerHealthSummary }>(endpoints.admin.monitoringPeerSummary);
  return data.summary;
}

export async function getStalePeers(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: MonitoringPeerRow[]; pagination: MonitoringListResponse<MonitoringPeerRow>["pagination"] }>(endpoints.admin.monitoringPeersStale, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getUnhealthyPeers(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: MonitoringPeerRow[]; pagination: MonitoringListResponse<MonitoringPeerRow>["pagination"] }>(endpoints.admin.monitoringPeersUnhealthy, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getTrafficSummary() {
  const { data } = await apiClient.get<{ success: boolean; summary: TrafficSummary }>(endpoints.admin.monitoringTrafficSummary);
  return data.summary;
}

export async function getTrafficTrends(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; trends: MonitoringTrends }>(endpoints.admin.monitoringTrafficTrends, { params });
  return data.trends;
}

export async function getTopTrafficRouters(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: TrafficRouterRow[]; pagination: MonitoringListResponse<TrafficRouterRow>["pagination"] }>(endpoints.admin.monitoringTrafficTopRouters, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getTopTrafficServers(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: TrafficServerRow[]; pagination: MonitoringListResponse<TrafficServerRow>["pagination"] }>(endpoints.admin.monitoringTrafficTopServers, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getCustomerImpactSummary() {
  const { data } = await apiClient.get<{ success: boolean; impact: CustomerImpactSummary }>(endpoints.admin.monitoringCustomerImpact);
  return data.impact;
}

export async function getAffectedCustomers(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: AffectedCustomerRow[]; pagination: MonitoringListResponse<AffectedCustomerRow>["pagination"] }>(endpoints.admin.monitoringAffectedCustomers, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getProvisioningSummary() {
  const { data } = await apiClient.get<{ success: boolean; summary: ProvisioningSummary }>(endpoints.admin.monitoringProvisioningSummary);
  return data.summary;
}

export async function getProvisioningTrends(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; trends: MonitoringTrends }>(endpoints.admin.monitoringProvisioningTrends, { params });
  return data.trends;
}

export async function getProvisioningFailures(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterRow[]; pagination: RouterDirectoryResponse["pagination"] }>(endpoints.admin.monitoringProvisioningFailures, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getIncidents(params?: MonitoringFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: MonitoringIncident[]; pagination: MonitoringListResponse<MonitoringIncident>["pagination"] }>(endpoints.admin.monitoringIncidents, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getIncidentById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; incident: MonitoringIncident }>(endpoints.admin.monitoringIncidentDetail(id));
  return data.incident;
}

export async function getIncidentNotes(id: string) {
  const { data } = await apiClient.get<{ success: boolean; items: MonitoringIncidentNote[] }>(endpoints.admin.monitoringIncidentNotes(id));
  return data.items;
}

export async function acknowledgeIncident(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.acknowledgeMonitoringIncident(id), { reason });
  return data;
}

export async function resolveIncident(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.resolveMonitoringIncident(id), { reason });
  return data;
}

export async function markIncidentReviewed(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.markMonitoringIncidentReviewed(id), { reason });
  return data;
}

export async function addIncidentNote(id: string, payload: { body: string; category: string; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.monitoringIncidentNotes(id), payload);
  return data;
}
