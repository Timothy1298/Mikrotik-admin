import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { appRoutes } from "@/config/routes";
import type { Permission } from "@/lib/permissions/permissions";
import { hasPermission } from "@/lib/permissions/guards";

function isSessionExpired(sessionExpiresAt: string | null) {
  return Boolean(sessionExpiresAt && Date.parse(sessionExpiresAt) <= Date.now());
}

export function RequireAuth() {
  const location = useLocation();
  const { user, sessionExpiresAt, clearSession } = useAuthStore();

  if (isSessionExpired(sessionExpiresAt)) {
    clearSession();
    return <Navigate to={appRoutes.login} replace state={{ from: location }} />;
  }

  if (!user) {
    return <Navigate to={appRoutes.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RequirePermission({ permission }: { permission: Permission }) {
  const user = useAuthStore((state) => state.user);

  if (!hasPermission(user, permission)) {
    return <Navigate to={appRoutes.forbidden} replace />;
  }

  return <Outlet />;
}

export function RedirectAuthenticated() {
  const user = useAuthStore((state) => state.user);
  const sessionExpiresAt = useAuthStore((state) => state.sessionExpiresAt);
  return user && !isSessionExpired(sessionExpiresAt) ? <Navigate to={appRoutes.dashboard} replace /> : <Outlet />;
}
