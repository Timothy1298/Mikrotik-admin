import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";
import { getRouters, getRouterStats } from "@/features/routers/api/getRouters";
import type { RouterQuery } from "@/features/routers/types/router.types";

export function useRouters(filters: RouterQuery) {
  return useQuery({
    queryKey: [...queryKeys.routers, filters],
    queryFn: () => getRouters(filters),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useRouterStats() {
  return useQuery({
    queryKey: [...queryKeys.routers, "stats"],
    queryFn: getRouterStats,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
