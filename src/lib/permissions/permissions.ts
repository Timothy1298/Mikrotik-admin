export const permissions = {
  dashboardView: "dashboard:view",
  usersView: "users:view",
  usersManage: "users:manage",
  routersView: "routers:view",
  routersManage: "routers:manage",
  vpnServersView: "vpn_servers:view",
  monitoringView: "monitoring:view",
  billingView: "billing:view",
  billingManage: "billing:manage",
  logsView: "logs:view",
  supportView: "support:view",
  supportManage: "support:manage",
  settingsView: "settings:view",
  settingsManage: "settings:manage",
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];
