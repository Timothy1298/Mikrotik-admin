import { useMemo, useState } from "react";
import { ShieldCheck, Users, Wifi } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import {
  useCreatePppoeProfile,
  useCreatePppoeSecret,
  useDeletePppoeProfile,
  useDeletePppoeSecret,
  useDisconnectPppoeSession,
  usePppoeProfileOptions,
  usePppoeProfiles,
  usePppoeSecrets,
  usePppoeSessions,
  useUpdatePppoeProfile,
  useUpdatePppoeSecret,
} from "@/features/pppoe/hooks/usePppoe";
import type { PppoeProfile, PppoeSecret, PppoeSecretPayload, PppoeSession } from "@/features/pppoe/types/pppoe.types";
import { CreatePppoeProfileDialog } from "@/features/pppoe/components/CreatePppoeProfileDialog";
import { CreatePppoeSecretDialog } from "@/features/pppoe/components/CreatePppoeSecretDialog";
import { DisconnectPppoeSessionDialog } from "@/features/pppoe/components/DisconnectPppoeSessionDialog";
import { EditPppoeSecretDialog } from "@/features/pppoe/components/EditPppoeSecretDialog";
import { PppoeProfilesTable } from "@/features/pppoe/components/PppoeProfilesTable";
import { PppoeSecretsTable } from "@/features/pppoe/components/PppoeSecretsTable";
import { PppoeSessionsTable } from "@/features/pppoe/components/PppoeSessionsTable";
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

function resolveOverrideTarget(subscriber: PppoeSecret | null, session: PppoeSession | null) {
  if (session?.address) return normalizeTarget(session.address);
  if (subscriber?.remoteAddress && /^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/.test(subscriber.remoteAddress.trim())) {
    return normalizeTarget(subscriber.remoteAddress.trim());
  }
  return "";
}

