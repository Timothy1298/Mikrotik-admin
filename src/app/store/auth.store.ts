import { create } from "zustand";
import type { AuthUser } from "@/types/auth/auth.types";

type AuthState = {
  user: AuthUser | null;
  sessionExpiresAt: string | null;
  hydrated: boolean;
  setSession: (user: AuthUser, sessionExpiresAt: string | null) => void;
  clearSession: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sessionExpiresAt: null,
  hydrated: false,
  setSession: (user, sessionExpiresAt) => {
    set({ user, sessionExpiresAt, hydrated: true });
  },
  clearSession: () => {
    set({ user: null, sessionExpiresAt: null, hydrated: true });
  },
  hydrate: () => {
    set({ hydrated: true });
  },
}));
