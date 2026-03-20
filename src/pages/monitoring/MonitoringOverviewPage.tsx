import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Activity, ArrowRight, Router, Server, ShieldAlert, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { TableLoader } from "@/components/feedback/TableLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { monitoringTabs } from "@/config/module-tabs";
import { appRoutes } from "@/config/routes";
import {
  AcknowledgeIncidentModal,
  IncidentSeverityBadge,
  MonitoringStatsRow,
  MonitoringTrendCard,
} from "@/features/monitoring/components";
import {
  useAcknowledgeIncident,
  useAffectedCustomers,
  useIncidents,
  useMonitoringOverview,
  useMonitoringTrends,
} from "@/features/monitoring/hooks/useMonitoring";
import { formatDateTime } from "@/lib/formatters/date";
import { Button } from "@/components/ui/Button";

dayjs.extend(relativeTime);

export function MonitoringOverviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const overviewQuery = useMonitoringOverview();
  const trendsQuery = useMonitoringTrends({ window: "24h" });
  const incidentsQuery = useIncidents({ status: "open", limit: 5 });
  const customersQuery = useAffectedCustomers({ limit: 5 });
  const acknowledgeMutation = useAcknowledgeIncident();

  if (overviewQuery.isPending) return <TableLoader />;
  if (overviewQuery.isError || !overviewQuery.data) {
    return <ErrorState title="Unable to load monitoring overview" description="The monitoring overview could not be loaded. Retry after confirming the admin monitoring API is reachable." onAction={() => void overviewQuery.refetch()} />;
  }

  const overview = overviewQuery.data;

  return (
    <section className="space-y-6">
      <PageHeader title="Monitoring & Analytics" description="Platform-wide command center for router health, VPN infrastructure, incidents, provisioning quality, and operational customer impact." meta={`Last sync ${formatDateTime(overview.lastMonitoringSyncAt)}`} />

      <Tabs tabs={[...monitoringTabs]} value={location.pathname} onChange={navigate} />

      <div className="flex justify-end">
        <RefreshButton loading={overviewQuery.isFetching || trendsQuery.isFetching || incidentsQuery.isFetching || customersQuery.isFetching} onClick={() => { void overviewQuery.refetch(); void trendsQuery.refetch(); void incidentsQuery.refetch(); void customersQuery.refetch(); }} />
      </div>

      <MonitoringStatsRow overview={overview} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Pending setup" value={String(overview.routers.pendingSetup)} progress={Math.min(100, overview.routers.pendingSetup * 6)} />
        <MetricCard title="Broken mappings" value={String(overview.routers.brokenAccessMappings)} progress={Math.min(100, overview.routers.brokenAccessMappings * 8)} />
        <MetricCard title="Unhealthy servers" value={String(overview.vpnServers.unhealthy)} progress={Math.min(100, overview.vpnServers.unhealthy * 15)} />
        <MetricCard title="Stale peers" value={String(overview.peers.stale)} progress={Math.min(100, overview.peers.stale * 5)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        {trendsQuery.isPending || !trendsQuery.data ? <SectionLoader /> : <MonitoringTrendCard title="Incident and onboarding trend" description="Current monitoring trend window based on real incident and router lifecycle timestamps." trends={trendsQuery.data} dataKey="incidentsOpened" secondaryKey="routersConnected" window="24h" />}

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick jumps</CardTitle>
              <CardDescription>Open the highest-signal operational views directly from the overview.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.monitoringIncidentsAlerts}>Open incidents <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.monitoringRouterHealth}>Router health <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.monitoringVpnServerHealth}>VPN server health <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.monitoringDiagnostics}>Diagnostics <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Active issues</CardTitle>
              <CardDescription>Open incidents and alert pressure affecting the platform right now.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {incidentsQuery.isPending ? <SectionLoader /> : incidentsQuery.isError ? <ErrorState title="Unable to load incidents" description="Retry after confirming the incident endpoint is available." onAction={() => void incidentsQuery.refetch()} /> : (incidentsQuery.data?.items || []).length ? incidentsQuery.data?.items.map((incident) => (
              <div key={incident.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{incident.title}</p>
                    <p className="text-sm text-slate-400">{incident.type.replace(/_/g, " ")} • {incident.status}</p>
                    <p className="mt-1 font-mono text-xs text-slate-500">{dayjs(incident.firstDetectedAt).fromNow()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IncidentSeverityBadge severity={incident.severity} />
                    {incident.status === "open" ? <Button variant="ghost" size="sm" onClick={() => setSelectedIncidentId(incident.id)}>Acknowledge →</Button> : null}
                  </div>
                </div>
              </div>
            )) : <EmptyState icon={ShieldAlert} title="No active incidents" description="No incidents are currently open in the monitoring subsystem." />}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Affected customers</CardTitle>
              <CardDescription>Highest-impact customer accounts currently hit by operational issues.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {customersQuery.isPending ? <SectionLoader /> : customersQuery.isError ? <ErrorState title="Unable to load affected customers" description="Retry after confirming customer impact data is available." onAction={() => void customersQuery.refetch()} /> : (customersQuery.data?.items || []).length ? customersQuery.data?.items.map((item) => (
              <div key={item.user.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{item.user.name || item.user.email}</p>
                    <p className="text-sm text-slate-400">{item.offlineRouters} offline • {item.unhealthyRouters} unhealthy</p>
                  </div>
                  <Users className="h-4 w-4 text-brand-100" />
                </div>
              </div>
            )) : <EmptyState icon={Users} title="No affected customers" description="No customers are currently flagged as impacted by live issues." />}
          </div>
        </Card>
      </div>

      <AcknowledgeIncidentModal open={Boolean(selectedIncidentId)} loading={acknowledgeMutation.isPending} onClose={() => setSelectedIncidentId(null)} onConfirm={(reason) => {
        if (!selectedIncidentId) return;
        acknowledgeMutation.mutate([selectedIncidentId, reason] as never, { onSuccess: () => setSelectedIncidentId(null) });
      }} />
    </section>
  );
}
