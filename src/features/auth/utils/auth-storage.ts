import type { AuthSession } from "@/types/auth/auth.types";

export function persistSession(_session: AuthSession) {
  return undefined;
}

export function clearPersistedSession() {
  return undefined;
}

export function readPersistedUser() {
  return null;
}
