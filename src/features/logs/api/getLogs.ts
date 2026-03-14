import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ActivityLogItem } from "@/features/logs-security/types/logs-security.types";
import type { LogEntry } from "@/features/logs/types/logs.types";

export async function getLogs() {
  const { data } = await apiClient.get<{ items?: ActivityLogItem[] }>(endpoints.admin.logsActivity);
  return (data.items || []).map(
    (item) =>
      ({
        id: item.id,
        level: item.severity || item.category || "info",
        message: item.summary,
      }) satisfies LogEntry,
  );
}
