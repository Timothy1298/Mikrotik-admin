import { useMemo } from "react";

export function useApiStatus(isLoading: boolean, isError: boolean) {
  return useMemo(() => {
    if (isLoading) return "loading" as const;
    if (isError) return "error" as const;
    return "ready" as const;
  }, [isLoading, isError]);
}
