import { clearPersistedSession } from "@/features/auth/utils/auth-storage";

export async function logout() {
  clearPersistedSession();
  return true;
}
