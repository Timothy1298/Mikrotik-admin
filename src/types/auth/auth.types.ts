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
  rememberDevice: boolean;
};

export type TwoFactorLoginPayload = {
  challengeToken: string;
  code: string;
};

export type AuthSession = {
  user: AuthUser;
  sessionExpiresAt: string | null;
};

export type TwoFactorChallenge = {
  requiresTwoFactor: true;
  challengeToken: string;
  user: AuthUser;
};
