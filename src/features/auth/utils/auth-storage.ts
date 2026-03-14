import type { AuthSession } from "@/types/auth/auth.types";
import { storageKeys, readStorage, removeStorage, writeStorage } from "@/lib/utils/storage";

export function persistSession(session: AuthSession) {
  writeStorage(storageKeys.accessToken, session.token);
  writeStorage(storageKeys.user, JSON.stringify(session.user));
}

export function clearPersistedSession() {
  removeStorage(storageKeys.accessToken);
  removeStorage(storageKeys.user);
}

export function readPersistedUser() {
  const raw = readStorage(storageKeys.user);
  return raw ? JSON.parse(raw) : null;
}
