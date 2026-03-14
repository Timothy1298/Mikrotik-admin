import type { Permission } from "@/lib/permissions/permissions";
import type { Role } from "@/lib/permissions/roles";
import { permissions } from "@/lib/permissions/permissions";
import { roles } from "@/lib/permissions/roles";

const rolePermissions: Record<Role, Permission[]> = {
  [roles.superAdmin]: Object.values(permissions),
  [roles.networkAdmin]: [
    permissions.dashboardView,
    permissions.routersView,
    permissions.routersManage,
    permissions.vpnServersView,
    permissions.monitoringView,
    permissions.logsView,
    permissions.settingsView,
  ],
  [roles.billingAdmin]: [
    permissions.dashboardView,
    permissions.billingView,
    permissions.billingManage,
    permissions.usersView,
    permissions.logsView,
  ],
  [roles.supportAdmin]: [
    permissions.dashboardView,
    permissions.usersView,
    permissions.supportView,
    permissions.supportManage,
    permissions.logsView,
  ],
};

export function getPermissionsForRole(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

export function can(role: Role | string | undefined, permission: Permission) {
  if (!role) return false;

  // Backend currently returns plain `admin` / `user`, while the frontend
  // permission system uses richer role identifiers.
  if (role === "admin") {
    return true;
  }

  if (role === "user") {
    return [permissions.dashboardView, permissions.supportView].includes(permission as typeof permissions.dashboardView | typeof permissions.supportView);
  }

  return getPermissionsForRole(role as Role).includes(permission);
}
