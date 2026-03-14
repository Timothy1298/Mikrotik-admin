import { Navigate } from "react-router-dom";
import { appRoutes } from "@/config/routes";

export function MonitoringPage() {
  return <Navigate to={appRoutes.monitoringOverview} replace />;
}
