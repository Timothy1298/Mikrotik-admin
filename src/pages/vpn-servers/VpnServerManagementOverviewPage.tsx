import { Activity, AlertTriangle, ArrowRight, Plus, Router, Server, ShieldAlert, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { TableLoader } from "@/components/feedback/TableLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Tabs } from "@/components/ui/Tabs";
import { vpnServerManagementTabs } from "@/config/module-tabs";
import { appRoutes } from "@/config/routes";
import { AddVpnServerDialog, VpnServerHealthBadge, VpnServerStatsRow } from "@/features/vpn-servers/components";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useAddVpnServer, useVpnServers, useVpnServerStats } from "@/features/vpn-servers/hooks/useVpnServers";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { formatDateTime } from "@/lib/formatters/date";
import { cn } from "@/lib/utils/cn";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";

export function VpnServerManagementOverviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const addDisclosure = useDisclosure(false);
  const addMutation = useAddVpnServer();
  const { data: user } = useCurrentUser(true);
  const statsQuery = useVpnServerStats();
  const recentServersQuery = useVpnServers({ limit: 8, sortBy: "createdAt", sortOrder: "desc" });
  const attentionServersQuery = useVpnServers({ healthStatus: "degraded", limit: 5, sortBy: "lastHeartbeatAt", sortOrder: "asc" });
  const refreshOverview = () => {
    void statsQuery.refetch();
    void recentServersQuery.refetch();
    void attentionServersQuery.refetch();
  };

  if (statsQuery.isPending) return <TableLoader />;
  if (statsQuery.isError || !statsQuery.data) {
    return <ErrorState title="Unable to load VPN server overview" description="The admin VPN server overview could not be loaded. Retry after confirming the backend VPN server API is available." onAction={() => void statsQuery.refetch()} />;
  }

  const stats = statsQuery.data;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="VPN Server Management" description="Command-center overview for infrastructure health, maintenance, peer distribution, router impact, and VPN fleet operations." meta="Infrastructure operations" />
        <div className="flex flex-wrap gap-3">
          <RefreshButton loading={statsQuery.isFetching || recentServersQuery.isFetching || attentionServersQuery.isFetching} onClick={refreshOverview} />
          {can(user, permissions.vpnServersManage) ? (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={addDisclosure.onOpen}>Add Server</Button>
          ) : null}
        </div>
      </div>

      <Tabs tabs={[...vpnServerManagementTabs]} value={location.pathname} onChange={navigate} />

      <VpnServerStatsRow stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Attention load" value={String(stats.serversWithIncidents)} progress={Math.min(100, stats.serversWithIncidents * 10)} />
        <MetricCard title="Overloaded servers" value={String(stats.overloadedServers)} progress={Math.min(100, stats.overloadedServers * 15)} />
        <MetricCard title="Stale telemetry" value={String(stats.serversWithStaleTelemetry)} progress={Math.min(100, stats.serversWithStaleTelemetry * 15)} />
        <MetricCard title="Attached routers" value={String(stats.totalRoutersAttached)} progress={Math.min(100, stats.totalRoutersAttached)} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Server Capacity Overview</CardTitle>
            <CardDescription>Peer utilization across active server nodes.</CardDescription>
          </div>
        </CardHeader>
        {(recentServersQuery.data?.items || []).length ? (
          <div className="space-y-3">
            {recentServersQuery.data?.items.slice(0, 8).map((server) => {
              const utilization = server.loadCapacitySummary.peerUtilization ?? 0;
              const toneClass = utilization >= 90 ? "bg-danger" : utilization >= 70 ? "bg-warning" : "bg-success";
              return (
                <div key={server.id} className="grid gap-3 rounded-2xl border border-background-border bg-background-panel p-4 md:grid-cols-[minmax(140px,220px)_minmax(0,1fr)_80px_auto] md:items-center">
                  <p className="truncate text-sm font-medium text-text-primary">{server.name}</p>
                  <div className="relative">
                    <Progress value={utilization} className="h-3 bg-slate-900" />
                    <div className={cn("absolute inset-y-0 left-0 rounded-full opacity-85", toneClass)} style={{ width: `${Math.max(0, Math.min(100, utilization))}%` }} />
                  </div>
                  <p className="text-sm text-text-secondary">{server.loadCapacitySummary.peerUtilization?.toFixed(0) ?? "—"}%</p>
                  <div className="justify-self-start md:justify-self-end">
                    <VpnServerHealthBadge status={server.healthSummary.status} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Server} title="No server capacity data available" description="Peer utilization rows will appear here once active server nodes report capacity telemetry." />
        )}
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Servers needing attention</CardTitle>
              <CardDescription>Capacity, health, and infrastructure issues that likely need operator action next.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            <StatCard title="Unhealthy servers" value={String(stats.unhealthyServers)} description="Servers currently degraded or affecting attached routers and peers." icon={AlertTriangle} tone="danger" />
            <StatCard title="Maintenance mode" value={String(stats.maintenanceServers)} description="Servers intentionally isolated for maintenance or recovery work." icon={ShieldAlert} tone="warning" />
            <StatCard title="Peer footprint" value={String(stats.totalPeers)} description="Current peer distribution attached across the infrastructure fleet." icon={Users} tone="neutral" />
            <StatCard title="Router impact" value={String(stats.totalRoutersAttached)} description="Routers currently distributed across the VPN server fleet." icon={Router} tone="info" />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick jumps</CardTitle>
              <CardDescription>Open the highest-signal infrastructure queues directly from the overview.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.vpnServersUnhealthy}>Unhealthy Servers <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.vpnServersMaintenance}>Maintenance Mode <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.vpnServersOverloaded}>Overloaded Servers <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.vpnServersDiagnosticsReview}>Diagnostics & Review <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent servers</CardTitle>
              <CardDescription>Newest infrastructure records entering the control plane.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {recentServersQuery.isPending ? <SectionLoader /> : recentServersQuery.isError ? <ErrorState title="Unable to load recent servers" description="Retry after confirming the VPN server list endpoint is available." onAction={() => void recentServersQuery.refetch()} /> : (recentServersQuery.data?.items || []).length ? recentServersQuery.data?.items.map((server) => (
              <div key={server.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-text-primary">{server.name}</p>
                    <p className="text-sm text-text-secondary">{server.region} • {server.nodeId}</p>
                  </div>
                  <span className="font-mono text-xs text-text-muted">{formatDateTime(server.createdAt)}</span>
                </div>
              </div>
            )) : <EmptyState icon={Server} title="No recent servers" description="Newly added VPN server records will appear here." />}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Most impacted servers</CardTitle>
              <CardDescription>Servers currently carrying degraded health or stale operational state.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {attentionServersQuery.isPending ? <SectionLoader /> : attentionServersQuery.isError ? <ErrorState title="Unable to load impacted servers" description="Retry after confirming degraded server filtering is available." onAction={() => void attentionServersQuery.refetch()} /> : (attentionServersQuery.data?.items || []).length ? attentionServersQuery.data?.items.map((server) => (
              <div key={server.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-text-primary">{server.name}</p>
                    <p className="text-sm text-text-secondary">{server.healthSummary.status} • {server.routerCount} routers</p>
                  </div>
                  <span className="font-mono text-xs text-text-muted">{formatDateTime(server.lastHeartbeatAt)}</span>
                </div>
              </div>
            )) : <EmptyState icon={Activity} title="Infrastructure is steady" description="No degraded VPN servers currently need urgent attention." />}
          </div>
        </Card>
      </div>

      <AddVpnServerDialog open={addDisclosure.open} loading={addMutation.isPending} onClose={addDisclosure.onClose} onConfirm={(payload) => addMutation.mutate(payload, { onSuccess: () => addDisclosure.onClose() })} />
    </section>
  );
}
