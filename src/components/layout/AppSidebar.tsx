import { LogOut, Shield } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { useUIStore } from "@/app/store/ui.store";
import { navigationItems } from "@/config/navigation";
import { hasPermission } from "@/lib/permissions/guards";
import { Button } from "@/components/ui/Button";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { SidebarSection } from "@/components/layout/SidebarSection";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const visibleItems = navigationItems.filter((item) => hasPermission(user, item.permission));

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
                <SidebarNavItem icon={item.icon} label={item.label} to={item.path} collapsed={sidebarCollapsed} />
                {!sidebarCollapsed && "children" in item && item.children ? (
                  <div className="ml-6 space-y-1 border-l border-brand-500/15 pl-4">
                    {item.children.map((child) => (
                      <SidebarNavItem key={child.path} icon={"icon" in child ? child.icon : item.icon} label={child.label} to={child.path} />
                    ))}
                  </div>
                ) : null}
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
