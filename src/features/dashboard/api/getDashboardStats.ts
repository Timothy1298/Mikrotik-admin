import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { DashboardStatsResponse } from "@/features/dashboard/types/dashboard.types";

export async function getDashboardStats() {
  const { data } = await apiClient.get<DashboardStatsResponse>(endpoints.admin.dashboard);
  return data.stats;
}
