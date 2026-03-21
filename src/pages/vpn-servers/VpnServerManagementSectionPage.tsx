import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Router, Server, ShieldAlert, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableLoader } from "@/components/feedback/TableLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataToolbar } from "@/components/shared/DataToolbar";
import { MetricCard } from "@/components/shared/MetricCard";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { vpnServerManagementTabs } from "@/config/module-tabs";
import {
  AddServerFlagDialog,
  AddServerNoteDialog,
  AddVpnServerDialog,
  ClearMaintenanceDialog,
  DisableVpnServerDialog,
  EnableMaintenanceDialog,
  MarkVpnServerReviewedDialog,
  MigrateRoutersDialog,
  ReactivateVpnServerDialog,
  ReconcileVpnServerDialog,
  RemoveServerFlagDialog,
  RestartVpnDialog,
  VpnServerDetailsModal,
  VpnServerStatsRow,
  VpnServersFilters,
  VpnServersTable,
} from "@/features/vpn-servers/components";
import {
  useAddServerFlag,
  useAddServerNote,
  useAddVpnServer,
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
  useVpnServers,
  useVpnServerStats,
} from "@/features/vpn-servers/hooks/useVpnServers";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import type { VpnServerQuery, VpnServerRow } from "@/features/vpn-servers/types/vpn-server.types";
import type { VpnServerManagementSection } from "@/features/vpn-servers/utils/vpn-server-management-sections";
import { vpnServerManagementSections } from "@/features/vpn-servers/utils/vpn-server-management-sections";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";

const sectionIcons: Record<VpnServerManagementSection, typeof Server> = {
  all: Server,
  healthy: Server,
  unhealthy: AlertTriangle,
  maintenance: ShieldAlert,
  overloaded: Activity,
  "router-distribution": Router,
  "peer-health": Users,
  "traffic-load": Activity,
  "diagnostics-review": ShieldAlert,
};

