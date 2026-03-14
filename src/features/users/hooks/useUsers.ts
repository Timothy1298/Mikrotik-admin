import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";
import { getUsers, getUsersStats } from "@/features/users/api/getUsers";
import type { UsersQuery } from "@/features/users/types/user.types";

export function useUsers(filters: UsersQuery) {
  return useQuery({
    queryKey: [...queryKeys.users, filters],
    queryFn: () => getUsers(filters),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useUsersStats() {
  return useQuery({
    queryKey: [...queryKeys.users, 'stats'],
    queryFn: getUsersStats,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
