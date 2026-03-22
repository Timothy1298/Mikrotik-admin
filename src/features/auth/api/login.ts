import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthSession, LoginPayload, TwoFactorChallenge, TwoFactorLoginPayload } from "@/types/auth/auth.types";

export async function login(payload: LoginPayload): Promise<AuthSession | TwoFactorChallenge> {
  const { data } = await apiClient.post<{ success: boolean; data: ({ user: AuthSession["user"]; sessionExpiresAt: string | null } | TwoFactorChallenge) }>(endpoints.auth.login, payload);
  const response = data.data;
  if ((response as TwoFactorChallenge).requiresTwoFactor) {
    return response as TwoFactorChallenge;
  }
  const session = response as { user: AuthSession["user"]; sessionExpiresAt: string | null };
  return { user: session.user, sessionExpiresAt: session.sessionExpiresAt } satisfies AuthSession;
}

export async function verifyTwoFactorLogin(payload: TwoFactorLoginPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: { user: AuthSession["user"]; sessionExpiresAt: string | null } }>(endpoints.auth.loginTwoFactor, payload);
  return { user: data.data.user, sessionExpiresAt: data.data.sessionExpiresAt } satisfies AuthSession;
}
