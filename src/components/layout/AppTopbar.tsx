import { Bell, Menu, Search } from "lucide-react";
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
      <div className="flex min-h-16 w-full items-center justify-between gap-4 px-4 md:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 xl:hidden" onClick={toggleMobileSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {user ? `${user.name}` : "Admin workspace"}
            </p>
            <p className="hidden truncate text-xs text-text-secondary lg:block">
              Router, VPN, billing, and operations control
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <div className="hidden w-full max-w-[280px] lg:block">
            <SearchInput
              placeholder="Search users, routers, tickets..."
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
