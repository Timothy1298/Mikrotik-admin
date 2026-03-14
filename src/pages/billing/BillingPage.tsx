import { Navigate } from "react-router-dom";
import { appRoutes } from "@/config/routes";

export function BillingPage() {
  return <Navigate to={appRoutes.billingOverview} replace />;
}
