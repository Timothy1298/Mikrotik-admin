import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  return (queryKey: readonly unknown[]) => queryClient.invalidateQueries({ queryKey });
}
