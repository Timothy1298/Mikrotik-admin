import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";
import { getSettings } from "@/features/settings/api/getSettings";

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
