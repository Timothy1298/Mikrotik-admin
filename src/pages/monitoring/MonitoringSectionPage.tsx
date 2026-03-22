import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Activity, AlertTriangle, LifeBuoy, Router, Server, ShieldAlert, UserCog, Users, Wrench } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { TableLoader } from "@/components/feedback/TableLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataToolbar } from "@/components/shared/DataToolbar";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { monitoringTabs } from "@/config/module-tabs";
import { appRoutes } from "@/config/routes";
import {
  AcknowledgeIncidentModal,
  AddIncidentNoteModal,
  CustomerImpactTable,
  IncidentDetailsModal,
  IncidentSeverityBadge,
  IncidentsTable,
  MarkIncidentReviewedModal,
  MonitoringEventDetailsModal,
  MonitoringFilters,
  MonitoringTrendCard,
  PeerHealthTable,
  ProvisioningIssuesTable,
  ResolveIncidentModal,
  RouterHealthTable,
  TrafficTopRoutersTable,
  TrafficTopServersTable,
  VpnServerHealthTable,
} from "@/features/monitoring/components";
import {
  useAcknowledgeIncident,
  useAddIncidentNote,
  useAffectedCustomers,
  useCustomerImpact,
  useIncident,
  useIncidents,
  useMarkIncidentReviewed,
  useMonitoringActivity,
  useMonitoringDiagnostics,
  useOfflineRouters,
  useOverloadedVpnServers,
  usePeerHealthSummary,
  useProvisioningFailures,
  useProvisioningIssueRouters,
  useProvisioningSummary,
  useProvisioningTrends,
  useResolveIncident,
  useRouterHealthSummary,
  useStalePeers,
  useStaleRouters,
  useStaleVpnServers,
  useTopTrafficRouters,
  useTopTrafficServers,
  useTrafficSummary,
  useTrafficTrends,
  useUnhealthyPeers,
  useUnhealthyRouters,
  useUnhealthyVpnServers,
  useVpnServerHealthSummary,
} from "@/features/monitoring/hooks/useMonitoring";
import type { MonitoringDetailItem, MonitoringFilterState, MonitoringIncident, MonitoringSection } from "@/features/monitoring/types/monitoring.types";
import { monitoringSections } from "@/features/monitoring/utils/monitoring-sections";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { cn } from "@/lib/utils/cn";

dayjs.extend(relativeTime);

const sectionIcons: Record<MonitoringSection, typeof Activity> = {
  "router-health": Router,
  "vpn-server-health": Server,
  "peer-health": ShieldAlert,
  "traffic-bandwidth": Activity,
  "customer-impact": Users,
  "provisioning-analytics": Wrench,
  "incidents-alerts": AlertTriangle,
  diagnostics: ShieldAlert,
  "activity-feed": Activity,
};

