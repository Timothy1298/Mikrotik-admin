import type { Role } from "@/lib/permissions/roles";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: string[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};
