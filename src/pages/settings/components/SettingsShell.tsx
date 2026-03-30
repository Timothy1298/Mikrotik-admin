import { useMemo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Tabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { appRoutes } from "@/config/routes";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";

export function SettingsShell({
  title,
  description,
  meta,
  actions,
  children,
}: {
  title: string;
  description: string;
  meta?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const tabs = useMemo(
    () =>
      [
        can(user || undefined, permissions.settingsView) ? { label: "Profile", value: appRoutes.settings } : null,
        can(user || undefined, permissions.settingsView) ? { label: "Account Security", value: appRoutes.settingsSecurity } : null,
        can(user || undefined, permissions.settingsView) ? { label: "System", value: appRoutes.settingsSystem } : null,
        can(user || undefined, permissions.settingsManage) ? { label: "Admin Accounts", value: appRoutes.settingsAdmins } : null,
        can(user || undefined, permissions.servicePlansView) ? { label: "Service Plans", value: appRoutes.settingsServicePlans } : null,
        can(user || undefined, permissions.settingsManage) ? { label: "Resellers", value: appRoutes.settingsResellers } : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>,
    [user],
  );

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={title} description={description} meta={meta} />
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      {tabs.length ? <Tabs tabs={tabs} value={location.pathname} onChange={() => undefined} /> : null}

      <div className="min-w-0 space-y-6 xl:max-h-[calc(100vh-16rem)] xl:overflow-y-auto xl:pr-2">
        {children}
      </div>
    </section>
  );
}
