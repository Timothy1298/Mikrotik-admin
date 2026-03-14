import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post(endpoints.auth.forgotPassword, { email });
  return data;
}
