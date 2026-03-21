import { Bell, Menu, Monitor, Search } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { useUIStore } from "@/app/store/ui.store";
import { SearchInput } from "@/components/shared/SearchInput";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "@/components/layout/UserMenu";

export function AppTopbar() {
  const user = useAuthStore((state) => state.user);
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);

  return (
    <header className="sticky top-0 z-30 border-b border-background-border bg-background-main/95 backdrop-blur">
      <div className="flex min-h-[76px] w-full items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="xl:hidden" onClick={toggleMobileSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-text-primary">
              Welcome back{user ? `, ${user.name}` : ""}
            </p>
            <p className="truncate text-xs text-text-secondary">
              Enterprise control center for router, VPN, and operator workflows.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5">
          <div className="hidden min-w-[220px] max-w-md flex-1 lg:block">
            <SearchInput
              placeholder="Search users, routers, tickets, logs..."
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <Monitor className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
