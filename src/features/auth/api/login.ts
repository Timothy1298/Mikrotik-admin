import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthSession, LoginPayload, TwoFactorChallenge, TwoFactorLoginPayload } from "@/types/auth/auth.types";

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: ({ token: string; user: AuthSession["user"] } | TwoFactorChallenge) }>(endpoints.auth.login, payload);
  if ("requiresTwoFactor" in data.data && data.data.requiresTwoFactor) {
    return data.data;
  }
  return { token: data.data.token, user: data.data.user } satisfies AuthSession;
}

export async function verifyTwoFactorLogin(payload: TwoFactorLoginPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: { token: string; user: AuthSession["user"] } }>(endpoints.auth.loginTwoFactor, payload);
  return { token: data.data.token, user: data.data.user } satisfies AuthSession;
}
