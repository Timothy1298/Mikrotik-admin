import { Navigate } from "react-router-dom";
import { appRoutes } from "@/config/routes";

export function RoutersPage() {
  return <Navigate to={appRoutes.routersOverview} replace />;
}
