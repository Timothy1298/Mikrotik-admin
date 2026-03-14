import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { appRoutes } from "@/config/routes";
import { resetPassword } from "@/features/auth/api/resetPassword";

export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
      navigate(appRoutes.login, { replace: true });
    },
  });
}
