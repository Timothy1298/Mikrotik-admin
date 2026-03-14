import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";
import { appRoutes } from "@/config/routes";
import { logout } from "@/features/auth/api/logout";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return async () => {
    try {
      await logout();
    } catch {
      // Local cleanup still wins if the session has already expired server-side.
    }

    await queryClient.cancelQueries();
    queryClient.clear();
    clearSession();
    toast.success("Signed out successfully");
    navigate(appRoutes.login, { replace: true });
  };
}
