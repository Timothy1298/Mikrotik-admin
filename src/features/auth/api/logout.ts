import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export async function logout() {
  await apiClient.post(endpoints.auth.logout);
  return true;
}
