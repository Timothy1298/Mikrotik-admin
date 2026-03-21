import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Plus, Router, Server, ShieldAlert, WifiOff, Wrench } from "lucide-react";
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
import { routerManagementTabs } from "@/config/module-tabs";
import {
  AddRouterFlagDialog,
  AddRouterAdminDialog,
  AddRouterNoteDialog,
  DeleteRouterDialog,
  DisableRouterDialog,
  MarkRouterReviewedDialog,
  MoveServerDialog,
  RebootRouterDialog,
  ReactivateRouterDialog,
  ReassignPortsDialog,
  RegenerateSetupDialog,
  ReprovisionRouterDialog,
  ResetPeerDialog,
  RouterDetailsModal,
  RouterFilters,
  RouterStatsRow,
  RoutersTable,
  RemoveRouterFlagDialog,
} from "@/features/routers/components";
import {
  useAddRouterFlag,
  useAddRouterNote,
  useDeleteRouter,
  useDisableRouter,
  useMarkRouterReviewed,
  useMoveRouterServer,
  useRebootRouter,
  useReactivateRouter,
  useReassignRouterPorts,
  useRegenerateRouterSetup,
  useRemoveRouterFlag,
  useReprovisionRouter,
  useResetRouterPeer,
  useRouter,
} from "@/features/routers/hooks/useRouter";
import { useRouters, useRouterStats } from "@/features/routers/hooks/useRouters";
import type { RouterQuery, RouterRow } from "@/features/routers/types/router.types";
import type { RouterManagementSection } from "@/features/routers/utils/router-management-sections";
import { routerManagementSections } from "@/features/routers/utils/router-management-sections";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { permissions } from "@/lib/permissions/permissions";
import { can } from "@/lib/permissions/can";

const sectionIcons: Record<RouterManagementSection, typeof Router> = {
  all: Router,
  online: Router,
  offline: WifiOff,
  "provisioning-queue": Wrench,
  "unhealthy-tunnels": AlertTriangle,
  "port-mapping-issues": ShieldAlert,
  "server-assignment": Server,
  "diagnostics-review": ShieldAlert,
  "api-connectivity": ShieldAlert,
  "notes-flags": ShieldAlert,
};

const defaultRouterFilters: Pick<RouterQuery, "limit" | "sortBy" | "sortOrder"> = {
  limit: 50,
  sortBy: "createdAt",
  sortOrder: "desc",
};

function areRouterFiltersEqual(current: RouterQuery, next: RouterQuery) {
  const currentEntries = Object.entries(current);
  const nextEntries = Object.entries(next);

  if (currentEntries.length !== nextEntries.length) {
    return false;
  }

  return currentEntries.every(([key, value]) => next[key as keyof RouterQuery] === value);
}

function filterRowsForSection(section: RouterManagementSection, rows: RouterRow[]) {
  switch (section) {
    case "provisioning-queue":
      return rows.filter((row) => ["pending", "awaiting_connection", "failed"].includes(row.setupStatus));
    case "diagnostics-review":
      return rows.filter((row) => row.unhealthy || row.issueFlags.length > 0 || row.setupStatus === "failed" || (row.connectionMode !== "management_only" && (!row.winboxPort || !row.sshPort || !row.apiPort)));
    case "api-connectivity":
      return rows.filter((row) => row.apiConnectivity.state !== "healthy");
    default:
      return rows;
  }
}

