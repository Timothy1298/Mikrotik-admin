import { create } from "zustand";

type UIState = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  expandedSidebarSection: string | null;
  lastVisitedSidebarSubmenu: Record<string, string>;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setExpandedSidebarSection: (section: string | null) => void;
  rememberSidebarSubmenu: (section: string, path: string) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  expandedSidebarSection: null,
  lastVisitedSidebarSubmenu: {},
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  setExpandedSidebarSection: (section) => set((state) => (
    state.expandedSidebarSection === section ? state : { expandedSidebarSection: section }
  )),
  rememberSidebarSubmenu: (section, path) => set((state) => (
    state.lastVisitedSidebarSubmenu[section] === path
      ? state
      : {
          lastVisitedSidebarSubmenu: {
            ...state.lastVisitedSidebarSubmenu,
            [section]: path,
          },
        }
  )),
}));
