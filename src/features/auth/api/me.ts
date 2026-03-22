import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthSession, AuthUser } from "@/types/auth/auth.types";

export async function me() {
  const { data } = await apiClient.get<{ success: boolean; user: AuthUser; sessionExpiresAt?: string | null }>(endpoints.auth.me);
  return {
    user: data.user,
    sessionExpiresAt: data.sessionExpiresAt ?? null,
  } satisfies AuthSession;
}
