import { Activity, BadgeCheck, Building2, CreditCard, Gift, LayoutDashboard, LifeBuoy, LockKeyhole, Router, Server, Settings, ShieldCheck, UserCircle2, Users } from "lucide-react";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/permissions/permissions";

export const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: appRoutes.dashboard, permission: permissions.dashboardView },
  { label: "Users", icon: Users, path: appRoutes.usersOverview, permission: permissions.usersView },
  { label: "Routers", icon: Router, path: appRoutes.routersOverview, permission: permissions.routersView },
  { label: "VPN", icon: Server, path: appRoutes.vpnServersOverview, permission: permissions.vpnServersView },
  { label: "Monitoring", icon: Activity, path: appRoutes.monitoringOverview, permission: permissions.monitoringView },
  { label: "Billing", icon: CreditCard, path: appRoutes.billingOverview, permission: permissions.billingView },
  { label: "Support", icon: LifeBuoy, path: appRoutes.supportOverview, permission: permissions.supportView },
  { label: "Security", icon: LockKeyhole, path: appRoutes.logsSecurityOverview, permission: permissions.logsView },
  { label: "Referrals", icon: Gift, path: appRoutes.referrals, permission: permissions.usersView },
  { label: "Profile", icon: UserCircle2, path: appRoutes.settings, permission: permissions.settingsView, matchMode: "exact" },
  { label: "Account Security", icon: ShieldCheck, path: appRoutes.settingsSecurity, permission: permissions.settingsView, matchMode: "exact" },
  { label: "System", icon: Settings, path: appRoutes.settingsSystem, permission: permissions.settingsView, matchMode: "exact" },
  { label: "Admin Accounts", icon: Users, path: appRoutes.settingsAdmins, permission: permissions.settingsManage, matchMode: "exact" },
  { label: "Service Plans", icon: BadgeCheck, path: appRoutes.settingsServicePlans, permission: permissions.servicePlansView, matchMode: "exact" },
  { label: "Resellers", icon: Building2, path: appRoutes.settingsResellers, permission: permissions.settingsManage, matchMode: "exact" },
] as const;
