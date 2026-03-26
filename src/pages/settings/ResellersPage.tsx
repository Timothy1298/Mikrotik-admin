import { Users2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { EmptyState } from "@/components/feedback/EmptyState";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/permissions/permissions";
import { can } from "@/lib/permissions/can";
import { SettingsShell } from "@/pages/settings/components/SettingsShell";

export function ResellersPage() {
  const user = useAuthStore((state) => state.user);
  if (!can(user || undefined, permissions.settingsManage)) {
    return <Navigate to={appRoutes.forbidden} replace />;
  }

  return (
    <SettingsShell
      title="Reseller Management"
      description="Manage sub-distributor and franchise operator accounts, plan allocations, and commission tracking."
    >
      <EmptyState
        icon={Users2}
        title="Reseller management is not available yet"
        description="The backend now returns 501 Not Implemented for this area until the full reseller workflow is built."
      />
    </SettingsShell>
  );
}
