import { useMemo, useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { useUIStore } from "@/app/store/ui.store";
import { SearchInput } from "@/components/shared/SearchInput";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAdminNotifications, useAdminSearch, useMarkAdminNotificationRead, useMarkAllAdminNotificationsRead } from "@/features/admin-shell/hooks/useAdminShell";
import { useDebouncedSearch } from "@/hooks/api/useDebouncedSearch";
import { formatDateTime } from "@/lib/formatters/date";

export function AppTopbar() {
  const user = useAuthStore((state) => state.user);
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const debouncedSearch = useDebouncedSearch(search, 250);
  const searchQuery = useAdminSearch(debouncedSearch, true);
  const notificationsQuery = useAdminNotifications(true);
  const markReadMutation = useMarkAdminNotificationRead();
  const markAllMutation = useMarkAllAdminNotificationsRead();

  const groupedResults = useMemo(() => searchQuery.data || [], [searchQuery.data]);
  const unreadCount = notificationsQuery.data?.unreadCount || 0;

  return (
    <>
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
            <div className="relative hidden w-full max-w-[360px] lg:block">
              <SearchInput
                placeholder="Search users, routers, tickets..."
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search.trim().length >= 2 ? (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-full rounded-2xl border border-background-border bg-background-panel p-2 shadow-2xl">
                  {searchQuery.isPending ? (
                    <p className="px-3 py-4 text-sm text-text-secondary">Searching workspace…</p>
                  ) : groupedResults.length ? (
                    groupedResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSearch("");
                          navigate(item.href);
                        }}
                        className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-primary/10"
                      >
                        <p className="text-sm font-medium text-text-primary">{item.title}</p>
                        <p className="mt-1 text-xs text-text-secondary">{item.subtitle} · {item.meta}</p>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-4 text-sm text-text-secondary">No workspace matches found.</p>
                  )}
                </div>
              ) : null}
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => setShowNotifications(true)}>
              <Bell className="h-4 w-4" />
              {unreadCount ? (
                <span className="absolute right-1 top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <Drawer open={showNotifications} title="Notifications" onClose={() => setShowNotifications(false)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-text-primary">Operations inbox</p>
              <p className="text-sm text-text-secondary">Incident, support, and router events that still need attention.</p>
            </div>
            <Button variant="outline" size="sm" isLoading={markAllMutation.isPending} onClick={() => void markAllMutation.mutateAsync()}>
              Mark all read
            </Button>
          </div>
          <div className="space-y-3">
            {notificationsQuery.isPending ? (
              <p className="text-sm text-text-secondary">Loading notifications…</p>
            ) : notificationsQuery.data?.items.length ? (
              notificationsQuery.data.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    void markReadMutation.mutateAsync(item.id).catch(() => undefined);
                    setShowNotifications(false);
                    navigate(item.href);
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition ${item.read ? "border-background-border bg-background-elevated/40" : "border-primary/20 bg-primary/5"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-text-primary">{item.title}</p>
                    <span className="text-xs text-text-muted">{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{item.body}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-muted">{item.category}</p>
                </button>
              ))
            ) : (
              <p className="rounded-2xl border border-background-border bg-background-elevated/40 p-4 text-sm text-text-secondary">No pending notifications right now.</p>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}
