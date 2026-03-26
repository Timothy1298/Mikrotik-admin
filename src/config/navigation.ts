import { Activity, BarChart3, CreditCard, LayoutDashboard, LifeBuoy, LockKeyhole, Package, PlusCircle, Router, Server, Settings, Users, UsersRound } from "lucide-react";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/permissions/permissions";

export const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: appRoutes.dashboard, permission: permissions.dashboardView },
  {
    label: "Users",
    icon: UsersRound,
    path: appRoutes.usersOverview,
    permission: permissions.usersView,
    children: [
      { label: "Overview", path: appRoutes.usersOverview },
      { label: "User Directory", path: appRoutes.usersAll },
    ],
  },
  {
    label: "Routers",
    icon: Router,
    path: appRoutes.routersOverview,
    permission: permissions.routersView,
    children: [
      { label: "Add Router", path: appRoutes.routersAdd, icon: PlusCircle },
      { label: "Overview", path: appRoutes.routersOverview },
      { label: "Router Fleet", path: appRoutes.routersAll },
      { label: "Live Operations", path: appRoutes.routersLiveOperations },
      { label: "API Connectivity", path: appRoutes.routersApiConnectivity },
    ],
  },
  {
    label: "VPN",
    icon: Server,
    path: appRoutes.vpnServersOverview,
    permission: permissions.vpnServersView,
    children: [
      { label: "Overview", path: appRoutes.vpnServersOverview },
      { label: "Server Fleet", path: appRoutes.vpnServersAll },
    ],
  },
  {
    label: "Monitoring",
    icon: Activity,
    path: appRoutes.monitoringOverview,
    permission: permissions.monitoringView,
    children: [
      { label: "Overview", path: appRoutes.monitoringOverview },
      { label: "Workspace", path: appRoutes.monitoringRouterHealth },
    ],
  },
  {
    label: "Billing",
    icon: CreditCard,
    path: appRoutes.billingOverview,
    permission: permissions.billingView,
    children: [
      { label: "Overview", path: appRoutes.billingOverview },
      { label: "Workspace", path: appRoutes.billingSubscriptions },
      { label: "Collections & Enforcement", path: appRoutes.billingOverdueRisk },
      { label: "Financial Reports", path: appRoutes.billingReports, icon: BarChart3 },
    ],
  },
  {
    label: "Security",
    icon: LockKeyhole,
    path: appRoutes.logsSecurityOverview,
    permission: permissions.logsView,
    children: [
      { label: "Overview", path: appRoutes.logsSecurityOverview },
      { label: "Workspace", path: appRoutes.logsSecuritySecurityOverview },
    ],
  },
  {
    label: "Support",
    icon: LifeBuoy,
    path: appRoutes.supportOverview,
    permission: permissions.supportView,
    children: [
      { label: "Overview", path: appRoutes.supportOverview },
      { label: "Ticket Queue", path: appRoutes.supportTickets },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    path: appRoutes.settings,
    permission: permissions.settingsView,
    children: [
      { label: "Profile", path: appRoutes.settings },
      { label: "Security", path: appRoutes.settingsSecurity },
      { label: "System", path: appRoutes.settingsSystem },
      { label: "Admin Accounts", path: appRoutes.settingsAdmins, icon: Users, permission: permissions.settingsManage },
      { label: "Service Plans", path: appRoutes.settingsServicePlans, icon: Package, permission: permissions.servicePlansView },
    ],
  },
] as const;
