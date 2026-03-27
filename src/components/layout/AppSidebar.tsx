import { LogOut, Shield } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { useUIStore } from "@/app/store/ui.store";
import { navigationItems } from "@/config/navigation";
import { hasPermission } from "@/lib/permissions/guards";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { SidebarSection } from "@/components/layout/SidebarSection";
import { useLogout } from "@/features/auth/hooks/useLogout";

function getItemBasePath(path: string) {
  const [, segment] = path.split("/");
  return segment ? `/${segment}` : path;
}

function pathBelongsToItem(pathname: string, path: string, matchMode?: unknown) {
  if (matchMode === "exact") {
    return pathname === path;
  }

  const basePath = getItemBasePath(path);
  return pathname === path || pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export function AppSidebar() {
  const location = useLocation();
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    toggleSidebar,
    closeMobileSidebar,
  } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const visibleItems = useMemo(
    () => navigationItems.filter((item) => hasPermission(user, item.permission)),
    [user],
  );

  useEffect(() => {
    closeMobileSidebar();
  }, [closeMobileSidebar, location.pathname]);

  return (
    <>
      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-background-main/70 backdrop-blur-sm xl:hidden" onClick={closeMobileSidebar} />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 shrink-0 border-r border-background-border bg-background-sidebar transition-transform xl:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "flex w-[252px] flex-col",
        )}
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="icon-block-highlight rounded-xl p-2.5">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-text-primary">Mikrotik Admin</p>
                <p className="truncate text-xs text-text-secondary">Ops control center</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={closeMobileSidebar} className="shrink-0">
              ×
            </Button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden pr-1">
            <SidebarSection title="Operations">
              {visibleItems.map((item) => (
                <SidebarNavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  to={item.path}
                  active={pathBelongsToItem(location.pathname, item.path, "matchMode" in item ? item.matchMode : undefined)}
                  onClick={closeMobileSidebar}
                />
              ))}
            </SidebarSection>
          </div>

          <div className="pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={() => void logout()}
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden shrink-0 border-r border-background-border bg-background-sidebar xl:flex xl:flex-col ${
          sidebarCollapsed ? "w-24" : "w-[252px]"
        }`}
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="icon-block-highlight rounded-xl p-2.5">
                <Shield className="h-5 w-5" />
              </div>
              {!sidebarCollapsed ? (
                <div className="min-w-0">
                  <p className="truncate font-semibold text-text-primary">Mikrotik Admin</p>
                  <p className="truncate text-xs text-text-secondary">Ops control center</p>
                </div>
              ) : null}
            </div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0">
              ≡
            </Button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden pr-1">
            <SidebarSection title="Operations" collapsed={sidebarCollapsed}>
              {visibleItems.map((item) => (
                <SidebarNavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  to={item.path}
                  collapsed={sidebarCollapsed}
                  active={pathBelongsToItem(location.pathname, item.path, "matchMode" in item ? item.matchMode : undefined)}
                />
              ))}
            </SidebarSection>
          </div>

          <div className="pt-4">
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? "justify-center" : "justify-start"}`}
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={() => void logout()}
            >
              {sidebarCollapsed ? "" : "Logout"}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
