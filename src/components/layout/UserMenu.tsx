import { Link } from "react-router-dom";
import { LogOut, Settings, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { appRoutes } from "@/config/routes";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  if (!user) return null;

  return (
    <div className="group relative min-w-0">
      <button
        className="inline-flex h-10 max-w-[208px] min-w-0 items-center gap-2 rounded-lg border border-transparent px-2.5 text-left text-text-secondary transition-colors duration-200 hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        type="button"
      >
        <Avatar name={user.name} className="h-9 w-9 shrink-0" />
        <div className="hidden min-w-0 flex-1 text-left lg:block">
          <p className="truncate text-sm font-medium leading-5 text-text-primary">{user.name}</p>
          <p className="truncate text-xs leading-4 text-text-secondary">{user.email}</p>
        </div>
      </button>
      <div className="absolute right-0 z-30 mt-2 hidden min-w-64 rounded-2xl border border-background-border bg-background-panel p-3 shadow-panel group-focus-within:block group-hover:block">
        <div className="mb-3 rounded-xl border border-background-border bg-background-elevated p-3">
          <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
          <p className="truncate text-xs text-text-secondary">{user.email}</p>
          <Badge tone="info" className="mt-3">
            {user.role}
          </Badge>
        </div>
        <div className="space-y-1">
          <Link
            to={appRoutes.settings}
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-transparent px-3 text-left text-sm text-text-secondary transition hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary"
          >
            <UserCircle2 className="h-4 w-4" />
            Profile
          </Link>
          <Link
            to={appRoutes.settingsSecurity}
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-transparent px-3 text-left text-sm text-text-secondary transition hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-transparent px-3 text-left text-sm text-danger transition hover:border-danger/30 hover:bg-danger/10"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
