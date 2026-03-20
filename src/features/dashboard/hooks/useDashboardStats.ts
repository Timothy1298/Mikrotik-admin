import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";
import { getDashboardStats } from "@/features/dashboard/api/getDashboardStats";

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
