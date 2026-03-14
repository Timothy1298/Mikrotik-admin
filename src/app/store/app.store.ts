import { create } from "zustand";

type AppState = {
  bootstrapped: boolean;
  setBootstrapped: (value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  bootstrapped: false,
  setBootstrapped: (value) => set({ bootstrapped: value }),
}));
