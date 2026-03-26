import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { appRoutes } from "@/config/routes";
import { forgotPassword } from "@/features/auth/api/forgotPassword";

export function useForgotPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success("If the account exists, a reset link has been sent.");
      navigate(appRoutes.login, { replace: true });
    },
  });
}
