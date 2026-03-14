import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";
import { queryKeys } from "@/config/queryKeys";
import { appRoutes } from "@/config/routes";
import { login } from "@/features/auth/api/login";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);
  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? appRoutes.dashboard;

  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session.token, session.user);
      queryClient.setQueryData(queryKeys.me, session.user);
      toast.success("Signed in successfully");
      navigate(redirectTo, { replace: true });
    },
  });
}
