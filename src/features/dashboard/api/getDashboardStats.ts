import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { DashboardStatsResponse, ProxyStatusResponse } from "@/features/dashboard/types/dashboard.types";

export async function getDashboardStats() {
  const { data } = await apiClient.get<DashboardStatsResponse>(endpoints.admin.dashboard);
  return data.stats;
}

export async function getProxyStatus() {
  const { data } = await apiClient.get<ProxyStatusResponse>(endpoints.admin.proxyStatus);
  return data;
}
