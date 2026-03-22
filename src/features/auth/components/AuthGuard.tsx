import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { appRoutes } from "@/config/routes";

function isSessionExpired(sessionExpiresAt: string | null) {
  return Boolean(sessionExpiresAt && Date.parse(sessionExpiresAt) <= Date.now());
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const sessionExpiresAt = useAuthStore((state) => state.sessionExpiresAt);
  return user && !isSessionExpired(sessionExpiresAt) ? <>{children}</> : <Navigate to={appRoutes.login} replace />;
}
