import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";
import { getDashboardStats, getProxyStatus } from "@/features/dashboard/api/getDashboardStats";

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardStats,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}

export function useProxyStatus() {
  return useQuery({
    queryKey: queryKeys.proxyStatus,
    queryFn: getProxyStatus,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}
