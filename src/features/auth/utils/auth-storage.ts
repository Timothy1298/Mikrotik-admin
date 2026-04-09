import type { AuthSession } from "@/types/auth/auth.types";

export function persistSession(session: AuthSession) {
  void session;
  return undefined;
}

export function clearPersistedSession() {
  return undefined;
}

export function readPersistedUser() {
  return null;
}
