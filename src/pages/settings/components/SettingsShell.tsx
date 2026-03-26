import type { ReactNode } from "react";
import {
  BadgeCheck,
  Building2,
  Server,
  ShieldCheck,
  UserCircle2,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { appRoutes } from "@/config/routes";
import { can } from "@/lib/permissions/can";
import { type Permission, permissions } from "@/lib/permissions/permissions";
import { cn } from "@/lib/utils/cn";

type SidebarNavItem = {
  label: string;
  description: string;
  path: string;
  icon: typeof UserCircle2;
  permission?: Permission;
};

function SettingsTopNav() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const navItems: SidebarNavItem[] = [
    {
      label: "Profile",
      description: "Name, email, and role",
      path: appRoutes.settings,
      icon: UserCircle2,
    },
    {
      label: "Security",
      description: "2FA and active sessions",
      path: appRoutes.settingsSecurity,
      icon: ShieldCheck,
    },
    {
      label: "System",
      description: "Runtime and platform config",
      path: appRoutes.settingsSystem,
      icon: Server,
    },
    {
      label: "Admin Accounts",
      description: "Team and access roles",
      path: appRoutes.settingsAdmins,
      icon: Users,
      permission: permissions.settingsManage,
    },
    {
      label: "Service Plans",
      description: "Plans, speeds, and vouchers",
      path: appRoutes.settingsServicePlans,
      icon: BadgeCheck,
      permission: permissions.servicePlansView,
    },
    {
      label: "Resellers",
      description: "Reseller accounts",
      path: appRoutes.settingsResellers,
      icon: Building2,
      permission: permissions.settingsManage,
    },
  ];

  const visibleItems = navItems.filter((item) => !item.permission || can(user || undefined, item.permission));

  return (
    <Card className="p-3">
      <div className="mb-3 px-2">
        <p className="text-sm font-semibold tracking-wide text-text-primary">Settings Areas</p>
        <p className="mt-1 text-sm text-text-secondary">
          Navigate across operator settings without leaving this workspace.
        </p>
      </div>
      <nav className="flex flex-wrap gap-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "min-w-[220px] flex-1 rounded-2xl border px-4 py-3 transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.22)]"
                  : "border-background-border bg-background-elevated/70 text-text-primary hover:border-primary/30 hover:bg-primary/5",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 rounded-xl p-2",
                    isActive ? "icon-block-highlight" : "bg-background-panel text-text-secondary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-semibold", isActive ? "text-text-primary" : "text-text-primary/95")}>
                    {item.label}
                  </p>
                  <p className={cn("mt-1 text-sm leading-5", isActive ? "text-text-secondary" : "text-text-secondary/95")}>
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}

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
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={title} description={description} meta={meta} />
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      <div className="space-y-6 xl:overflow-hidden">
        <SettingsTopNav />
        <div className="min-w-0 space-y-6 xl:max-h-[calc(100vh-16rem)] xl:overflow-y-auto xl:pr-2">
          {children}
        </div>
      </div>
    </section>
  );
}
