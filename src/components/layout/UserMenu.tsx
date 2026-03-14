import { LogOut, Settings, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  if (!user) return null;

  return (
    <div className="group relative">
      <Button variant="ghost" className="h-auto gap-3 rounded-2xl px-2 py-2">
        <Avatar name={user.name} />
        <div className="hidden text-left lg:block">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </Button>
      <div className="absolute right-0 z-30 mt-2 hidden min-w-64 rounded-3xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-3 group-hover:block">
        <div className="mb-3 rounded-2xl border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-3">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
          <Badge tone="info" className="mt-3">{user.role}</Badge>
        </div>
        <div className="space-y-1">
          <button className="flex w-full items-center gap-2 rounded-2xl border border-transparent px-3 py-2 text-left text-sm text-slate-200 transition hover:border-brand-500/15 hover:bg-[rgba(37,99,235,0.08)]"><UserCircle2 className="h-4 w-4" />Profile</button>
          <button className="flex w-full items-center gap-2 rounded-2xl border border-transparent px-3 py-2 text-left text-sm text-slate-200 transition hover:border-brand-500/15 hover:bg-[rgba(37,99,235,0.08)]"><Settings className="h-4 w-4" />Settings</button>
          <button className="flex w-full items-center gap-2 rounded-2xl border border-transparent px-3 py-2 text-left text-sm text-danger transition hover:border-danger/30 hover:bg-danger/10" onClick={logout}><LogOut className="h-4 w-4" />Logout</button>
        </div>
      </div>
    </div>
  );
}
