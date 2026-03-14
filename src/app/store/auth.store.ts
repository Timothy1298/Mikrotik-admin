import { create } from "zustand";
import type { AuthUser } from "@/types/auth/auth.types";
import { removeStorage, readStorage, storageKeys, writeStorage } from "@/lib/utils/storage";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  setSession: (token, user) => {
    writeStorage(storageKeys.accessToken, token);
    writeStorage(storageKeys.user, JSON.stringify(user));
    set({ token, user, hydrated: true });
  },
  clearSession: () => {
    removeStorage(storageKeys.accessToken);
    removeStorage(storageKeys.user);
    set({ token: null, user: null, hydrated: true });
  },
  hydrate: () => {
    const token = readStorage(storageKeys.accessToken);
    const user = readStorage(storageKeys.user);
    set({
      token,
      user: user ? (JSON.parse(user) as AuthUser) : null,
      hydrated: true,
    });
  },
}));
