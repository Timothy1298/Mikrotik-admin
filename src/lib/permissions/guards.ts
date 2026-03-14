import type { Permission } from "@/lib/permissions/permissions";
import { can } from "@/lib/permissions/can";
import type { AuthUser } from "@/types/auth/auth.types";

export function hasPermission(user: AuthUser | null, permission: Permission) {
  return can(user?.role, permission);
}
