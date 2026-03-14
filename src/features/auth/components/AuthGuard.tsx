import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { appRoutes } from "@/config/routes";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to={appRoutes.login} replace />;
}