export function RouterPppoePanel({ routerId }: { routerId: string }) {
  const [tab, setTab] = useState<"subscribers" | "sessions" | "profiles">("subscribers");
  const [search, setSearch] = useState("");
  const [selectedSubscriber, setSelectedSubscriber] = useState<PppoeSecret | null>(null);
  const [selectedSession, setSelectedSession] = useState<PppoeSession | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<PppoeProfile | null>(null);
  const [selectedBandwidthSubscriber, setSelectedBandwidthSubscriber] = useState<PppoeSecret | null>(null);
  const [selectedBandwidthSessionRecord, setSelectedBandwidthSessionRecord] = useState<PppoeSession | null>(null);
  const createSubscriberDisclosure = useDisclosure(false);
  const editSubscriberDisclosure = useDisclosure(false);
  const createProfileDisclosure = useDisclosure(false);
  const disconnectDisclosure = useDisclosure(false);
  const bandwidthDisclosure = useDisclosure(false);

  const needsProfiles = tab === "profiles" || createSubscriberDisclosure.open || editSubscriberDisclosure.open || createProfileDisclosure.open || bandwidthDisclosure.open;
  const secretsQuery = usePppoeSecrets(routerId, { page: 1, limit: 100, search }, { enabled: tab === "subscribers" || editSubscriberDisclosure.open });
  const sessionsQuery = usePppoeSessions(routerId, { enabled: tab === "sessions" });
  const profilesQuery = usePppoeProfiles(routerId, { enabled: needsProfiles });
  const profileOptionsQuery = usePppoeProfileOptions(routerId, { enabled: createProfileDisclosure.open });
  const createSecretMutation = useCreatePppoeSecret(routerId);
  const updateSecretMutation = useUpdatePppoeSecret(routerId, selectedSubscriber?.id || "");
  const updateBandwidthSecretMutation = useUpdatePppoeSecret(routerId, selectedBandwidthSubscriber?.id || "");
  const deleteSecretMutation = useDeletePppoeSecret(routerId);
  const disconnectMutation = useDisconnectPppoeSession(routerId);
  const createProfileMutation = useCreatePppoeProfile(routerId);
  const updateProfileMutation = useUpdatePppoeProfile(routerId, selectedProfile?.id || selectedProfile?.name || "");
  const deleteProfileMutation = useDeletePppoeProfile(routerId);
  const queuesQuery = useQueues(routerId);
  const createQueueMutation = useCreateQueue(routerId);

  const activeSessionsByName = useMemo(() => {
    const map = new Map<string, PppoeSession>();
    for (const session of sessionsQuery.data || []) {
      if (!map.has(session.name)) {
        map.set(session.name, session);
      }
    }
    return map;
  }, [sessionsQuery.data]);

  const subscribers = useMemo(() => (secretsQuery.data?.items || []).map((item) => ({
    ...item,
    online: item.online || activeSessionsByName.has(item.name),
  })), [activeSessionsByName, secretsQuery.data?.items]);
  const sessions = useMemo(() => sessionsQuery.data || [], [sessionsQuery.data]);
  const profiles = useMemo(() => profilesQuery.data || [], [profilesQuery.data]);
  const queues = useMemo(() => queuesQuery.data?.items || [], [queuesQuery.data?.items]);
  const subscribersByName = useMemo(() => new Map(subscribers.map((subscriber) => [subscriber.name, subscriber])), [subscribers]);
  const controlModeBySecretId = useMemo<Record<string, "profile" | "override">>(() => {
    const entries: Record<string, "profile" | "override"> = Object.fromEntries(subscribers.map((subscriber) => [subscriber.id, "profile" as const]));
    for (const subscriber of subscribers) {
      const session = activeSessionsByName.get(subscriber.name) || null;
      const target = resolveOverrideTarget(subscriber, session);
      const hasOverride = queues.some((queue) => {
        if (queue.isDynamic) return false;
        if (queue.overrideSourceType === "pppoe_secret" && queue.overrideSourceId === subscriber.id) return true;
        return Boolean(target) && normalizeTarget(queue.target) === target;
      });
      if (hasOverride) {
        entries[subscriber.id] = "override";
      }
    }
    return entries;
  }, [activeSessionsByName, queues, subscribers]);
  const controlModeBySessionId = useMemo<Record<string, "profile" | "override">>(() => {
    const entries: Record<string, "profile" | "override"> = {};
    for (const session of sessions) {
      const linkedSubscriber = subscribersByName.get(session.name) || null;
      const target = resolveOverrideTarget(linkedSubscriber, session);
      const hasOverride = queues.some((queue) => {
        if (queue.isDynamic) return false;
        if (linkedSubscriber && queue.overrideSourceType === "pppoe_secret" && queue.overrideSourceId === linkedSubscriber.id) return true;
        return Boolean(target) && normalizeTarget(queue.target) === target;
      });
      entries[session.id] = hasOverride ? "override" : "profile";
    }
    return entries;
  }, [queues, sessions, subscribersByName]);
  const canSwitchProfileBySessionId = useMemo<Record<string, boolean>>(() => (
    Object.fromEntries(sessions.map((session) => [session.id, subscribersByName.has(session.name)]))
  ), [sessions, subscribersByName]);
  const selectedBandwidthResolvedSubscriber = selectedBandwidthSubscriber || (selectedBandwidthSessionRecord ? subscribersByName.get(selectedBandwidthSessionRecord.name) || null : null);
  const selectedBandwidthSession = selectedBandwidthSessionRecord || (selectedBandwidthSubscriber ? activeSessionsByName.get(selectedBandwidthSubscriber.name) || null : null);
  const selectedBandwidthProfileName = selectedBandwidthResolvedSubscriber?.profile || "default";
  const selectedBandwidthProfile = profiles.find((profile) => profile.name === selectedBandwidthProfileName) || null;
  const selectedBandwidthTarget = resolveOverrideTarget(selectedBandwidthResolvedSubscriber, selectedBandwidthSession);
  const selectedBandwidthOverride = useMemo<RouterQueue | null>(() => {
    if (!selectedBandwidthTarget) return null;
    return queues.find((queue) => queue.isActive && !queue.isDynamic && normalizeTarget(queue.target) === selectedBandwidthTarget) || null;
  }, [queues, selectedBandwidthTarget]);
  const updateBandwidthProfileMutation = useUpdatePppoeProfile(routerId, selectedBandwidthProfile?.id || selectedBandwidthProfile?.name || "");
  const updateQueueMutation = useUpdateQueue(routerId, selectedBandwidthOverride?.id || "");

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>PPPoE</CardTitle>
          <CardDescription>Manage router-side PPPoE subscribers, active sessions, profile assignment, and access templates without mixing them with platform account owners.</CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Subscribers</p>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{subscribers.length}</p>
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
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Profiles</p>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{profiles.length}</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { label: "Subscribers", value: "subscribers" },
          { label: "Active Sessions", value: "sessions" },
          { label: "Profiles", value: "profiles" },
        ]}
        value={tab}
        onChange={(value) => setTab(value as "subscribers" | "sessions" | "profiles")}
      />

      {secretsQuery.isError ? <InlineError message={secretsQuery.error instanceof Error ? secretsQuery.error.message : "Unable to load PPPoE subscribers"} /> : null}
      {sessionsQuery.isError ? <InlineError message={sessionsQuery.error instanceof Error ? sessionsQuery.error.message : "Unable to load PPPoE sessions"} /> : null}
      {profilesQuery.isError ? <InlineError message={profilesQuery.error instanceof Error ? profilesQuery.error.message : "Unable to load PPPoE profiles"} /> : null}
      {profileOptionsQuery.isError ? <InlineError message={profileOptionsQuery.error instanceof Error ? profileOptionsQuery.error.message : "Unable to load PPPoE profile options"} /> : null}

      {tab === "subscribers" ? (
        <PppoeSecretsTable
          rows={subscribers}
          search={search}
          controlModeBySecretId={controlModeBySecretId}
          onSearchChange={setSearch}
          onAddSubscriber={createSubscriberDisclosure.onOpen}
          onEdit={(subscriber) => {
            setSelectedSubscriber(subscriber);
            editSubscriberDisclosure.onOpen();
          }}
          onDelete={(subscriber) => {
            if (!window.confirm(`Delete PPPoE subscriber ${subscriber.name}?`)) return;
            deleteSecretMutation.mutate(subscriber.id);
          }}
          isLoading={secretsQuery.isPending}
        />
      ) : tab === "sessions" ? (
        <PppoeSessionsTable
          rows={sessions}
          controlModeBySessionId={controlModeBySessionId}
          canSwitchProfileBySessionId={canSwitchProfileBySessionId}
          onAdjustBandwidth={(session) => {
            setSelectedBandwidthSubscriber(null);
            setSelectedBandwidthSessionRecord(session);
            bandwidthDisclosure.onOpen();
          }}
          onSwitchProfile={(session) => {
            setSelectedBandwidthSubscriber(null);
            setSelectedBandwidthSessionRecord(session);
            bandwidthDisclosure.onOpen();
          }}
          onDisconnect={(session) => {
            setSelectedSession(session);
            disconnectDisclosure.onOpen();
          }}
          isLoading={sessionsQuery.isPending}
        />
      ) : (
        <PppoeProfilesTable
          rows={profiles}
          onAddProfile={() => {
            setSelectedProfile(null);
            createProfileDisclosure.onOpen();
          }}
          onEditProfile={(profile) => {
            setSelectedProfile(profile);
            createProfileDisclosure.onOpen();
          }}
          onDeleteProfile={(profile) => {
            if (!window.confirm(`Delete PPPoE profile ${profile.name}?`)) return;
            deleteProfileMutation.mutate(profile.id || profile.name);
          }}
          isLoading={profilesQuery.isPending}
        />
      )}

      <CreatePppoeSecretDialog
        open={createSubscriberDisclosure.open}
        loading={createSecretMutation.isPending}
        profiles={profiles}
        onClose={createSubscriberDisclosure.onClose}
        onConfirm={(payload) => createSecretMutation.mutate(payload, { onSuccess: () => createSubscriberDisclosure.onClose() })}
      />

      <EditPppoeSecretDialog
        open={editSubscriberDisclosure.open}
        loading={updateSecretMutation.isPending}
        subscriber={selectedSubscriber}
        profiles={profiles}
        onClose={editSubscriberDisclosure.onClose}
        onConfirm={(payload: PppoeSecretPayload) => updateSecretMutation.mutate(payload, { onSuccess: () => editSubscriberDisclosure.onClose() })}
      />

      <CreatePppoeProfileDialog
        open={createProfileDisclosure.open}
        loading={createProfileMutation.isPending || updateProfileMutation.isPending}
        initialProfile={selectedProfile}
        existingProfiles={profiles}
        localAddressOptions={profileOptionsQuery.data?.localAddressOptions || []}
        remoteAddressOptions={profileOptionsQuery.data?.remoteAddressOptions || []}
        onClose={createProfileDisclosure.onClose}
        onConfirm={(payload) => {
          if (selectedProfile) {
            updateProfileMutation.mutate(payload, { onSuccess: () => createProfileDisclosure.onClose() });
            return;
          }
          createProfileMutation.mutate(payload, { onSuccess: () => createProfileDisclosure.onClose() });
        }}
      />

      <DisconnectPppoeSessionDialog
        open={disconnectDisclosure.open}
        session={selectedSession}
        loading={disconnectMutation.isPending}
        onClose={disconnectDisclosure.onClose}
        onConfirm={() => {
          if (!selectedSession) return;
          disconnectMutation.mutate(selectedSession.sessionId, { onSuccess: () => disconnectDisclosure.onClose() });
        }}
      />

      <SubscriberBandwidthDialog
        open={bandwidthDisclosure.open}
        title="Adjust PPPoE client bandwidth"
        description="Choose whether to move this subscriber to another PPPoE profile, update the current PPPoE source profile, or place a dedicated static queue override on the subscriber address."
        subscriberLabel={selectedBandwidthSession ? `${selectedBandwidthSession.name}${selectedBandwidthSession.address ? ` • ${selectedBandwidthSession.address}` : ""}` : selectedBandwidthResolvedSubscriber ? selectedBandwidthResolvedSubscriber.name : "No PPPoE subscriber selected"}
        currentProfileName={selectedBandwidthProfileName}
        currentProfileRateLimit={selectedBandwidthProfile?.rateLimit || ""}
        profiles={profiles.map((profile) => ({
          label: profile.rateLimit ? `${profile.name} • ${profile.rateLimit}` : `${profile.name} • Unlimited`,
          value: profile.name,
          rateLimit: profile.rateLimit,
        }))}
        overrideTarget={selectedBandwidthTarget || null}
        existingOverride={selectedBandwidthOverride}
        disableSwitchProfile={!selectedBandwidthResolvedSubscriber}
        disableEditCurrentProfile={!selectedBandwidthResolvedSubscriber || !selectedBandwidthProfile}
        switchDisabledReason={!selectedBandwidthResolvedSubscriber ? "This active session is not linked to a saved PPPoE subscriber, so profile switching is unavailable. You can still create a dedicated override queue." : undefined}
        profileDisabledReason={!selectedBandwidthResolvedSubscriber || !selectedBandwidthProfile ? "This active session does not expose an editable source profile in the synced PPPoE subscriber list yet." : undefined}
        switchLoading={updateBandwidthSecretMutation.isPending}
        profileLoading={updateBandwidthProfileMutation.isPending}
        overrideLoading={createQueueMutation.isPending || updateQueueMutation.isPending}
        onClose={() => {
          setSelectedBandwidthSubscriber(null);
          setSelectedBandwidthSessionRecord(null);
          bandwidthDisclosure.onClose();
        }}
        onSwitchProfile={(profileName) => {
          if (!selectedBandwidthResolvedSubscriber) return;
          updateBandwidthSecretMutation.mutate({
            name: selectedBandwidthResolvedSubscriber.name,
            profile: profileName,
            service: selectedBandwidthResolvedSubscriber.service,
            localAddress: selectedBandwidthResolvedSubscriber.localAddress,
            remoteAddress: selectedBandwidthResolvedSubscriber.remoteAddress,
            comment: selectedBandwidthResolvedSubscriber.comment,
            isDisabled: selectedBandwidthResolvedSubscriber.isDisabled,
          }, { onSuccess: () => bandwidthDisclosure.onClose() });
        }}
        onUpdateCurrentProfile={(rateLimit) => {
          if (!selectedBandwidthProfile) return;
          updateBandwidthProfileMutation.mutate({
            name: selectedBandwidthProfile.name,
            localAddress: selectedBandwidthProfile.localAddress,
            remoteAddress: selectedBandwidthProfile.remoteAddress,
            rateLimit,
            comment: selectedBandwidthProfile.comment || "",
          }, { onSuccess: () => bandwidthDisclosure.onClose() });
        }}
        onApplyOverride={({ target, maxDownloadKbps, maxUploadKbps }) => {
          if (!selectedBandwidthSession && !selectedBandwidthResolvedSubscriber) return;
          const sourceName = selectedBandwidthResolvedSubscriber?.name || selectedBandwidthSession?.name || "pppoe-session";
          const payload = {
            name: buildOverrideQueueName("override-pppoe", sourceName, target),
            target,
            maxDownloadKbps,
            maxUploadKbps,
            comment: `Bandwidth override for PPPoE session ${sourceName}`,
            overrideSourceType: selectedBandwidthResolvedSubscriber ? "pppoe_secret" as const : "manual" as const,
            overrideSourceId: selectedBandwidthResolvedSubscriber?.id,
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
