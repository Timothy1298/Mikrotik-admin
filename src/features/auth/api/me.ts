import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthUser } from "@/types/auth/auth.types";

export async function me() {
  const { data } = await apiClient.get<{ success: boolean; user: AuthUser }>(endpoints.auth.me);
  return data.user;
}
