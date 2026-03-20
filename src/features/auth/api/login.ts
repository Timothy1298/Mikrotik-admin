import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthSession, LoginPayload, TwoFactorChallenge, TwoFactorLoginPayload } from "@/types/auth/auth.types";

export async function login(payload: LoginPayload): Promise<AuthSession | TwoFactorChallenge> {
  const { data } = await apiClient.post<{ success: boolean; data: ({ token: string; user: AuthSession["user"] } | TwoFactorChallenge) }>(endpoints.auth.login, payload);
  const response = data.data;
  if ((response as TwoFactorChallenge).requiresTwoFactor) {
    return response as TwoFactorChallenge;
  }
  const session = response as { token: string; user: AuthSession["user"] };
  return { token: session.token, user: session.user } satisfies AuthSession;
}

export async function verifyTwoFactorLogin(payload: TwoFactorLoginPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: { token: string; user: AuthSession["user"] } }>(endpoints.auth.loginTwoFactor, payload);
  return { token: data.data.token, user: data.data.user } satisfies AuthSession;
}
