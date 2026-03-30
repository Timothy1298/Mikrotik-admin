import { useMemo, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { InlineError } from "@/components/feedback/InlineError";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import {
  useCreateHotspotUser,
  useCreateHotspotProfile,
  useDeleteHotspotUser,
  useDisconnectSession,
  useGenerateVouchers,
  useHotspotProfiles,
  useHotspotSessions,
  useHotspotUsers,
  useHotspotVouchers,
  useRevokeHotspotVoucher,
  useUpdateHotspotProfile,
  useUpdateHotspotUser,
} from "@/features/hotspot/hooks/useHotspot";
import type { HotspotProfile, HotspotSession, HotspotUser, HotspotUserPayload } from "@/features/hotspot/types/hotspot.types";
import { CreateHotspotUserDialog } from "@/features/hotspot/components/CreateHotspotUserDialog";
import { DisconnectSessionDialog } from "@/features/hotspot/components/DisconnectSessionDialog";
import { EditHotspotUserDialog } from "@/features/hotspot/components/EditHotspotUserDialog";
import { EditHotspotProfileDialog } from "@/features/hotspot/components/EditHotspotProfileDialog";
import { GenerateVouchersDialog } from "@/features/hotspot/components/GenerateVouchersDialog";
import { HotspotProfilesTable } from "@/features/hotspot/components/HotspotProfilesTable";
import { HotspotSessionsTable } from "@/features/hotspot/components/HotspotSessionsTable";
import { HotspotUsersTable } from "@/features/hotspot/components/HotspotUsersTable";
import { HotspotVouchersTable } from "@/features/hotspot/components/HotspotVouchersTable";
import { SubscriberBandwidthDialog } from "@/features/queues/components/SubscriberBandwidthDialog";
import { useCreateQueue, useQueues, useUpdateQueue } from "@/features/queues/hooks/useQueues";
import type { RouterQueue } from "@/features/queues/types/queue.types";

function normalizeTarget(value: string | null | undefined) {
  if (!value) return "";
  return value.includes("/") ? value : `${value}/32`;
}

function buildOverrideQueueName(prefix: string, sourceName: string, target: string) {
  const normalizedTarget = normalizeTarget(target).replace(/[^\w-]/g, "-");
  return `${prefix}-${sourceName}-${normalizedTarget}`.replace(/[^\w-]/g, "-").replace(/-+/g, "-").slice(0, 60);
}

export function RouterHotspotPanel({ routerId }: { routerId: string }) {
  const [tab, setTab] = useState<"users" | "sessions" | "profiles" | "vouchers">("users");
  const [search, setSearch] = useState("");
  const [voucherStatus, setVoucherStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState<HotspotUser | null>(null);
  const [selectedSession, setSelectedSession] = useState<HotspotSession | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<HotspotProfile | null>(null);
  const [selectedBandwidthUser, setSelectedBandwidthUser] = useState<HotspotUser | null>(null);
  const [selectedBandwidthSessionRecord, setSelectedBandwidthSessionRecord] = useState<HotspotSession | null>(null);
  const createDisclosure = useDisclosure(false);
  const editDisclosure = useDisclosure(false);
  const vouchersDisclosure = useDisclosure(false);
  const disconnectDisclosure = useDisclosure(false);
  const profileDisclosure = useDisclosure(false);
  const bandwidthDisclosure = useDisclosure(false);
  const createProfileDisclosure = useDisclosure(false);

  const needsProfiles = tab === "profiles" || createDisclosure.open || editDisclosure.open || vouchersDisclosure.open || profileDisclosure.open || bandwidthDisclosure.open;
  const usersQuery = useHotspotUsers(routerId, { page: 1, limit: 100, search }, { enabled: true });
  const sessionsQuery = useHotspotSessions(routerId, { enabled: true });
  const profilesQuery = useHotspotProfiles(routerId, { enabled: needsProfiles });
  const vouchersQuery = useHotspotVouchers(routerId, { page: 1, limit: 100, status: voucherStatus || undefined }, { enabled: true });
  const createMutation = useCreateHotspotUser(routerId);
  const createProfileMutation = useCreateHotspotProfile(routerId);
  const deleteMutation = useDeleteHotspotUser(routerId);
  const generateMutation = useGenerateVouchers(routerId);
  const disconnectMutation = useDisconnectSession(routerId);
  const revokeVoucherMutation = useRevokeHotspotVoucher(routerId);
  const updateMutation = useUpdateHotspotUser(routerId, selectedUser?.id || "");
  const updateBandwidthUserMutation = useUpdateHotspotUser(routerId, selectedBandwidthUser?.id || "");
  const updateProfileMutation = useUpdateHotspotProfile(routerId, selectedProfile?.id || selectedProfile?.name || "");
  const queuesQuery = useQueues(routerId);
  const createQueueMutation = useCreateQueue(routerId);

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
  const vouchers = vouchersQuery.data?.items || [];
  const queues = queuesQuery.data?.items || [];
  const usersByUsername = useMemo(() => new Map(users.map((user) => [user.username, user])), [users]);
  const profileRateLimits = useMemo(() => new Map(profiles.map((profile) => [profile.name, profile.rateLimit || ""])), [profiles]);
  const controlModeByUserId = useMemo<Record<string, "profile" | "override">>(() => {
    const entries: Record<string, "profile" | "override"> = Object.fromEntries((usersQuery.data?.items || []).map((user) => [user.id, "profile" as const]));
    for (const user of usersQuery.data?.items || []) {
      const session = onlineSessionsByUser.get(user.username) || null;
      const target = normalizeTarget(session?.ip);
      const hasOverride = queues.some((queue) => {
        if (queue.isDynamic) return false;
        if (queue.overrideSourceType === "hotspot_user" && queue.overrideSourceId === user.id) return true;
        return Boolean(target) && normalizeTarget(queue.target) === target;
      });
      if (hasOverride) {
        entries[user.id] = "override";
      }
    }
    return entries;
  }, [onlineSessionsByUser, queues, usersQuery.data?.items]);
  const controlModeBySessionId = useMemo<Record<string, "profile" | "override">>(() => {
    const entries: Record<string, "profile" | "override"> = {};
    for (const session of sessions) {
      const linkedUser = usersByUsername.get(session.username) || null;
      const target = normalizeTarget(session.ip);
      const hasOverride = queues.some((queue) => {
        if (queue.isDynamic) return false;
        if (linkedUser && queue.overrideSourceType === "hotspot_user" && queue.overrideSourceId === linkedUser.id) return true;
        return Boolean(target) && normalizeTarget(queue.target) === target;
      });
      entries[session.id] = hasOverride ? "override" : "profile";
    }
    return entries;
  }, [queues, sessions, usersByUsername]);
  const canSwitchProfileBySessionId = useMemo<Record<string, boolean>>(() => (
    Object.fromEntries(sessions.map((session) => [session.id, usersByUsername.has(session.username)]))
  ), [sessions, usersByUsername]);
  const selectedBandwidthManagedUser = selectedBandwidthUser || (selectedBandwidthSessionRecord ? usersByUsername.get(selectedBandwidthSessionRecord.username) || null : null);
  const selectedBandwidthSession = selectedBandwidthSessionRecord || (selectedBandwidthUser ? onlineSessionsByUser.get(selectedBandwidthUser.username) || null : null);
  const selectedBandwidthTarget = normalizeTarget(selectedBandwidthSession?.ip);
  const selectedBandwidthOverride = useMemo<RouterQueue | null>(() => {
    if (!selectedBandwidthTarget) return null;
    return queues.find((queue) => queue.isActive && !queue.isDynamic && normalizeTarget(queue.target) === selectedBandwidthTarget) || null;
  }, [queues, selectedBandwidthTarget]);
  const selectedBandwidthProfileName = selectedBandwidthManagedUser?.profile || selectedBandwidthSession?.profile || "default";
  const selectedBandwidthProfile = profiles.find((profile) => profile.name === selectedBandwidthProfileName) || null;
  const updateBandwidthProfileMutation = useUpdateHotspotProfile(routerId, selectedBandwidthProfile?.id || selectedBandwidthProfile?.name || "");
  const updateQueueMutation = useUpdateQueue(routerId, selectedBandwidthOverride?.id || "");

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Hotspot</CardTitle>
          <CardDescription>Manage hotspot credentials, generate vouchers, monitor active sessions, and control router profile access.</CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Vouchers</p>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{vouchers.length}</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { label: "Users", value: "users" },
          { label: "Active Sessions", value: "sessions" },
          { label: "Profiles", value: "profiles" },
          { label: "Vouchers", value: "vouchers" },
        ]}
        value={tab}
        onChange={(value) => setTab(value as "users" | "sessions" | "profiles" | "vouchers")}
      />

      {usersQuery.isError ? <InlineError message={usersQuery.error instanceof Error ? usersQuery.error.message : "Unable to load hotspot users"} /> : null}
      {sessionsQuery.isError ? <InlineError message={sessionsQuery.error instanceof Error ? sessionsQuery.error.message : "Unable to load hotspot sessions"} /> : null}
      {profilesQuery.isError ? <InlineError message={profilesQuery.error instanceof Error ? profilesQuery.error.message : "Unable to load hotspot profiles"} /> : null}
      {vouchersQuery.isError ? <InlineError message={vouchersQuery.error instanceof Error ? vouchersQuery.error.message : "Unable to load hotspot vouchers"} /> : null}

      {tab === "users" ? (
        <HotspotUsersTable
          rows={users}
          search={search}
          controlModeByUserId={controlModeByUserId}
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
      ) : tab === "sessions" ? (
        <HotspotSessionsTable
          rows={sessions}
          controlModeBySessionId={controlModeBySessionId}
          canSwitchProfileBySessionId={canSwitchProfileBySessionId}
          onAdjustBandwidth={(session) => {
            setSelectedBandwidthUser(null);
            setSelectedBandwidthSessionRecord(session);
            bandwidthDisclosure.onOpen();
          }}
          onSwitchProfile={(session) => {
            setSelectedBandwidthUser(null);
            setSelectedBandwidthSessionRecord(session);
            bandwidthDisclosure.onOpen();
          }}
          onDisconnect={(session) => {
            setSelectedSession(session);
            disconnectDisclosure.onOpen();
          }}
          isLoading={sessionsQuery.isPending}
        />
      ) : tab === "profiles" ? (
        <HotspotProfilesTable
          rows={profiles}
          onAddProfile={() => {
            setSelectedProfile(null);
            createProfileDisclosure.onOpen();
          }}
          onEditProfile={(profile) => {
            setSelectedProfile(profile);
            profileDisclosure.onOpen();
          }}
          isLoading={profilesQuery.isPending}
        />
      ) : (
        <HotspotVouchersTable
          rows={vouchers}
          status={voucherStatus}
          onStatusChange={setVoucherStatus}
          onRevoke={(voucher) => {
            if (!window.confirm(`Revoke voucher ${voucher.username}?`)) return;
            revokeVoucherMutation.mutate(voucher.id);
          }}
          isLoading={vouchersQuery.isPending}
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

      <EditHotspotProfileDialog
        open={profileDisclosure.open}
        profile={selectedProfile}
        loading={updateProfileMutation.isPending}
        onClose={profileDisclosure.onClose}
        existingProfiles={profiles}
        onConfirm={(payload) => updateProfileMutation.mutate(payload, { onSuccess: () => profileDisclosure.onClose() })}
      />

      <EditHotspotProfileDialog
        open={createProfileDisclosure.open}
        profile={null}
        loading={createProfileMutation.isPending}
        onClose={createProfileDisclosure.onClose}
        existingProfiles={profiles}
        onConfirm={(payload) => createProfileMutation.mutate(payload, { onSuccess: () => createProfileDisclosure.onClose() })}
      />

      <SubscriberBandwidthDialog
        open={bandwidthDisclosure.open}
        title="Adjust hotspot client bandwidth"
        description="Choose whether to move this user to another hotspot profile, update the current source profile, or place a dedicated static queue override on the live session IP."
        subscriberLabel={selectedBandwidthSession ? `${selectedBandwidthSession.username}${selectedBandwidthSession.ip ? ` • ${selectedBandwidthSession.ip}` : ""}` : selectedBandwidthManagedUser ? selectedBandwidthManagedUser.username : "No hotspot user selected"}
        currentProfileName={selectedBandwidthProfileName}
        currentProfileRateLimit={profileRateLimits.get(selectedBandwidthProfileName) || ""}
        profiles={profiles.map((profile) => ({
          label: profile.rateLimit ? `${profile.name} • ${profile.rateLimit}` : `${profile.name} • Unlimited`,
          value: profile.name,
          rateLimit: profile.rateLimit,
        }))}
        overrideTarget={selectedBandwidthTarget || null}
        existingOverride={selectedBandwidthOverride}
        disableSwitchProfile={!selectedBandwidthManagedUser}
        disableEditCurrentProfile={!selectedBandwidthManagedUser || !selectedBandwidthProfile}
        switchDisabledReason={!selectedBandwidthManagedUser ? "This active session is not linked to a saved hotspot user, so profile switching is unavailable. You can still create a dedicated override queue." : undefined}
        profileDisabledReason={!selectedBandwidthManagedUser || !selectedBandwidthProfile ? "This active session does not expose an editable source profile in the synced hotspot user list yet." : undefined}
        switchLoading={updateBandwidthUserMutation.isPending}
        profileLoading={updateBandwidthProfileMutation.isPending}
        overrideLoading={createQueueMutation.isPending || updateQueueMutation.isPending}
        onClose={() => {
          setSelectedBandwidthUser(null);
          setSelectedBandwidthSessionRecord(null);
          bandwidthDisclosure.onClose();
        }}
        onSwitchProfile={(profileName) => {
          if (!selectedBandwidthManagedUser) return;
          updateBandwidthUserMutation.mutate({
            username: selectedBandwidthManagedUser.username,
            profile: profileName,
            dataLimitBytes: selectedBandwidthManagedUser.dataLimitBytes,
            timeLimitSeconds: selectedBandwidthManagedUser.timeLimitSeconds,
            expiresAt: selectedBandwidthManagedUser.expiresAt,
            comment: selectedBandwidthManagedUser.comment,
            isActive: selectedBandwidthManagedUser.isActive,
          }, { onSuccess: () => bandwidthDisclosure.onClose() });
        }}
        onUpdateCurrentProfile={(rateLimit) => {
          if (!selectedBandwidthProfile) return;
          updateBandwidthProfileMutation.mutate({
            name: selectedBandwidthProfile.name,
            rateLimit,
            sessionTimeout: selectedBandwidthProfile.sessionTimeout,
            idleTimeout: selectedBandwidthProfile.idleTimeout,
            comment: selectedBandwidthProfile.comment || "",
          }, { onSuccess: () => bandwidthDisclosure.onClose() });
        }}
        onApplyOverride={({ target, maxDownloadKbps, maxUploadKbps }) => {
          if (!selectedBandwidthSession && !selectedBandwidthManagedUser) return;
          const sourceName = selectedBandwidthManagedUser?.username || selectedBandwidthSession?.username || "hotspot-session";
          const payload = {
            name: buildOverrideQueueName("override-hotspot", sourceName, target),
            target,
            maxDownloadKbps,
            maxUploadKbps,
            comment: `Bandwidth override for hotspot session ${sourceName}`,
            overrideSourceType: selectedBandwidthManagedUser ? "hotspot_user" as const : "manual" as const,
            overrideSourceId: selectedBandwidthManagedUser?.id,
            overrideSourceName: sourceName,
          };
          if (selectedBandwidthOverride) {
            updateQueueMutation.mutate(payload, { onSuccess: () => bandwidthDisclosure.onClose() });
            return;
          }
          createQueueMutation.mutate(payload, { onSuccess: () => bandwidthDisclosure.onClose() });
        }}
      />
    </Card>
  );
}
