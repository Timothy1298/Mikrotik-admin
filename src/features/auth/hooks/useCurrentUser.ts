import { useQuery } from "@tanstack/react-query";
import { me } from "@/features/auth/api/me";
import { queryKeys } from "@/config/queryKeys";

export function useCurrentUser(enabled = false) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const session = await me();
      return session.user;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
