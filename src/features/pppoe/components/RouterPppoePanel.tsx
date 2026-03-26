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

export function RouterPppoePanel({ routerId }: { routerId: string }) {
  const [tab, setTab] = useState<"subscribers" | "sessions" | "profiles">("subscribers");
  const [search, setSearch] = useState("");
  const [selectedSubscriber, setSelectedSubscriber] = useState<PppoeSecret | null>(null);
  const [selectedSession, setSelectedSession] = useState<PppoeSession | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<PppoeProfile | null>(null);
  const createSubscriberDisclosure = useDisclosure(false);
  const editSubscriberDisclosure = useDisclosure(false);
  const createProfileDisclosure = useDisclosure(false);
  const disconnectDisclosure = useDisclosure(false);

  const needsProfiles = tab === "profiles" || createSubscriberDisclosure.open || editSubscriberDisclosure.open || createProfileDisclosure.open;
  const secretsQuery = usePppoeSecrets(routerId, { page: 1, limit: 100, search }, { enabled: tab === "subscribers" || editSubscriberDisclosure.open });
  const sessionsQuery = usePppoeSessions(routerId, { enabled: tab === "sessions" });
  const profilesQuery = usePppoeProfiles(routerId, { enabled: needsProfiles });
  const createSecretMutation = useCreatePppoeSecret(routerId);
  const updateSecretMutation = useUpdatePppoeSecret(routerId, selectedSubscriber?.id || "");
  const deleteSecretMutation = useDeletePppoeSecret(routerId);
  const disconnectMutation = useDisconnectPppoeSession(routerId);
  const createProfileMutation = useCreatePppoeProfile(routerId);
  const updateProfileMutation = useUpdatePppoeProfile(routerId, selectedProfile?.id || selectedProfile?.name || "");
  const deleteProfileMutation = useDeletePppoeProfile(routerId);

  const activeSessionsByName = useMemo(() => {
    const map = new Map<string, PppoeSession>();
    for (const session of sessionsQuery.data || []) {
      if (!map.has(session.name)) {
        map.set(session.name, session);
      }
    }
    return map;
  }, [sessionsQuery.data]);

  const subscribers = (secretsQuery.data?.items || []).map((item) => ({
    ...item,
    online: item.online || activeSessionsByName.has(item.name),
  }));
  const sessions = sessionsQuery.data || [];
  const profiles = profilesQuery.data || [];

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

      {tab === "subscribers" ? (
        <PppoeSecretsTable
          rows={subscribers}
          search={search}
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
    </Card>
  );
}
