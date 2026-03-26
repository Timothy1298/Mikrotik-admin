import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  createRouterBackup,
  deleteRouterBackup,
  getRouterBackup,
  getRouterBackupContent,
  getRouterBackups,
} from "@/features/backups/api/backups";

export function useBackups(routerId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.routerBackups(routerId, page, limit),
    queryFn: () => getRouterBackups(routerId, page, limit),
    enabled: Boolean(routerId),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useBackupContent(routerId: string, backupId?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.routerBackupContent(routerId, backupId || ""),
    queryFn: () => getRouterBackupContent(routerId, backupId || ""),
    enabled: Boolean(routerId && backupId && enabled),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useBackupDetail(routerId: string, backupId?: string, enabled = true) {
  return useQuery({
    queryKey: ["routers", routerId, "backups", backupId || "detail"],
    queryFn: () => getRouterBackup(routerId, backupId || ""),
    enabled: Boolean(routerId && backupId && enabled),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateBackup(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note?: string) => createRouterBackup(routerId, note || ""),
    onSuccess: async () => {
      toast.success("Backup created");
      await queryClient.invalidateQueries({ queryKey: ["routers", routerId, "backups"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create backup"),
  });
}

export function useDeleteBackup(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (backupId: string) => deleteRouterBackup(routerId, backupId),
    onSuccess: async () => {
      toast.success("Backup deleted");
      await queryClient.invalidateQueries({ queryKey: ["routers", routerId, "backups"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete backup"),
  });
}
