import { Navigate } from "react-router-dom";
import { appRoutes } from "@/config/routes";

export function VpnServersPage() {
  return <Navigate to={appRoutes.vpnServersOverview} replace />;
}
