import { useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  AddServerFlagDialog,
  AddServerNoteDialog,
  ClearMaintenanceDialog,
  DisableVpnServerDialog,
  EnableMaintenanceDialog,
  MarkVpnServerReviewedDialog,
  MigrateRoutersDialog,
  ReactivateVpnServerDialog,
  ReconcileVpnServerDialog,
  RemoveServerFlagDialog,
  RestartVpnDialog,
  VpnServerDetailsWorkspace,
} from "@/features/vpn-servers/components";
import {
  useAddServerFlag,
  useAddServerNote,
  useClearServerMaintenance,
  useDisableVpnServer,
  useEnableServerMaintenance,
  useMarkVpnServerReviewed,
  useMigrateServerRouters,
  useReactivateVpnServer,
  useReconcileVpnServer,
  useRemoveServerFlag,
  useRestartServerVpn,
  useVpnServer,
  useVpnServerTrafficDetail,
  useVpnServerPeers,
  useVpnServerRouters,
} from "@/features/vpn-servers/hooks/useVpnServers";
import type { VpnServerDetail } from "@/features/vpn-servers/types/vpn-server.types";
import { useDisclosure } from "@/hooks/ui/useDisclosure";

export function VpnServerDetailsPage() {
  const { id = "" } = useParams();
  const [selectedFlag, setSelectedFlag] = useState<VpnServerDetail["flags"][number] | null>(null);

  const disableDisclosure = useDisclosure(false);
  const reactivateDisclosure = useDisclosure(false);
  const maintenanceDisclosure = useDisclosure(false);
  const clearMaintenanceDisclosure = useDisclosure(false);
  const migrateDisclosure = useDisclosure(false);
  const restartDisclosure = useDisclosure(false);
  const reconcileDisclosure = useDisclosure(false);
  const reviewedDisclosure = useDisclosure(false);
  const noteDisclosure = useDisclosure(false);
  const flagDisclosure = useDisclosure(false);
  const removeFlagDisclosure = useDisclosure(false);

  const serverQuery = useVpnServer(id);
  const routersQuery = useVpnServerRouters(id, { limit: 8 });
  const peersQuery = useVpnServerPeers(id, { limit: 8 });
  const trafficDetailQuery = useVpnServerTrafficDetail(id);

  const disableMutation = useDisableVpnServer();
  const reactivateMutation = useReactivateVpnServer();
  const maintenanceMutation = useEnableServerMaintenance();
  const clearMaintenanceMutation = useClearServerMaintenance();
  const migrateMutation = useMigrateServerRouters();
  const restartMutation = useRestartServerVpn();
  const reconcileMutation = useReconcileVpnServer();
  const reviewedMutation = useMarkVpnServerReviewed();
  const noteMutation = useAddServerNote();
  const flagMutation = useAddServerFlag();
  const removeFlagMutation = useRemoveServerFlag();

  if (serverQuery.isPending) return <PageLoader />;
  if (serverQuery.isError || !serverQuery.data) {
    return <ErrorState title="Unable to load VPN server" description="The VPN server detail workspace could not be loaded. Retry after confirming the backend admin VPN server API is available." onAction={() => void serverQuery.refetch()} />;
  }

  const server = serverQuery.data;

  return (
    <section className="space-y-6">
      <PageHeader title={server.profile.name} description="Route-driven VPN server workspace for health, capacity, traffic, and peer operations." meta={server.profile.nodeId} />

      <VpnServerDetailsWorkspace
        server={server}
        routers={routersQuery.data?.items || []}
        peers={peersQuery.data?.items || []}
        trafficDetail={trafficDetailQuery.data}
        routersLoading={routersQuery.isPending}
        peersLoading={peersQuery.isPending}
        onRefreshRouters={() => void routersQuery.refetch()}
        onRefreshPeers={() => void peersQuery.refetch()}
        onDisable={disableDisclosure.onOpen}
        onReactivate={reactivateDisclosure.onOpen}
        onEnableMaintenance={maintenanceDisclosure.onOpen}
        onClearMaintenance={clearMaintenanceDisclosure.onOpen}
        onMigrateRouters={migrateDisclosure.onOpen}
        onRestartVpn={restartDisclosure.onOpen}
        onReconcile={reconcileDisclosure.onOpen}
        onMarkReviewed={reviewedDisclosure.onOpen}
        onAddNote={noteDisclosure.onOpen}
        onAddFlag={flagDisclosure.onOpen}
        onRemoveFlag={(flag) => { setSelectedFlag(flag); removeFlagDisclosure.onOpen(); }}
      />

      <DisableVpnServerDialog open={disableDisclosure.open} loading={disableMutation.isPending} onClose={disableDisclosure.onClose} onConfirm={(reason) => disableMutation.mutate([server.id, reason] as never, { onSuccess: () => disableDisclosure.onClose() })} />
      <ReactivateVpnServerDialog open={reactivateDisclosure.open} loading={reactivateMutation.isPending} onClose={reactivateDisclosure.onClose} onConfirm={(reason) => reactivateMutation.mutate([server.id, reason] as never, { onSuccess: () => reactivateDisclosure.onClose() })} />
      <EnableMaintenanceDialog open={maintenanceDisclosure.open} loading={maintenanceMutation.isPending} onClose={maintenanceDisclosure.onClose} onConfirm={(reason) => maintenanceMutation.mutate([server.id, reason] as never, { onSuccess: () => maintenanceDisclosure.onClose() })} />
      <ClearMaintenanceDialog open={clearMaintenanceDisclosure.open} loading={clearMaintenanceMutation.isPending} onClose={clearMaintenanceDisclosure.onClose} onConfirm={(reason) => clearMaintenanceMutation.mutate([server.id, reason] as never, { onSuccess: () => clearMaintenanceDisclosure.onClose() })} />
      <MigrateRoutersDialog open={migrateDisclosure.open} loading={migrateMutation.isPending} onClose={migrateDisclosure.onClose} onConfirm={(payload) => migrateMutation.mutate([server.id, payload] as never, { onSuccess: () => migrateDisclosure.onClose() })} />
      <RestartVpnDialog open={restartDisclosure.open} loading={restartMutation.isPending} onClose={restartDisclosure.onClose} onConfirm={(reason) => restartMutation.mutate([server.id, reason] as never, { onSuccess: () => restartDisclosure.onClose() })} />
      <ReconcileVpnServerDialog open={reconcileDisclosure.open} loading={reconcileMutation.isPending} onClose={reconcileDisclosure.onClose} onConfirm={(reason) => reconcileMutation.mutate([server.id, reason] as never, { onSuccess: () => reconcileDisclosure.onClose() })} />
      <MarkVpnServerReviewedDialog open={reviewedDisclosure.open} loading={reviewedMutation.isPending} onClose={reviewedDisclosure.onClose} onConfirm={(reason) => reviewedMutation.mutate([server.id, reason] as never, { onSuccess: () => reviewedDisclosure.onClose() })} />
      <AddServerNoteDialog open={noteDisclosure.open} loading={noteMutation.isPending} onClose={noteDisclosure.onClose} onConfirm={(payload) => noteMutation.mutate([server.id, payload] as never, { onSuccess: () => noteDisclosure.onClose() })} />
      <AddServerFlagDialog open={flagDisclosure.open} loading={flagMutation.isPending} onClose={flagDisclosure.onClose} onConfirm={(payload) => flagMutation.mutate([server.id, payload] as never, { onSuccess: () => flagDisclosure.onClose() })} />
      <RemoveServerFlagDialog open={removeFlagDisclosure.open} loading={removeFlagMutation.isPending} flag={selectedFlag} onClose={removeFlagDisclosure.onClose} onConfirm={(reason) => { if (!selectedFlag?.id) return; removeFlagMutation.mutate([server.id, selectedFlag.id, reason] as never, { onSuccess: () => removeFlagDisclosure.onClose() }); }} />
    </section>
  );
}
