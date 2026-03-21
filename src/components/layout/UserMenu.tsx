import { Link } from "react-router-dom";
import { LogOut, Settings, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { appRoutes } from "@/config/routes";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  if (!user) return null;

  return (
    <div className="group relative">
      <Button variant="ghost" className="h-auto gap-3 rounded-xl px-3 py-2">
        <Avatar name={user.name} />
        <div className="hidden text-left lg:block">
          <p className="text-sm font-medium text-text-primary">{user.name}</p>
          <p className="text-xs text-text-secondary">{user.email}</p>
        </div>
      </Button>
      <div className="absolute right-0 z-30 mt-2 hidden min-w-64 rounded-2xl border border-background-border bg-background-panel p-3 shadow-panel group-focus-within:block group-hover:block">
        <div className="mb-3 rounded-xl border border-background-border bg-background-elevated p-3">
          <p className="text-sm font-medium text-text-primary">{user.name}</p>
          <p className="text-xs text-text-secondary">{user.email}</p>
          <Badge tone="info" className="mt-3">
            {user.role}
          </Badge>
        </div>
        <div className="space-y-1">
          <Link
            to={appRoutes.settings}
            className="flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-left text-sm text-text-secondary transition hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary"
          >
            <UserCircle2 className="h-4 w-4" />
            Profile
          </Link>
          <Link
            to={appRoutes.settingsSecurity}
            className="flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-left text-sm text-text-secondary transition hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            className="flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-left text-sm text-danger transition hover:border-danger/30 hover:bg-danger/10"
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
