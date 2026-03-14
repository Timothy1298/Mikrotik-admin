import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";
import { getLogs } from "@/features/logs/api/getLogs";

export function useLogs() {
  return useQuery({
    queryKey: [...queryKeys.logs, "activity"],
    queryFn: getLogs,
  });
}