export function MonitoringSectionPage({ section }: { section: MonitoringSection }) {
  const location = useLocation();
  const navigate = useNavigate();
  const sectionMeta = monitoringSections[section];
  const [filters, setFilters] = useState<MonitoringFilterState>({ limit: 50, window: "24h" });
  const [selectedIncident, setSelectedIncident] = useState<MonitoringIncident | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<MonitoringDetailItem | null>(null);

  const incidentDisclosure = useDisclosure(false);
  const eventDisclosure = useDisclosure(false);
  const acknowledgeDisclosure = useDisclosure(false);
  const resolveDisclosure = useDisclosure(false);
  const reviewedDisclosure = useDisclosure(false);
  const noteDisclosure = useDisclosure(false);
  const isRouterSection = section === "router-health";
  const isVpnSection = section === "vpn-server-health";
  const isPeerSection = section === "peer-health";
  const isTrafficSection = section === "traffic-bandwidth";
  const isCustomerSection = section === "customer-impact";
  const isProvisioningSection = section === "provisioning-analytics";
  const isIncidentsSection = section === "incidents-alerts";
  const isDiagnosticsSection = section === "diagnostics";
  const isActivitySection = section === "activity-feed";

  const routerSummaryQuery = useRouterHealthSummary(isRouterSection);
  const unhealthyRoutersQuery = useUnhealthyRouters(filters, isRouterSection);
  const offlineRoutersQuery = useOfflineRouters(filters, isRouterSection);
  const provisioningIssueRoutersQuery = useProvisioningIssueRouters(filters, isRouterSection);
  const staleRoutersQuery = useStaleRouters(filters, isRouterSection);
  const vpnSummaryQuery = useVpnServerHealthSummary(isVpnSection);
  const unhealthyServersQuery = useUnhealthyVpnServers(filters, isVpnSection);
  const overloadedServersQuery = useOverloadedVpnServers(filters, isVpnSection);
  const staleServersQuery = useStaleVpnServers(filters, isVpnSection);
  const peerSummaryQuery = usePeerHealthSummary(isPeerSection);
  const stalePeersQuery = useStalePeers(filters, isPeerSection);
  const unhealthyPeersQuery = useUnhealthyPeers(filters, isPeerSection);
  const trafficSummaryQuery = useTrafficSummary(isTrafficSection);
  const trafficTrendsQuery = useTrafficTrends(filters, isTrafficSection);
  const topTrafficRoutersQuery = useTopTrafficRouters(filters, isTrafficSection);
  const topTrafficServersQuery = useTopTrafficServers(filters, isTrafficSection);
  const customerImpactQuery = useCustomerImpact(isCustomerSection);
  const affectedCustomersQuery = useAffectedCustomers(filters, isCustomerSection);
  const provisioningSummaryQuery = useProvisioningSummary(isProvisioningSection);
  const provisioningTrendsQuery = useProvisioningTrends(filters, isProvisioningSection);
  const provisioningFailuresQuery = useProvisioningFailures(filters, isProvisioningSection);
  const incidentsQuery = useIncidents(filters, isIncidentsSection);
  const incidentQuery = useIncident(selectedIncident?.id || "", isIncidentsSection);
  const diagnosticsQuery = useMonitoringDiagnostics(isDiagnosticsSection);
  const activityQuery = useMonitoringActivity(filters, isActivitySection);

  const acknowledgeMutation = useAcknowledgeIncident();
  const resolveMutation = useResolveIncident();
  const reviewedMutation = useMarkIncidentReviewed();
  const noteMutation = useAddIncidentNote();

  useEffect(() => {
    setFilters({ limit: 50, window: "24h" });
  }, [section]);

  const Icon = sectionIcons[section];

  const routerRows = useMemo(() => {
      const all = [
        ...(unhealthyRoutersQuery.data?.items || []),
        ...(offlineRoutersQuery.data?.items || []),
        ...(provisioningIssueRoutersQuery.data?.items || []),
        ...(staleRoutersQuery.data?.items || []),
      ];
      return Array.from(new Map(all.map((item) => [item.id, item])).values());
  }, [offlineRoutersQuery.data?.items, provisioningIssueRoutersQuery.data?.items, staleRoutersQuery.data?.items, unhealthyRoutersQuery.data?.items]);

  const vpnRows = useMemo(() => {
    const all = [
      ...(unhealthyServersQuery.data?.items || []),
      ...(overloadedServersQuery.data?.items || []),
      ...(staleServersQuery.data?.items || []),
    ];
    return Array.from(new Map(all.map((item) => [item.id, item])).values());
  }, [overloadedServersQuery.data?.items, staleServersQuery.data?.items, unhealthyServersQuery.data?.items]);

  const peerRows = useMemo(() => {
    const all = [
      ...(stalePeersQuery.data?.items || []),
      ...(unhealthyPeersQuery.data?.items || []),
    ];
    return Array.from(new Map(all.map((item) => [item.id, item])).values());
  }, [stalePeersQuery.data?.items, unhealthyPeersQuery.data?.items]);

  const openIncident = (incident: MonitoringIncident) => {
    if (incident.relatedRouter?.id) {
      navigate(appRoutes.routerDetail(incident.relatedRouter.id));
      return;
    }
    if (incident.relatedUser?.id) {
      navigate(appRoutes.userDetail(incident.relatedUser.id));
      return;
    }
    if (incident.relatedServer?.id) {
      navigate(appRoutes.vpnServerDetail(incident.relatedServer.id));
      return;
    }
    setSelectedIncident(incident);
    incidentDisclosure.onOpen();
  };

  const getWorkspaceRoute = (detail: MonitoringDetailItem) => {
    switch (detail.kind) {
      case "router":
        return appRoutes.routerDetail(detail.item.id);
      case "vpn-server":
        return appRoutes.vpnServerDetail(detail.item.id);
      case "peer":
        return detail.item.router?.id ? appRoutes.routerDetail(detail.item.router.id) : (detail.item.user?.id ? appRoutes.userDetail(detail.item.user.id) : null);
      case "customer":
        return detail.item.user?.id ? appRoutes.userDetail(detail.item.user.id) : null;
      case "traffic-router":
        return appRoutes.routerDetail(detail.item.id);
      case "traffic-server":
        return appRoutes.vpnServerDetail(detail.item.nodeId);
      case "diagnostic":
        if (detail.item.resourceType === "router") return appRoutes.routerDetail(detail.item.resourceId);
        if (detail.item.resourceType === "user" || detail.item.resourceType === "billing_account") return appRoutes.userDetail(detail.item.resourceId);
        if (detail.item.resourceType === "vpn_server") return appRoutes.vpnServerDetail(detail.item.resourceId);
        return null;
      case "activity":
        if (detail.item.resource?.type === "router") return appRoutes.routerDetail(detail.item.resource.id);
        if (detail.item.resource?.type === "user" || detail.item.resource?.type === "billing_account") return appRoutes.userDetail(detail.item.resource.id);
        if (detail.item.resource?.type === "vpn_server") return appRoutes.vpnServerDetail(detail.item.resource.id);
        return null;
      case "incident":
        return detail.item.relatedRouter?.id
          ? appRoutes.routerDetail(detail.item.relatedRouter.id)
          : detail.item.relatedUser?.id
            ? appRoutes.userDetail(detail.item.relatedUser.id)
            : detail.item.relatedServer?.id
              ? appRoutes.vpnServerDetail(detail.item.relatedServer.id)
              : null;
      default:
        return null;
    }
  };

  const openDetail = (detail: MonitoringDetailItem) => {
    const route = getWorkspaceRoute(detail);
    if (route) {
      navigate(route);
      return;
    }
    setSelectedDetail(detail);
    eventDisclosure.onOpen();
  };

  const renderContent = () => {
    if (section === "router-health") {
      if (unhealthyRoutersQuery.isPending && offlineRoutersQuery.isPending && provisioningIssueRoutersQuery.isPending && staleRoutersQuery.isPending) return <TableLoader />;
      if (unhealthyRoutersQuery.isError) return <ErrorState title="Unable to load router health" description="Retry after confirming router monitoring endpoints are available." onAction={() => void unhealthyRoutersQuery.refetch()} />;
      return <RouterHealthTable rows={routerRows} onOpen={(row) => openDetail({ kind: "router", item: row })} emptyTitle={sectionMeta.emptyTitle} emptyDescription={sectionMeta.emptyDescription} />;
    }
    if (section === "vpn-server-health") {
      if (unhealthyServersQuery.isPending && overloadedServersQuery.isPending && staleServersQuery.isPending) return <TableLoader />;
      if (unhealthyServersQuery.isError) return <ErrorState title="Unable to load VPN server health" description="Retry after confirming server monitoring endpoints are available." onAction={() => void unhealthyServersQuery.refetch()} />;
      return <VpnServerHealthTable rows={vpnRows} onOpen={(row) => openDetail({ kind: "vpn-server", item: row })} />;
    }
    if (section === "peer-health") {
      if (stalePeersQuery.isPending && unhealthyPeersQuery.isPending) return <TableLoader />;
      if (stalePeersQuery.isError) return <ErrorState title="Unable to load peer health" description="Retry after confirming peer monitoring endpoints are available." onAction={() => void stalePeersQuery.refetch()} />;
      return <PeerHealthTable rows={peerRows} onOpen={(row) => openDetail({ kind: "peer", item: row })} />;
    }
    if (section === "traffic-bandwidth") {
      if (trafficSummaryQuery.isPending || topTrafficRoutersQuery.isPending || topTrafficServersQuery.isPending) return <SectionLoader />;
      if (trafficSummaryQuery.isError || !trafficSummaryQuery.data || topTrafficRoutersQuery.isError || topTrafficServersQuery.isError) return <ErrorState title="Unable to load traffic analytics" description="Retry after confirming traffic monitoring endpoints are available." onAction={() => { void trafficSummaryQuery.refetch(); void topTrafficRoutersQuery.refetch(); void topTrafficServersQuery.refetch(); }} />;
      return (
        <div className="space-y-5">
          {trafficTrendsQuery.data ? <MonitoringTrendCard title="Traffic snapshot trend" description={trafficTrendsQuery.data.supported === false ? (trafficTrendsQuery.data.reason || "Only current aggregate transfer counters are available.") : "Recent traffic series"} trends={trafficTrendsQuery.data} dataKey="totalTransferBytes" secondaryKey="totalTransferTx" window={filters.window} /> : null}
          <div className="grid gap-5 xl:grid-cols-2">
            <Card><div className="p-5"><TrafficTopRoutersTable rows={topTrafficRoutersQuery.data.items} onOpen={(row) => openDetail({ kind: "traffic-router", item: row })} /></div></Card>
            <Card><div className="p-5"><TrafficTopServersTable rows={topTrafficServersQuery.data.items} onOpen={(row) => openDetail({ kind: "traffic-server", item: row })} /></div></Card>
          </div>
        </div>
      );
    }
    if (section === "customer-impact") {
      if (affectedCustomersQuery.isPending) return <TableLoader />;
      if (affectedCustomersQuery.isError) return <ErrorState title="Unable to load customer impact" description="Retry after confirming customer impact monitoring endpoints are available." onAction={() => void affectedCustomersQuery.refetch()} />;
      return <CustomerImpactTable rows={affectedCustomersQuery.data?.items || []} onOpen={(row) => openDetail({ kind: "customer", item: row })} />;
    }
    if (section === "provisioning-analytics") {
      if (provisioningFailuresQuery.isPending) return <TableLoader />;
      if (provisioningFailuresQuery.isError) return <ErrorState title="Unable to load provisioning analytics" description="Retry after confirming provisioning monitoring endpoints are available." onAction={() => void provisioningFailuresQuery.refetch()} />;
      return (
        <div className="space-y-5">
          {provisioningTrendsQuery.data ? <MonitoringTrendCard title="Provisioning lifecycle trend" description="Router creation, setup completion, and failure counts across the selected time window." trends={provisioningTrendsQuery.data} dataKey="setupRequested" secondaryKey="setupCompleted" window={filters.window} /> : null}
          <ProvisioningIssuesTable rows={provisioningFailuresQuery.data?.items || []} onOpen={(row) => openDetail({ kind: "router", item: row })} />
        </div>
      );
    }
    if (section === "incidents-alerts") {
      if (incidentsQuery.isPending) return <TableLoader />;
      if (incidentsQuery.isError) return <ErrorState title="Unable to load incidents" description="Retry after confirming incident monitoring endpoints are available." onAction={() => void incidentsQuery.refetch()} />;
      return <IncidentsTable rows={incidentsQuery.data?.items || []} onOpen={openIncident} onAcknowledge={(incident) => { setSelectedIncident(incident); acknowledgeDisclosure.onOpen(); }} onResolve={(incident) => { setSelectedIncident(incident); resolveDisclosure.onOpen(); }} onMarkReviewed={(incident) => { setSelectedIncident(incident); reviewedDisclosure.onOpen(); }} onAddNote={(incident) => { setSelectedIncident(incident); noteDisclosure.onOpen(); }} />;
    }
    if (section === "diagnostics") {
      if (diagnosticsQuery.isPending) return <TableLoader />;
      if (diagnosticsQuery.isError || !diagnosticsQuery.data) return <ErrorState title="Unable to load diagnostics" description="Retry after confirming diagnostics monitoring endpoints are available." onAction={() => void diagnosticsQuery.refetch()} />;
      if (!diagnosticsQuery.data.issues.length) return <Card><div className="p-5"><ErrorState title={sectionMeta.emptyTitle} description={sectionMeta.emptyDescription} /></div></Card>;
      return (
        <div className="grid gap-3">
          {diagnosticsQuery.data.issues.map((issue) => (
            <button key={`${issue.code}-${issue.resourceId}`} type="button" onClick={() => openDetail({ kind: "diagnostic", item: issue })} className={cn("rounded-2xl border border-background-border bg-background-panel p-4 text-left transition hover:border-primary/40 hover:bg-primary/10", issue.severity === "critical" ? "border-l-4 border-l-danger" : issue.severity === "high" ? "border-l-4 border-l-primary" : issue.severity === "medium" ? "border-l-4 border-l-brand-400" : "")}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-text-primary">{issue.resourceName}</p>
                <div className="flex items-center gap-2">
                  <Badge tone="info">{issue.resourceType}</Badge>
                  <IncidentSeverityBadge severity={issue.severity} />
                </div>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{issue.message}</p>
            </button>
          ))}
        </div>
      );
    }
    if (activityQuery.isPending) return <TableLoader />;
    if (activityQuery.isError) return <ErrorState title="Unable to load activity feed" description="Retry after confirming monitoring activity endpoints are available." onAction={() => void activityQuery.refetch()} />;
    if (!(activityQuery.data?.items || []).length) return <Card><div className="p-5"><ErrorState title={sectionMeta.emptyTitle} description={sectionMeta.emptyDescription} /></div></Card>;
    return (
      <div className="grid gap-3">
        {(activityQuery.data?.items || []).map((item) => (
          <button key={item.id} type="button" onClick={() => openDetail({ kind: "activity", item })} className={cn("rounded-2xl border border-background-border bg-background-panel p-4 text-left transition hover:border-primary/40 hover:bg-primary/10", item.severity === "critical" || item.severity === "high" ? "border-l-2 border-l-danger" : item.severity === "medium" ? "border-l-2 border-l-primary" : "")}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="icon-block-primary rounded-2xl p-2 text-text-primary">
                  {item.source === "admin" ? <UserCog className="h-4 w-4" /> : item.source === "router" ? <Router className="h-4 w-4" /> : item.source === "incident" ? <AlertTriangle className="h-4 w-4" /> : item.source === "support" ? <LifeBuoy className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                </span>
                <div>
                  <p className="font-medium text-text-primary">{item.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone="info">{item.source}</Badge>
                    <span className="text-sm text-text-secondary">{item.type.replace(/_/g, " ")}</span>
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs text-text-muted">{dayjs(item.timestamp).fromNow()}</span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const selectedIncidentDetail = incidentQuery.data || selectedIncident;

  return (
    <section className="space-y-6">
      <PageHeader title={sectionMeta.title} description={sectionMeta.description} meta="Monitoring operations" />

      <Tabs tabs={[...monitoringTabs]} value={location.pathname} onChange={navigate} />

      <MonitoringFilters section={section} filters={filters} onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))} />

      <Card>
        <DataToolbar>
          <div className="flex items-center gap-3">
            <div className="icon-block-primary rounded-2xl p-2 text-text-primary"><Icon className="h-4 w-4" /></div>
            <div>
              <p className="text-sm font-medium text-text-primary">{sectionMeta.title}</p>
              <p className="font-mono text-xs text-text-muted">{sectionMeta.description}</p>
            </div>
          </div>
          <RefreshButton loading={routerSummaryQuery.isFetching || vpnSummaryQuery.isFetching || peerSummaryQuery.isFetching || trafficSummaryQuery.isFetching || customerImpactQuery.isFetching || provisioningSummaryQuery.isFetching || incidentsQuery.isFetching || diagnosticsQuery.isFetching || activityQuery.isFetching} onClick={() => {
            if (isRouterSection) {
              void routerSummaryQuery.refetch();
              void unhealthyRoutersQuery.refetch();
              void offlineRoutersQuery.refetch();
              void provisioningIssueRoutersQuery.refetch();
              void staleRoutersQuery.refetch();
            }
            if (isVpnSection) {
              void vpnSummaryQuery.refetch();
              void unhealthyServersQuery.refetch();
              void overloadedServersQuery.refetch();
              void staleServersQuery.refetch();
            }
            if (isPeerSection) {
              void peerSummaryQuery.refetch();
              void stalePeersQuery.refetch();
              void unhealthyPeersQuery.refetch();
            }
            if (isTrafficSection) {
              void trafficSummaryQuery.refetch();
              void trafficTrendsQuery.refetch();
              void topTrafficRoutersQuery.refetch();
              void topTrafficServersQuery.refetch();
            }
            if (isCustomerSection) {
              void customerImpactQuery.refetch();
              void affectedCustomersQuery.refetch();
            }
            if (isProvisioningSection) {
              void provisioningSummaryQuery.refetch();
              void provisioningTrendsQuery.refetch();
              void provisioningFailuresQuery.refetch();
            }
            if (isIncidentsSection) {
              void incidentsQuery.refetch();
              if (selectedIncident?.id) void incidentQuery.refetch();
            }
            if (isDiagnosticsSection) void diagnosticsQuery.refetch();
            if (isActivitySection) void activityQuery.refetch();
          }} />
        </DataToolbar>
        <div className="mt-4">{renderContent()}</div>
      </Card>

      <IncidentDetailsModal open={incidentDisclosure.open} incident={selectedIncidentDetail || null} onClose={incidentDisclosure.onClose} onAcknowledge={() => { incidentDisclosure.onClose(); acknowledgeDisclosure.onOpen(); }} onResolve={() => { incidentDisclosure.onClose(); resolveDisclosure.onOpen(); }} onMarkReviewed={() => { incidentDisclosure.onClose(); reviewedDisclosure.onOpen(); }} onAddNote={() => { incidentDisclosure.onClose(); noteDisclosure.onOpen(); }} />
      <MonitoringEventDetailsModal open={eventDisclosure.open} detail={selectedDetail} onClose={eventDisclosure.onClose} />

      <AcknowledgeIncidentModal open={acknowledgeDisclosure.open} loading={acknowledgeMutation.isPending} onClose={acknowledgeDisclosure.onClose} onConfirm={(reason) => selectedIncident && acknowledgeMutation.mutate([selectedIncident.id, reason] as never, { onSuccess: () => acknowledgeDisclosure.onClose() })} />
      <ResolveIncidentModal open={resolveDisclosure.open} loading={resolveMutation.isPending} onClose={resolveDisclosure.onClose} onConfirm={(reason) => selectedIncident && resolveMutation.mutate([selectedIncident.id, reason] as never, { onSuccess: () => resolveDisclosure.onClose() })} />
      <MarkIncidentReviewedModal open={reviewedDisclosure.open} loading={reviewedMutation.isPending} onClose={reviewedDisclosure.onClose} onConfirm={(reason) => selectedIncident && reviewedMutation.mutate([selectedIncident.id, reason] as never, { onSuccess: () => reviewedDisclosure.onClose() })} />
      <AddIncidentNoteModal open={noteDisclosure.open} loading={noteMutation.isPending} onClose={noteDisclosure.onClose} onConfirm={(payload) => selectedIncident && noteMutation.mutate([selectedIncident.id, payload] as never, { onSuccess: () => noteDisclosure.onClose() })} />
    </section>
  );
}
