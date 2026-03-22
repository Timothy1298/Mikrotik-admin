import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { RouterBackup, RouterBackupsResponse } from "@/features/backups/types/backup.types";

type BackupRecord = {
  _id?: string;
  id?: string;
  routerId: string;
  filename: string;
  exportText?: string;
  sizeBytes?: number;
  triggeredBy?: "manual" | "auto" | "pre-change";
  createdBy?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

function mapBackup(item: BackupRecord): RouterBackup {
  return {
    id: item.id || item._id || "",
    routerId: item.routerId,
    filename: item.filename,
    exportText: item.exportText,
    sizeBytes: Number(item.sizeBytes || 0),
    triggeredBy: item.triggeredBy || "manual",
    createdBy: item.createdBy || "system",
    note: item.note || "",
    createdAt: item.createdAt || new Date(0).toISOString(),
    updatedAt: item.updatedAt || item.createdAt || new Date(0).toISOString(),
  };
}

export async function getRouterBackups(routerId: string, page = 1, limit = 20): Promise<RouterBackupsResponse> {
  const { data } = await apiClient.get<{
    success: boolean;
    items: BackupRecord[];
    pagination: RouterBackupsResponse["pagination"];
  }>(endpoints.admin.routerBackups(routerId), { params: { page, limit } });

  return {
    items: (data.items || []).map(mapBackup),
    pagination: data.pagination || { page: 1, limit: 20, total: 0, pages: 1 },
  };
}

export async function createRouterBackup(routerId: string, note = "") {
  const { data } = await apiClient.post<{ success: boolean; data: BackupRecord }>(endpoints.admin.routerBackups(routerId), { note });
  return mapBackup(data.data);
}

export async function getRouterBackupContent(routerId: string, backupId: string) {
  const { data } = await apiClient.get<string>(endpoints.admin.routerBackupContent(routerId, backupId), {
    responseType: "text" as const,
  });
  return data;
}

export async function deleteRouterBackup(routerId: string, backupId: string) {
  const { data } = await apiClient.delete<{ success: boolean; message?: string }>(endpoints.admin.routerBackup(routerId, backupId));
  return data;
}
