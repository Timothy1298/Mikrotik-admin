import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import { addUserFlag, addUserNote, extendUserTrial, forceLogoutUser, getUserById, reactivateUser, removeUserFlag, resendVerification, sendPasswordReset, suspendUser, verifyUser } from "@/features/users/api/getUsers";

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.userDetail(id),
    queryFn: () => getUserById(id),
    enabled: Boolean(id),
    staleTime: 20_000,
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
