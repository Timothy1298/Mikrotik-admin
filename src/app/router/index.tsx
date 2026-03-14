import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoutes } from "@/app/router/protected-routes";
import { PublicRoutes } from "@/app/router/public-routes";
import { appRoutes } from "@/config/routes";
import { ForbiddenPage } from "@/pages/errors/ForbiddenPage";
import { NetworkErrorPage } from "@/pages/errors/NetworkErrorPage";
import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { ServerErrorPage } from "@/pages/errors/ServerErrorPage";

export function AppRouter() {
  return (
    <Routes>
      {PublicRoutes()}
      {ProtectedRoutes()}
      <Route path={appRoutes.forbidden} element={<ForbiddenPage />} />
      <Route path={appRoutes.serverError} element={<ServerErrorPage />} />
      <Route path={appRoutes.networkError} element={<NetworkErrorPage />} />
      <Route path={appRoutes.notFound} element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to={appRoutes.notFound} replace />} />
    </Routes>
  );
}
