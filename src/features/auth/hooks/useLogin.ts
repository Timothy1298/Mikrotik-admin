import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";
import { appRoutes } from "@/config/routes";
import { login } from "@/features/auth/api/login";

export function useLogin() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session.token, session.user);
      toast.success("Signed in successfully");
      navigate(appRoutes.dashboard, { replace: true });
    },
  });
}
