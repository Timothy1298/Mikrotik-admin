import { Activity, AlertTriangle, ArrowRight, Router, Server, ShieldAlert, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { TableLoader } from "@/components/feedback/TableLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { appRoutes } from "@/config/routes";
import { VpnServerStatsRow } from "@/features/vpn-servers/components";
import { useVpnServers, useVpnServerStats } from "@/features/vpn-servers/hooks/useVpnServers";
import { formatDateTime } from "@/lib/formatters/date";

export function VpnServerManagementOverviewPage() {
  const statsQuery = useVpnServerStats();
  const recentServersQuery = useVpnServers({ limit: 5, sortBy: "createdAt", sortOrder: "desc" });
  const attentionServersQuery = useVpnServers({ healthStatus: "degraded", limit: 5, sortBy: "lastHeartbeatAt", sortOrder: "asc" });

  if (statsQuery.isPending) return <TableLoader />;
  if (statsQuery.isError || !statsQuery.data) {
    return <ErrorState title="Unable to load VPN server overview" description="The admin VPN server overview could not be loaded. Retry after confirming the backend VPN server API is available." onAction={() => void statsQuery.refetch()} />;
  }

  const stats = statsQuery.data;

  return (
    <section className="space-y-6">
      <PageHeader title="VPN Server Management" description="Command-center overview for infrastructure health, maintenance, peer distribution, router impact, and VPN fleet operations." meta="Infrastructure operations" />

      <VpnServerStatsRow stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Attention load" value={String(stats.serversWithIncidents)} progress={Math.min(100, stats.serversWithIncidents * 10)} />
        <MetricCard title="Overloaded servers" value={String(stats.overloadedServers)} progress={Math.min(100, stats.overloadedServers * 15)} />
        <MetricCard title="Stale telemetry" value={String(stats.serversWithStaleTelemetry)} progress={Math.min(100, stats.serversWithStaleTelemetry * 15)} />
        <MetricCard title="Attached routers" value={String(stats.totalRoutersAttached)} progress={Math.min(100, stats.totalRoutersAttached)} />
      </div>

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
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.vpnServersUnhealthy}>Unhealthy Servers <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.vpnServersMaintenance}>Maintenance Mode <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.vpnServersOverloaded}>Overloaded Servers <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.vpnServersDiagnosticsReview}>Diagnostics & Review <ArrowRight className="h-4 w-4" /></Link>
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
              <div key={server.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{server.name}</p>
                    <p className="text-sm text-slate-400">{server.region} • {server.nodeId}</p>
                  </div>
                  <span className="font-mono text-xs text-slate-500">{formatDateTime(server.createdAt)}</span>
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
              <div key={server.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{server.name}</p>
                    <p className="text-sm text-slate-400">{server.healthSummary.status} • {server.routerCount} routers</p>
                  </div>
                  <span className="font-mono text-xs text-slate-500">{formatDateTime(server.lastHeartbeatAt)}</span>
                </div>
              </div>
            )) : <EmptyState icon={Activity} title="Infrastructure is steady" description="No degraded VPN servers currently need urgent attention." />}
          </div>
        </Card>
      </div>
    </section>
  );
}
