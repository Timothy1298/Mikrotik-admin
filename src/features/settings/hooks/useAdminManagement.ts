import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  activateAdmin,
  createAdminAccount,
  deactivateAdmin,
  deleteAdmin,
  getAdminAccounts,
  updateAdminAccount,
} from "@/features/settings/api/adminManagement";

const adminMgmtBase = [...queryKeys.settings, "admins"] as const;

export function useAdminAccounts() {
  return useQuery({
    queryKey: adminMgmtBase,
    queryFn: getAdminAccounts,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

function useAdminMutation<TArgs extends unknown[], TResult>(mutationFn: (...args: TArgs) => Promise<TResult>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async () => {
      toast.success(successMessage);
      await queryClient.invalidateQueries({ queryKey: adminMgmtBase });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Admin management action failed");
    },
  });
}

export function useCreateAdminAccount() {
  return useAdminMutation((payload: Parameters<typeof createAdminAccount>[0]) => createAdminAccount(payload), "Admin account created");
}

export function useUpdateAdminAccount() {
  return useAdminMutation((id: string, payload: Parameters<typeof updateAdminAccount>[1]) => updateAdminAccount(id, payload), "Admin account updated");
}

export function useDeactivateAdmin() {
  return useAdminMutation((id: string, reason?: string) => deactivateAdmin(id, reason), "Admin account deactivated");
}

export function useActivateAdmin() {
  return useAdminMutation((id: string, reason?: string) => activateAdmin(id, reason), "Admin account activated");
}

export function useDeleteAdmin() {
  return useAdminMutation((id: string, reason: string) => deleteAdmin(id, reason), "Admin account deleted");
}
