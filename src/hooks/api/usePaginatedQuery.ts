import { useQuery } from "@tanstack/react-query";

export function usePaginatedQuery<T>(queryKey: readonly unknown[], queryFn: () => Promise<T>, enabled = true) {
  return useQuery({ queryKey, queryFn, enabled, placeholderData: (previousData) => previousData });
}
