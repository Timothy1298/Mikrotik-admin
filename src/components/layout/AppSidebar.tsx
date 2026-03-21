import { ChevronDown, LogOut, Shield } from "lucide-react";
import { useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
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

function pathBelongsToItem(pathname: string, path: string) {
  const basePath = getItemBasePath(path);
  return pathname === path || pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function getNavClassName(active: boolean, collapsed = false) {
  return cn(
    "flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-[13px] transition-colors",
    active
      ? "surface-active text-text-primary"
      : "border-transparent text-text-secondary hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary",
    collapsed && "justify-center",
  );
}

export function AppSidebar() {
  const location = useLocation();
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    toggleSidebar,
    closeMobileSidebar,
    expandedSidebarSection,
    setExpandedSidebarSection,
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
          "flex w-[268px] flex-col",
        )}
      >
        <div className="flex h-full flex-col px-3 py-5">
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
                <div key={item.path} className="space-y-1">
                  {(() => {
                    const isItemActive = pathBelongsToItem(location.pathname, item.path);
                    const isItemOpen = isItemActive || expandedSidebarSection === item.path;

                    return "children" in item && item.children ? (
                    <>
                      <div className="flex items-center gap-0.5">
                        <NavLink
                          to={item.path}
                          onClick={closeMobileSidebar}
                          className={cn(getNavClassName(isItemActive), "min-w-0 flex-1")}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="truncate leading-snug">{item.label}</span>
                        </NavLink>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setExpandedSidebarSection(expandedSidebarSection === item.path ? null : item.path);
                          }}
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-text-secondary transition-colors hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary",
                            isItemActive && "text-text-primary",
                          )}
                        >
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 transition-transform",
                              isItemOpen && "rotate-180",
                            )}
                          />
                        </button>
                      </div>
                      {isItemOpen ? (
                        <div className="ml-4 space-y-1 border-l border-background-border pl-3">
                          {item.children.map((child) => (
                            <SidebarNavItem
                              key={child.path}
                              icon={item.icon}
                              label={child.label}
                              to={child.path}
                              active={child.path === location.pathname}
                              onClick={closeMobileSidebar}
                            />
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <SidebarNavItem
                      icon={item.icon}
                      label={item.label}
                      to={item.path}
                      onClick={closeMobileSidebar}
                    />
                  );
                  })()}
                </div>
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
          sidebarCollapsed ? "w-[72px]" : "w-[268px]"
        }`}
      >
        <div className="flex h-full flex-col px-3 py-5">
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
                <div key={item.path} className="space-y-1">
                  {(() => {
                    const isItemActive = pathBelongsToItem(location.pathname, item.path);
                    const isItemOpen = isItemActive || expandedSidebarSection === item.path;

                    return "children" in item && item.children ? (
                    <>
                      <div className={cn("flex items-center gap-0.5", sidebarCollapsed && "justify-center")}>
                        <NavLink
                          to={item.path}
                          className={cn(getNavClassName(isItemActive, sidebarCollapsed), !sidebarCollapsed && "min-w-0 flex-1")}
                        >
                          <item.icon className="h-4 w-4" />
                          {!sidebarCollapsed ? <span className="truncate leading-snug">{item.label}</span> : null}
                        </NavLink>
                        {!sidebarCollapsed ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setExpandedSidebarSection(expandedSidebarSection === item.path ? null : item.path);
                            }}
                            className={cn(
                              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-text-secondary transition-colors hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary",
                              isItemActive && "text-text-primary",
                            )}
                          >
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-transform",
                                isItemOpen && "rotate-180",
                              )}
                            />
                          </button>
                        ) : null}
                      </div>
                      {!sidebarCollapsed && isItemOpen ? (
                        <div className="ml-4 space-y-1 border-l border-background-border pl-3">
                          {item.children.map((child) => (
                            <SidebarNavItem
                              key={child.path}
                              icon={item.icon}
                              label={child.label}
                              to={child.path}
                              active={child.path === location.pathname}
                            />
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <SidebarNavItem
                      icon={item.icon}
                      label={item.label}
                      to={item.path}
                      collapsed={sidebarCollapsed}
                    />
                  );
                  })()}
                </div>
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
