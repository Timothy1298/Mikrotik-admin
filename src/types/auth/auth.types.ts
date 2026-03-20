import type { Role } from "@/lib/permissions/roles";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  adminRole?: string | null;
  twoFactorEnabled?: boolean;
  permissions: string[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type TwoFactorLoginPayload = {
  challengeToken: string;
  code: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type TwoFactorChallenge = {
  requiresTwoFactor: true;
  challengeToken: string;
  user: AuthUser;
};
