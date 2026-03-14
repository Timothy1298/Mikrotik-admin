import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { forgotPassword } from "@/features/auth/api/forgotPassword";

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => toast.success("If the account exists, a reset link has been sent."),
  });
}
