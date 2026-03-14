import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { appRoutes } from "@/config/routes";
import type { Permission } from "@/lib/permissions/permissions";
import { hasPermission } from "@/lib/permissions/guards";

export function RequireAuth() {
  const location = useLocation();
  const { token } = useAuthStore();

  if (!token) {
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
  const token = useAuthStore((state) => state.token);
  return token ? <Navigate to={appRoutes.dashboard} replace /> : <Outlet />;
}
