import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthSession, LoginPayload } from "@/types/auth/auth.types";

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: { token: string; user: AuthSession["user"] } }>(endpoints.auth.login, payload);
  return { token: data.data.token, user: data.data.user } satisfies AuthSession;
}
