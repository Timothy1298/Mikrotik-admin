import { Users2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
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
      <Card>
        <div className="space-y-3 p-8 text-center">
          <Users2 className="mx-auto h-12 w-12 text-text-muted" />
          <p className="text-lg font-medium text-text-primary">Reseller Management</p>
          <p className="mx-auto max-w-md text-sm text-text-secondary">
            Reseller account management, plan pool allocation, price markup configuration, and commission settlement are planned for a future release. This section will allow ISP franchise operators and sub-distributors to manage their own subscriber pools independently.
          </p>
          <div>
            <Badge tone="info">Coming Soon</Badge>
          </div>
        </div>
      </Card>
    </SettingsShell>
  );
}