export function RouterManagementSectionPage({ section }: { section: RouterManagementSection }) {
  const location = useLocation();
  const navigate = useNavigate();
  const sectionMeta = routerManagementSections[section];
  const lockedFilters = sectionMeta.lockedFilters ?? {};
  const sectionFilters = { ...lockedFilters, ...defaultRouterFilters };
  const hiddenFields = Object.keys(lockedFilters) as Array<keyof RouterQuery>;

  const [filters, setFilters] = useState<RouterQuery>(sectionFilters);
  const [selectedRouter, setSelectedRouter] = useState<RouterRow | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<{ id?: string; flag: string; severity: string } | null>(null);

  const detailDisclosure = useDisclosure(false);
  const disableDisclosure = useDisclosure(false);
  const deleteDisclosure = useDisclosure(false);
  const reactivateDisclosure = useDisclosure(false);
  const reprovisionDisclosure = useDisclosure(false);
  const regenerateDisclosure = useDisclosure(false);
  const resetPeerDisclosure = useDisclosure(false);
  const reassignPortsDisclosure = useDisclosure(false);
  const moveServerDisclosure = useDisclosure(false);
  const rebootDisclosure = useDisclosure(false);
  const reviewedDisclosure = useDisclosure(false);
  const noteDisclosure = useDisclosure(false);
  const flagDisclosure = useDisclosure(false);
  const removeFlagDisclosure = useDisclosure(false);
  const addRouterDisclosure = useDisclosure(false);

  const effectiveFilters = useMemo(() => ({ ...filters, ...lockedFilters }), [filters, lockedFilters]);
  const routersQuery = useRouters(effectiveFilters);
  const statsQuery = useRouterStats();
  const detailQuery = useRouter(selectedRouter?.id || "");
  const { data: user } = useCurrentUser(true);

  useEffect(() => {
    setFilters((current) => (areRouterFiltersEqual(current, sectionFilters) ? current : sectionFilters));
  }, [section]);

  const disableMutation = useDisableRouter();
  const deleteMutation = useDeleteRouter();
  const reactivateMutation = useReactivateRouter();
  const reprovisionMutation = useReprovisionRouter();
  const regenerateMutation = useRegenerateRouterSetup();
  const resetPeerMutation = useResetRouterPeer();
  const reassignPortsMutation = useReassignRouterPorts();
  const moveServerMutation = useMoveRouterServer();
  const rebootMutation = useRebootRouter();
  const markReviewedMutation = useMarkRouterReviewed();
  const noteMutation = useAddRouterNote();
  const addFlagMutation = useAddRouterFlag();
  const removeFlagMutation = useRemoveRouterFlag();

  const baseRows = routersQuery.data?.items || [];
  const rows = filterRowsForSection(section, baseRows);
  const total = rows.length;
  const unhealthyCount = rows.filter((row) => row.unhealthy).length;
  const offlineCount = rows.filter((row) => row.connectionStatus === "offline").length;
  const flaggedCount = rows.reduce((sum, row) => sum + row.issueFlags.length, 0);
  const portIssueCount = rows.filter((row) => row.connectionMode !== "management_only" && (!row.winboxPort || !row.sshPort || !row.apiPort)).length;

  const metrics = useMemo(() => [
    { title: "Visible routers", value: String(total), progress: Math.min(100, total) },
    { title: "Unhealthy", value: String(unhealthyCount), progress: Math.min(100, unhealthyCount * 7) },
    { title: "Offline", value: String(offlineCount), progress: Math.min(100, offlineCount * 8) },
    { title: "Port issues", value: String(portIssueCount || flaggedCount), progress: Math.min(100, Math.max(portIssueCount, flaggedCount) * 10) },
  ], [flaggedCount, offlineCount, portIssueCount, total, unhealthyCount]);

  const activeFiltersCount = Object.entries(filters).filter(([, value]) => value && value !== "").length;
  const Icon = sectionIcons[section];

  const openRouterContext = (router: RouterRow) => {
    setSelectedRouter(router);
    detailDisclosure.onOpen();
  };

  return (
    <section className="space-y-6">
      <PageHeader title={sectionMeta.title} description={sectionMeta.description} meta="Router management" />

      <Tabs tabs={[...routerManagementTabs]} value={location.pathname} onChange={navigate} />

      {section === "all" && statsQuery.data ? <RouterStatsRow stats={statsQuery.data} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.title} title={metric.title} value={metric.value} progress={metric.progress} />)}
      </div>

      <RouterFilters filters={effectiveFilters} hiddenFields={hiddenFields} onChange={(patch) => setFilters((current) => ({ ...current, ...patch, ...lockedFilters }))} />

      <Card>
        <DataToolbar>
          <div className="flex items-center gap-3">
            <div className="icon-block-primary rounded-2xl p-2 text-text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{sectionMeta.title}</p>
              <p className="font-mono text-xs text-text-muted">{total} visible routers{activeFiltersCount ? ` • ${activeFiltersCount} active filters` : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {section === "all" && can(user, permissions.routersManage) ? <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={addRouterDisclosure.onOpen}>Add Router</Button> : null}
            {routersQuery.isFetching && !routersQuery.isPending ? <p className="font-mono text-xs text-text-muted">Refreshing data...</p> : null}
            <RefreshButton loading={routersQuery.isFetching || statsQuery.isFetching} onClick={() => { void routersQuery.refetch(); void statsQuery.refetch(); }} />
          </div>
        </DataToolbar>

        <div className="mt-4">
          {routersQuery.isPending ? (
            <TableLoader />
          ) : routersQuery.isError ? (
            <ErrorState title={`Unable to load ${sectionMeta.title.toLowerCase()}`} description="The router directory request failed. Retry after confirming the admin routers API is reachable." onAction={() => void routersQuery.refetch()} />
          ) : (
            <RoutersTable
              rows={rows}
              emptyTitle={sectionMeta.emptyTitle}
              emptyDescription={sectionMeta.emptyDescription}
              onOpenDetails={openRouterContext}
              onDisable={(router) => { setSelectedRouter(router); disableDisclosure.onOpen(); }}
              onDelete={(router) => { setSelectedRouter(router); deleteDisclosure.onOpen(); }}
              onReactivate={(router) => { setSelectedRouter(router); reactivateDisclosure.onOpen(); }}
              onReprovision={(router) => { setSelectedRouter(router); reprovisionDisclosure.onOpen(); }}
              onRegenerateSetup={(router) => { setSelectedRouter(router); regenerateDisclosure.onOpen(); }}
              onResetPeer={(router) => { setSelectedRouter(router); resetPeerDisclosure.onOpen(); }}
              onReassignPorts={(router) => { setSelectedRouter(router); reassignPortsDisclosure.onOpen(); }}
              onMoveServer={(router) => { setSelectedRouter(router); moveServerDisclosure.onOpen(); }}
              onMarkReviewed={(router) => { setSelectedRouter(router); reviewedDisclosure.onOpen(); }}
              onAddNote={(router) => { setSelectedRouter(router); noteDisclosure.onOpen(); }}
              onAddFlag={(router) => { setSelectedRouter(router); flagDisclosure.onOpen(); }}
            />
          )}
        </div>
      </Card>

      <RouterDetailsModal
        open={detailDisclosure.open}
        loading={detailQuery.isPending}
        router={detailQuery.data}
        error={detailQuery.isError}
        onClose={detailDisclosure.onClose}
        onDisable={disableDisclosure.onOpen}
        onDelete={deleteDisclosure.onOpen}
        onReactivate={reactivateDisclosure.onOpen}
        onReprovision={reprovisionDisclosure.onOpen}
        onReboot={rebootDisclosure.onOpen}
        onRegenerateSetup={regenerateDisclosure.onOpen}
        onResetPeer={resetPeerDisclosure.onOpen}
        onReassignPorts={reassignPortsDisclosure.onOpen}
        onMoveServer={moveServerDisclosure.onOpen}
        onMarkReviewed={reviewedDisclosure.onOpen}
        onAddNote={noteDisclosure.onOpen}
        onAddFlag={flagDisclosure.onOpen}
        onRemoveFlag={(flag) => { setSelectedFlag(flag); removeFlagDisclosure.onOpen(); }}
      />

      <DisableRouterDialog open={disableDisclosure.open} loading={disableMutation.isPending} onClose={disableDisclosure.onClose} onConfirm={(reason) => selectedRouter && disableMutation.mutate([selectedRouter.id, reason] as never, { onSuccess: () => disableDisclosure.onClose() })} />
      <DeleteRouterDialog open={deleteDisclosure.open} loading={deleteMutation.isPending} onClose={deleteDisclosure.onClose} onConfirm={(reason) => selectedRouter && deleteMutation.mutate([selectedRouter.id, reason] as never, { onSuccess: () => { deleteDisclosure.onClose(); detailDisclosure.onClose(); } })} />
      <ReactivateRouterDialog open={reactivateDisclosure.open} loading={reactivateMutation.isPending} onClose={reactivateDisclosure.onClose} onConfirm={(reason) => selectedRouter && reactivateMutation.mutate([selectedRouter.id, reason] as never, { onSuccess: () => reactivateDisclosure.onClose() })} />
      <ReprovisionRouterDialog open={reprovisionDisclosure.open} loading={reprovisionMutation.isPending} onClose={reprovisionDisclosure.onClose} onConfirm={(reason) => selectedRouter && reprovisionMutation.mutate([selectedRouter.id, reason] as never, { onSuccess: () => reprovisionDisclosure.onClose() })} />
      <RebootRouterDialog open={rebootDisclosure.open} loading={rebootMutation.isPending} onClose={rebootDisclosure.onClose} onConfirm={(reason) => selectedRouter && rebootMutation.mutate([selectedRouter.id, reason] as never, { onSuccess: () => rebootDisclosure.onClose() })} />
      <RegenerateSetupDialog open={regenerateDisclosure.open} loading={regenerateMutation.isPending} onClose={regenerateDisclosure.onClose} onConfirm={(reason) => selectedRouter && regenerateMutation.mutate([selectedRouter.id, reason] as never, { onSuccess: () => regenerateDisclosure.onClose() })} />
      <ResetPeerDialog open={resetPeerDisclosure.open} loading={resetPeerMutation.isPending} onClose={resetPeerDisclosure.onClose} onConfirm={(reason) => selectedRouter && resetPeerMutation.mutate([selectedRouter.id, reason] as never, { onSuccess: () => resetPeerDisclosure.onClose() })} />
      <ReassignPortsDialog open={reassignPortsDisclosure.open} loading={reassignPortsMutation.isPending} onClose={reassignPortsDisclosure.onClose} onConfirm={(payload) => selectedRouter && reassignPortsMutation.mutate([selectedRouter.id, payload] as never, { onSuccess: () => reassignPortsDisclosure.onClose() })} />
      <MoveServerDialog open={moveServerDisclosure.open} loading={moveServerMutation.isPending} onClose={moveServerDisclosure.onClose} onConfirm={(payload) => selectedRouter && moveServerMutation.mutate([selectedRouter.id, payload] as never, { onSuccess: () => moveServerDisclosure.onClose() })} />
      <MarkRouterReviewedDialog open={reviewedDisclosure.open} loading={markReviewedMutation.isPending} onClose={reviewedDisclosure.onClose} onConfirm={(reason) => selectedRouter && markReviewedMutation.mutate([selectedRouter.id, reason] as never, { onSuccess: () => reviewedDisclosure.onClose() })} />
      <AddRouterNoteDialog open={noteDisclosure.open} loading={noteMutation.isPending} onClose={noteDisclosure.onClose} onConfirm={(payload) => selectedRouter && noteMutation.mutate([selectedRouter.id, payload] as never, { onSuccess: () => noteDisclosure.onClose() })} />
      <AddRouterFlagDialog open={flagDisclosure.open} loading={addFlagMutation.isPending} onClose={flagDisclosure.onClose} onConfirm={(payload) => selectedRouter && addFlagMutation.mutate([selectedRouter.id, payload] as never, { onSuccess: () => flagDisclosure.onClose() })} />
      <RemoveRouterFlagDialog open={removeFlagDisclosure.open} loading={removeFlagMutation.isPending} flag={selectedFlag} onClose={removeFlagDisclosure.onClose} onConfirm={(reason) => {
        if (!selectedRouter || !selectedFlag?.id) return;
        removeFlagMutation.mutate([selectedRouter.id, selectedFlag.id, reason] as never, { onSuccess: () => removeFlagDisclosure.onClose() });
      }} />
      <AddRouterAdminDialog open={addRouterDisclosure.open} onClose={addRouterDisclosure.onClose} />
    </section>
  );
}
