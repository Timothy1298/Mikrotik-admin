import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  addUserFlag,
  addUserNote,
  createUser,
  deleteUser,
  editUserProfile,
  extendUserTrial,
  forceLogoutUser,
  getUserActivity,
  getUserBilling,
  getUserById,
  getUserRouters,
  getUserSecurity,
  getUserServices,
  getUserSupport,
  reactivateUser,
  removeUserFlag,
  resendVerification,
  sendPasswordReset,
  suspendUser,
  verifyUser,
} from "@/features/users/api/getUsers";

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.userDetail(id),
    queryFn: () => getUserById(id),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useUserServices(id: string) {
  return useQuery({
    queryKey: [...queryKeys.userDetail(id), "services"],
    queryFn: () => getUserServices(id),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useUserRouters(id: string) {
  return useQuery({
    queryKey: [...queryKeys.userDetail(id), "routers"],
    queryFn: () => getUserRouters(id),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useUserBilling(id: string) {
  return useQuery({
    queryKey: [...queryKeys.userDetail(id), "billing"],
    queryFn: () => getUserBilling(id),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useUserActivity(id: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.userDetail(id), "activity", params],
    queryFn: () => getUserActivity(id, params),
    enabled: Boolean(id),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useUserSecurity(id: string) {
  return useQuery({
    queryKey: [...queryKeys.userDetail(id), "security"],
    queryFn: () => getUserSecurity(id),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useUserSupport(id: string) {
  return useQuery({
    queryKey: [...queryKeys.userDetail(id), "support"],
    queryFn: () => getUserSupport(id),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

function useUserMutation<TArgs extends unknown[]>(mutationFn: (...args: TArgs) => Promise<{ message?: string }>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async (_, variables) => {
      const id = String(variables[0]);
      toast.success(successMessage);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
      await queryClient.invalidateQueries({ queryKey: queryKeys.userDetail(id) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Action failed');
    },
  });
}

export function useSuspendUser() {
  return useUserMutation(suspendUser, 'User suspended successfully');
}

export function useReactivateUser() {
  return useUserMutation(reactivateUser, 'User reactivated successfully');
}

export function useVerifyUser() {
  return useUserMutation(verifyUser, 'User verified successfully');
}

export function useResendVerification() {
  return useUserMutation(resendVerification, 'Verification email sent successfully');
}

export function useSendPasswordReset() {
  return useUserMutation(sendPasswordReset, 'Password reset email sent successfully');
}

export function useForceLogoutUser() {
  return useUserMutation(forceLogoutUser, 'User sessions revoked successfully');
}

export function useExtendUserTrial() {
  return useUserMutation(extendUserTrial, 'Trial extended successfully');
}

export function useAddUserNote() {
  return useUserMutation(addUserNote, 'Internal note added');
}

export function useAddUserFlag() {
  return useUserMutation(addUserFlag, 'Flag added successfully');
}

export function useRemoveUserFlag() {
  return useUserMutation(removeUserFlag, 'Flag removed successfully');
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      toast.success('Subscriber created successfully');
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Action failed');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: [string, string?]) => deleteUser(...variables),
    onSuccess: async () => {
      toast.success('Subscriber deleted');
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Action failed');
    },
  });
}

export function useEditUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: [string, Parameters<typeof editUserProfile>[1]]) => editUserProfile(...variables),
    onSuccess: async (_, variables) => {
      const id = String(variables[0]);
      toast.success('Profile updated successfully');
      await queryClient.invalidateQueries({ queryKey: queryKeys.userDetail(id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Action failed');
    },
  });
}
