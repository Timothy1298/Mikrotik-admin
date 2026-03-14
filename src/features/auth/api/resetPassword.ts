import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export async function resetPassword(payload: { token: string; password: string }) {
  const { data } = await apiClient.post(endpoints.auth.resetPassword, payload);
  return data;
}
