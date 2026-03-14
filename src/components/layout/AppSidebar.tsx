import { ChevronDown, LogOut, Shield } from "lucide-react";
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

function pathBelongsToItem(pathname: string, path: string) {
  const basePath = getItemBasePath(path);
  return pathname === path || pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export function AppSidebar() {
  const location = useLocation();
  const {
    sidebarCollapsed,
    toggleSidebar,
    expandedSidebarSection,
    setExpandedSidebarSection,
    lastVisitedSidebarSubmenu,
    rememberSidebarSubmenu,
  } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const visibleItems = useMemo(
    () => navigationItems.filter((item) => hasPermission(user, item.permission)),
    [user],
  );

  useEffect(() => {
    const matchedItem = visibleItems.find((item) => "children" in item && item.children?.some((child) => child.path === location.pathname));
    if (!matchedItem || !("children" in matchedItem) || !matchedItem.children) return;
    if (lastVisitedSidebarSubmenu[matchedItem.path] !== location.pathname) {
      rememberSidebarSubmenu(matchedItem.path, location.pathname);
    }
    if (expandedSidebarSection !== matchedItem.path) {
      setExpandedSidebarSection(matchedItem.path);
    }
  }, [expandedSidebarSection, lastVisitedSidebarSubmenu, location.pathname, rememberSidebarSubmenu, setExpandedSidebarSection, visibleItems]);

  useEffect(() => {
    if (!expandedSidebarSection) {
      const activeItem = visibleItems.find((item) => "children" in item && item.children && pathBelongsToItem(location.pathname, item.path));
      if (activeItem) {
        setExpandedSidebarSection(activeItem.path);
      }
    }
  }, [expandedSidebarSection, location.pathname, setExpandedSidebarSection, visibleItems]);

  return (
    <aside
      className={`hidden h-screen shrink-0 border-r border-brand-500/15 bg-[rgba(8,14,31,0.9)] backdrop-blur xl:flex xl:flex-col ${
        sidebarCollapsed ? "w-24" : "w-[292px]"
      }`}
    >
      <div className="flex h-full flex-col px-4 py-5">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="icon-block-highlight rounded-2xl p-2.5">
              <Shield className="h-5 w-5" />
            </div>
            {!sidebarCollapsed ? (
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">Mikrotik Admin</p>
                <p className="truncate text-xs text-slate-500">Ops control center</p>
              </div>
            ) : null}
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0 text-slate-300">
            ≡
          </Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden pr-1">
          <SidebarSection title="Operations" collapsed={sidebarCollapsed}>
            {visibleItems.map((item) => (
              <div key={item.path} className="space-y-1">
                {"children" in item && item.children ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpandedSidebarSection(expandedSidebarSection === item.path ? null : item.path)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-sm transition",
                        pathBelongsToItem(location.pathname, item.path)
                          ? "surface-active border-brand-500/35 text-slate-100"
                          : "border-transparent text-slate-300 hover:border-brand-500/15 hover:bg-[rgba(37,99,235,0.08)] hover:text-white",
                        sidebarCollapsed && "justify-center",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {!sidebarCollapsed ? <span>{item.label}</span> : null}
                      </span>
                      {!sidebarCollapsed ? (
                        <ChevronDown
                          className={cn("h-4 w-4 shrink-0 transition-transform", expandedSidebarSection === item.path && "rotate-180")}
                        />
                      ) : null}
                    </button>
                    {!sidebarCollapsed && expandedSidebarSection === item.path ? (
                      <div className="ml-6 space-y-1 border-l border-brand-500/15 pl-4">
                        {item.children.map((child) => {
                          const exactMatch = child.path === location.pathname;
                          const rememberedPath = lastVisitedSidebarSubmenu[item.path];
                          const active = exactMatch || (!item.children.some((entry) => entry.path === location.pathname) && rememberedPath === child.path && pathBelongsToItem(location.pathname, item.path));
                          return (
                            <SidebarNavItem
                              key={child.path}
                              icon={"icon" in child ? child.icon : item.icon}
                              label={child.label}
                              to={child.path}
                              active={active}
                              onClick={() => rememberSidebarSubmenu(item.path, child.path)}
                            />
                          );
                        })}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <SidebarNavItem icon={item.icon} label={item.label} to={item.path} collapsed={sidebarCollapsed} />
                )}
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
  );
}
