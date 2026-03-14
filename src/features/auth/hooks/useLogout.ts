import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { appRoutes } from "@/config/routes";

export function useLogout() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);

  return () => {
    clearSession();
    navigate(appRoutes.login, { replace: true });
  };
}