const defaultVpnServerFilters: Pick<VpnServerQuery, "limit" | "sortBy" | "sortOrder"> = {
  limit: 50,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const vpnServerPreviewParams = { limit: 8 } as const;

function areFiltersEqual(current: VpnServerQuery, next: VpnServerQuery) {
  const currentEntries = Object.entries(current);
  const nextEntries = Object.entries(next);

  if (currentEntries.length !== nextEntries.length) {
    return false;
  }

  return currentEntries.every(([key, value]) => next[key as keyof VpnServerQuery] === value);
}

function filterRowsForSection(section: VpnServerManagementSection, rows: VpnServerRow[]) {
  switch (section) {
    case "router-distribution":
      return rows.filter((row) => row.routerCount > 0);
    case "peer-health":
      return rows.filter((row) => row.bandwidthSummary.totalPeerCount > 0 || row.healthSummary.issues.includes("stale_peers"));
    case "traffic-load":
      return rows.filter((row) => row.bandwidthSummary.totalTransferBytes > 0 || row.loadCapacitySummary.overloaded || row.loadCapacitySummary.nearCapacity);
    case "diagnostics-review":
      return rows.filter((row) => row.issueFlags.length > 0 || row.healthSummary.issues.length > 0 || row.healthSummary.staleTelemetry);
    default:
      return rows;
  }
}

export function VpnServerManagementSectionPage({ section }: { section: VpnServerManagementSection }) {
  const location = useLocation();
  const navigate = useNavigate();
  const sectionMeta = vpnServerManagementSections[section];
  const lockedFilters = sectionMeta.lockedFilters ?? {};
  const sectionFilters = { ...lockedFilters, ...defaultVpnServerFilters };
  const hiddenFields = Object.keys(lockedFilters) as Array<keyof VpnServerQuery>;

  const [filters, setFilters] = useState<VpnServerQuery>(sectionFilters);
  const [selectedServer, setSelectedServer] = useState<VpnServerRow | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<{ id?: string; flag: string; severity: string } | null>(null);

  const addDisclosure = useDisclosure(false);
  const detailDisclosure = useDisclosure(false);
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

  const effectiveFilters = useMemo(() => ({ ...filters, ...lockedFilters }), [filters, lockedFilters]);
  const serversQuery = useVpnServers(effectiveFilters);
  const statsQuery = useVpnServerStats();
  const detailQuery = useVpnServer(selectedServer?.id || "");
  const routersQuery = useVpnServerRouters(selectedServer?.id || "", vpnServerPreviewParams);
  const peersQuery = useVpnServerPeers(selectedServer?.id || "", vpnServerPreviewParams);
  const trafficDetailQuery = useVpnServerTrafficDetail(selectedServer?.id || "");
  const { data: user } = useCurrentUser(true);

  useEffect(() => {
    setFilters((current) => (areFiltersEqual(current, sectionFilters) ? current : sectionFilters));
  }, [section]);

  const addMutation = useAddVpnServer();
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

  const baseRows = serversQuery.data?.items || [];
  const rows = filterRowsForSection(section, baseRows);
  const total = rows.length;
  const unhealthyCount = rows.filter((row) => row.healthSummary.status === "degraded").length;
  const overloadedCount = rows.filter((row) => row.loadCapacitySummary.overloaded).length;
  const routerCount = rows.reduce((sum, row) => sum + row.routerCount, 0);
  const peerCount = rows.reduce((sum, row) => sum + row.activePeerCount, 0);

  const metrics = useMemo(() => {
    if (section === "router-distribution") {
      return [
        { title: "Visible servers", value: String(total), progress: Math.min(100, total) },
        { title: "Routers attached", value: String(routerCount), progress: Math.min(100, routerCount) },
        { title: "Peers in scope", value: String(peerCount), progress: Math.min(100, peerCount) },
        { title: "Unhealthy", value: String(unhealthyCount), progress: Math.min(100, unhealthyCount * 12) },
      ];
    }
    if (section === "traffic-load") {
      return [
        { title: "Visible servers", value: String(total), progress: Math.min(100, total) },
        { title: "Traffic nodes", value: String(rows.filter((row) => row.bandwidthSummary.totalTransferBytes > 0).length), progress: Math.min(100, rows.filter((row) => row.bandwidthSummary.totalTransferBytes > 0).length * 12) },
        { title: "Overloaded", value: String(overloadedCount), progress: Math.min(100, overloadedCount * 18) },
        { title: "Peers in scope", value: String(peerCount || routerCount), progress: Math.min(100, Math.max(peerCount, routerCount)) },
      ];
    }
    return [
      { title: "Visible servers", value: String(total), progress: Math.min(100, total) },
      { title: "Unhealthy", value: String(unhealthyCount), progress: Math.min(100, unhealthyCount * 12) },
      { title: "Overloaded", value: String(overloadedCount), progress: Math.min(100, overloadedCount * 18) },
      { title: "Peers in scope", value: String(peerCount || routerCount), progress: Math.min(100, Math.max(peerCount, routerCount)) },
    ];
  }, [overloadedCount, peerCount, routerCount, rows, section, total, unhealthyCount]);

  const activeFiltersCount = Object.entries(filters).filter(([, value]) => value && value !== "").length;
  const Icon = sectionIcons[section];

  const openServerContext = (server: VpnServerRow) => {
    setSelectedServer(server);
    detailDisclosure.onOpen();
  };

  return (
    <section className="space-y-6">
      <PageHeader title={sectionMeta.title} description={sectionMeta.description} meta="VPN server management" />

      <Tabs tabs={[...vpnServerManagementTabs]} value={location.pathname} onChange={navigate} />

      {section === "all" && statsQuery.data ? <VpnServerStatsRow stats={statsQuery.data} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.title} title={metric.title} value={metric.value} progress={metric.progress} />)}
      </div>

      <VpnServersFilters filters={effectiveFilters} hiddenFields={hiddenFields} onChange={(patch) => setFilters((current) => ({ ...current, ...patch, ...lockedFilters }))} />

      <Card>
        <DataToolbar>
          <div className="flex items-center gap-3">
            <div className="icon-block-primary rounded-2xl p-2 text-text-primary"><Icon className="h-4 w-4" /></div>
            <div>
              <p className="text-sm font-medium text-text-primary">{sectionMeta.title}</p>
              <p className="font-mono text-xs text-text-muted">{total} visible servers{activeFiltersCount ? ` • ${activeFiltersCount} active filters` : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {can(user, permissions.vpnServersManage) ? <Button onClick={addDisclosure.onOpen}>Add server</Button> : null}
            {serversQuery.isFetching && !serversQuery.isPending ? <p className="font-mono text-xs text-text-muted">Refreshing data...</p> : null}
            <RefreshButton loading={serversQuery.isFetching || statsQuery.isFetching} onClick={() => { void serversQuery.refetch(); void statsQuery.refetch(); }} />
          </div>
        </DataToolbar>

        <div className="mt-4">
          {serversQuery.isPending ? <TableLoader /> : serversQuery.isError ? <ErrorState title={`Unable to load ${sectionMeta.title.toLowerCase()}`} description="The VPN server directory request failed. Retry after confirming the admin infrastructure API is reachable." onAction={() => void serversQuery.refetch()} /> : (
            <VpnServersTable
              rows={rows}
              onOpenDetails={openServerContext}
              onDisable={(server) => { setSelectedServer(server); disableDisclosure.onOpen(); }}
              onReactivate={(server) => { setSelectedServer(server); reactivateDisclosure.onOpen(); }}
              onEnableMaintenance={(server) => { setSelectedServer(server); maintenanceDisclosure.onOpen(); }}
              onClearMaintenance={(server) => { setSelectedServer(server); clearMaintenanceDisclosure.onOpen(); }}
              onMigrateRouters={(server) => { setSelectedServer(server); migrateDisclosure.onOpen(); }}
              onRestartVpn={(server) => { setSelectedServer(server); restartDisclosure.onOpen(); }}
              onReconcile={(server) => { setSelectedServer(server); reconcileDisclosure.onOpen(); }}
              onMarkReviewed={(server) => { setSelectedServer(server); reviewedDisclosure.onOpen(); }}
              onAddNote={(server) => { setSelectedServer(server); noteDisclosure.onOpen(); }}
              onAddFlag={(server) => { setSelectedServer(server); flagDisclosure.onOpen(); }}
            />
          )}
        </div>
      </Card>

      <VpnServerDetailsModal
        open={detailDisclosure.open}
        loading={detailQuery.isPending}
        server={detailQuery.data}
        error={detailQuery.isError}
        routers={routersQuery.data?.items || []}
        peers={peersQuery.data?.items || []}
        trafficDetail={trafficDetailQuery.data}
        routersLoading={routersQuery.isPending}
        peersLoading={peersQuery.isPending}
        onRefreshRouters={() => void routersQuery.refetch()}
        onRefreshPeers={() => void peersQuery.refetch()}
        onClose={detailDisclosure.onClose}
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

      <AddVpnServerDialog open={addDisclosure.open} loading={addMutation.isPending} onClose={addDisclosure.onClose} onConfirm={(payload) => addMutation.mutate(payload, { onSuccess: () => addDisclosure.onClose() })} />
      <DisableVpnServerDialog open={disableDisclosure.open} loading={disableMutation.isPending} onClose={disableDisclosure.onClose} onConfirm={(reason) => selectedServer && disableMutation.mutate([selectedServer.id, reason] as never, { onSuccess: () => disableDisclosure.onClose() })} />
      <ReactivateVpnServerDialog open={reactivateDisclosure.open} loading={reactivateMutation.isPending} onClose={reactivateDisclosure.onClose} onConfirm={(reason) => selectedServer && reactivateMutation.mutate([selectedServer.id, reason] as never, { onSuccess: () => reactivateDisclosure.onClose() })} />
      <EnableMaintenanceDialog open={maintenanceDisclosure.open} loading={maintenanceMutation.isPending} onClose={maintenanceDisclosure.onClose} onConfirm={(reason) => selectedServer && maintenanceMutation.mutate([selectedServer.id, reason] as never, { onSuccess: () => maintenanceDisclosure.onClose() })} />
      <ClearMaintenanceDialog open={clearMaintenanceDisclosure.open} loading={clearMaintenanceMutation.isPending} onClose={clearMaintenanceDisclosure.onClose} onConfirm={(reason) => selectedServer && clearMaintenanceMutation.mutate([selectedServer.id, reason] as never, { onSuccess: () => clearMaintenanceDisclosure.onClose() })} />
      <MigrateRoutersDialog open={migrateDisclosure.open} loading={migrateMutation.isPending} onClose={migrateDisclosure.onClose} onConfirm={(payload) => selectedServer && migrateMutation.mutate([selectedServer.id, payload] as never, { onSuccess: () => migrateDisclosure.onClose() })} />
      <RestartVpnDialog open={restartDisclosure.open} loading={restartMutation.isPending} onClose={restartDisclosure.onClose} onConfirm={(reason) => selectedServer && restartMutation.mutate([selectedServer.id, reason] as never, { onSuccess: () => restartDisclosure.onClose() })} />
      <ReconcileVpnServerDialog open={reconcileDisclosure.open} loading={reconcileMutation.isPending} onClose={reconcileDisclosure.onClose} onConfirm={(reason) => selectedServer && reconcileMutation.mutate([selectedServer.id, reason] as never, { onSuccess: () => reconcileDisclosure.onClose() })} />
      <MarkVpnServerReviewedDialog open={reviewedDisclosure.open} loading={reviewedMutation.isPending} onClose={reviewedDisclosure.onClose} onConfirm={(reason) => selectedServer && reviewedMutation.mutate([selectedServer.id, reason] as never, { onSuccess: () => reviewedDisclosure.onClose() })} />
      <AddServerNoteDialog open={noteDisclosure.open} loading={noteMutation.isPending} onClose={noteDisclosure.onClose} onConfirm={(payload) => selectedServer && noteMutation.mutate([selectedServer.id, payload] as never, { onSuccess: () => noteDisclosure.onClose() })} />
      <AddServerFlagDialog open={flagDisclosure.open} loading={flagMutation.isPending} onClose={flagDisclosure.onClose} onConfirm={(payload) => selectedServer && flagMutation.mutate([selectedServer.id, payload] as never, { onSuccess: () => flagDisclosure.onClose() })} />
      <RemoveServerFlagDialog open={removeFlagDisclosure.open} loading={removeFlagMutation.isPending} flag={selectedFlag} onClose={removeFlagDisclosure.onClose} onConfirm={(reason) => { if (!selectedServer || !selectedFlag?.id) return; removeFlagMutation.mutate([selectedServer.id, selectedFlag.id, reason] as never, { onSuccess: () => removeFlagDisclosure.onClose() }); }} />
    </section>
  );
}
