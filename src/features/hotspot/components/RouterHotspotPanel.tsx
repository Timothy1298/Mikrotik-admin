import { useMemo, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { InlineError } from "@/components/feedback/InlineError";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import {
  useCreateHotspotUser,
  useDeleteHotspotUser,
  useDisconnectSession,
  useGenerateVouchers,
  useHotspotProfiles,
  useHotspotSessions,
  useHotspotUsers,
  useUpdateHotspotUser,
} from "@/features/hotspot/hooks/useHotspot";
import type { HotspotSession, HotspotUser, HotspotUserPayload } from "@/features/hotspot/types/hotspot.types";
import { CreateHotspotUserDialog } from "@/features/hotspot/components/CreateHotspotUserDialog";
import { DisconnectSessionDialog } from "@/features/hotspot/components/DisconnectSessionDialog";
import { EditHotspotUserDialog } from "@/features/hotspot/components/EditHotspotUserDialog";
import { GenerateVouchersDialog } from "@/features/hotspot/components/GenerateVouchersDialog";
import { HotspotSessionsTable } from "@/features/hotspot/components/HotspotSessionsTable";
import { HotspotUsersTable } from "@/features/hotspot/components/HotspotUsersTable";

export function RouterHotspotPanel({ routerId }: { routerId: string }) {
  const [tab, setTab] = useState<"users" | "sessions">("users");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<HotspotUser | null>(null);
  const [selectedSession, setSelectedSession] = useState<HotspotSession | null>(null);
  const createDisclosure = useDisclosure(false);
  const editDisclosure = useDisclosure(false);
  const vouchersDisclosure = useDisclosure(false);
  const disconnectDisclosure = useDisclosure(false);

  const needsProfiles = createDisclosure.open || editDisclosure.open || vouchersDisclosure.open;
  const usersQuery = useHotspotUsers(routerId, { page: 1, limit: 100, search }, { enabled: true });
  const sessionsQuery = useHotspotSessions(routerId, { enabled: tab === "sessions" });
  const profilesQuery = useHotspotProfiles(routerId, { enabled: needsProfiles });
  const createMutation = useCreateHotspotUser(routerId);
  const deleteMutation = useDeleteHotspotUser(routerId);
  const generateMutation = useGenerateVouchers(routerId);
  const disconnectMutation = useDisconnectSession(routerId);
  const updateMutation = useUpdateHotspotUser(routerId, selectedUser?.id || "");

  const onlineSessionsByUser = useMemo(() => {
    const map = new Map<string, HotspotSession>();
    for (const session of sessionsQuery.data || []) {
      if (!map.has(session.username)) {
        map.set(session.username, session);
      }
    }
    return map;
  }, [sessionsQuery.data]);

  const users = (usersQuery.data?.items || []).map((user) => ({
    ...user,
    online: user.online || onlineSessionsByUser.has(user.username),
  }));
  const sessions = sessionsQuery.data || [];
  const profiles = profilesQuery.data || [];

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Hotspot</CardTitle>
          <CardDescription>Manage hotspot credentials, generate vouchers, monitor active sessions, and control router profile access.</CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Users</p>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Active sessions</p>
            <Wifi className="h-4 w-4 text-success" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{sessions.length}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Defined profiles</p>
            <WifiOff className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{profiles.length}</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { label: "Users", value: "users" },
          { label: "Active Sessions", value: "sessions" },
        ]}
        value={tab}
        onChange={(value) => setTab(value as "users" | "sessions")}
      />

      {usersQuery.isError ? <InlineError message={usersQuery.error instanceof Error ? usersQuery.error.message : "Unable to load hotspot users"} /> : null}
      {sessionsQuery.isError ? <InlineError message={sessionsQuery.error instanceof Error ? sessionsQuery.error.message : "Unable to load hotspot sessions"} /> : null}

      {tab === "users" ? (
        <HotspotUsersTable
          rows={users}
          search={search}
          onSearchChange={setSearch}
          onAddUser={createDisclosure.onOpen}
          onGenerateVouchers={vouchersDisclosure.onOpen}
          onEditUser={(user) => {
            setSelectedUser(user);
            editDisclosure.onOpen();
          }}
          onDisconnectUserSession={(user) => {
            const session = onlineSessionsByUser.get(user.username) || null;
            setSelectedSession(session);
            disconnectDisclosure.onOpen();
          }}
          onDeleteUser={(user) => {
            if (!window.confirm(`Delete hotspot user ${user.username}?`)) return;
            deleteMutation.mutate(user.id);
          }}
          isLoading={usersQuery.isPending}
        />
      ) : (
        <HotspotSessionsTable
          rows={sessions}
          onDisconnect={(session) => {
            setSelectedSession(session);
            disconnectDisclosure.onOpen();
          }}
          isLoading={sessionsQuery.isPending}
        />
      )}

      <CreateHotspotUserDialog
        open={createDisclosure.open}
        loading={createMutation.isPending}
        profiles={profiles}
        onClose={createDisclosure.onClose}
        onConfirm={(payload) => createMutation.mutate(payload, { onSuccess: () => createDisclosure.onClose() })}
      />

      <EditHotspotUserDialog
        open={editDisclosure.open}
        loading={updateMutation.isPending}
        user={selectedUser}
        profiles={profiles}
        onClose={editDisclosure.onClose}
        onConfirm={(payload: HotspotUserPayload) => updateMutation.mutate(payload, { onSuccess: () => editDisclosure.onClose() })}
      />

      <GenerateVouchersDialog
        open={vouchersDisclosure.open}
        loading={generateMutation.isPending}
        profiles={profiles}
        onClose={vouchersDisclosure.onClose}
        onConfirm={(payload) => generateMutation.mutateAsync(payload)}
      />

      <DisconnectSessionDialog
        open={disconnectDisclosure.open}
        session={selectedSession}
        loading={disconnectMutation.isPending}
        onClose={disconnectDisclosure.onClose}
        onConfirm={() => {
          if (!selectedSession) return;
          disconnectMutation.mutate(selectedSession.sessionId, { onSuccess: () => disconnectDisclosure.onClose() });
        }}
      />
    </Card>
  );
}
