import { permissionMap } from "@/config/permissions";
import { roles, type Role } from "@/lib/permissions/roles";

export const roleAbilities: Record<Role, string[]> = {
  [roles.superAdmin]: Object.values(permissionMap),
  [roles.networkAdmin]: [permissionMap.routersView, permissionMap.routersDelete, permissionMap.logsView, permissionMap.monitoringView],
  [roles.supportAdmin]: [permissionMap.usersView, permissionMap.logsView],
  [roles.billingAdmin]: [permissionMap.billingView, permissionMap.logsView, permissionMap.usersView],
};
