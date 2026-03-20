import type { Permission } from "@/lib/permissions/permissions";
import type { Role } from "@/lib/permissions/roles";
import type { AuthUser } from "@/types/auth/auth.types";
import { permissions } from "@/lib/permissions/permissions";
import { roles } from "@/lib/permissions/roles";

const rolePermissions: Record<Role, Permission[]> = {
  [roles.superAdmin]: Object.values(permissions),
  [roles.networkAdmin]: [
    permissions.dashboardView,
    permissions.routersView,
    permissions.routersManage,
    permissions.routersLiveOps,
    permissions.vpnServersView,
    permissions.vpnServersManage,
    permissions.monitoringView,
    permissions.logsView,
    permissions.logsExport,
    permissions.settingsView,
    permissions.servicePlansView,
    permissions.servicePlansManage,
    permissions.supportView,
    permissions.supportReply,
  ],
  [roles.billingAdmin]: [
    permissions.dashboardView,
    permissions.billingView,
    permissions.billingManage,
    permissions.billingRecordPayment,
    permissions.billingCreateInvoice,
    permissions.billingExport,
    permissions.usersView,
    permissions.logsView,
    permissions.settingsView,
    permissions.supportView,
    permissions.supportReply,
  ],
  [roles.supportAdmin]: [
    permissions.dashboardView,
    permissions.usersView,
    permissions.usersManage,
    permissions.supportView,
    permissions.supportManage,
    permissions.supportReply,
    permissions.logsView,
    permissions.settingsView,
    permissions.routersView,
  ],
  [roles.readOnly]: [
    permissions.dashboardView,
    permissions.routersView,
    permissions.vpnServersView,
    permissions.monitoringView,
    permissions.usersView,
    permissions.billingView,
    permissions.logsView,
    permissions.supportView,
    permissions.settingsView,
    permissions.servicePlansView,
  ],
};

export function getPermissionsForRole(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

export function can(userOrRole: AuthUser | Role | string | undefined, permission: Permission) {
  if (!userOrRole) return false;

  const role = typeof userOrRole === "object" ? userOrRole.role : userOrRole;
  const adminRole = typeof userOrRole === "object" ? userOrRole.adminRole : null;

  if (role === "user") {
    return [permissions.dashboardView, permissions.supportView].includes(
      permission as typeof permissions.dashboardView | typeof permissions.supportView,
    );
  }

  if (role === "admin") {
    if (adminRole && Object.values(roles).includes(adminRole as Role)) {
      return getPermissionsForRole(adminRole as Role).includes(permission);
    }
    return true;
  }

  if (Object.values(roles).includes(role as Role)) {
    return getPermissionsForRole(role as Role).includes(permission);
  }

  return false;
}
