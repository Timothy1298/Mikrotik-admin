import { Navigate } from "react-router-dom";
import { appRoutes } from "@/config/routes";

export function LogsPage() {
  return <Navigate to={appRoutes.logsSecurityOverview} replace />;
}
