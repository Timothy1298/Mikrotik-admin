import { AlertTriangle, ArrowRight, Plus, Router, Server, WifiOff, Wrench } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { TableLoader } from "@/components/feedback/TableLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { routerManagementTabs } from "@/config/module-tabs";
import { appRoutes } from "@/config/routes";
import { AddRouterAdminDialog, RouterStatsRow } from "@/features/routers/components";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useRouters, useRouterStats } from "@/features/routers/hooks/useRouters";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { formatDateTime } from "@/lib/formatters/date";
import { permissions } from "@/lib/permissions/permissions";
import { can } from "@/lib/permissions/can";

export function RouterManagementOverviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const addRouterDisclosure = useDisclosure(false);
  const { data: user } = useCurrentUser(true);
  const statsQuery = useRouterStats();
  const recentRoutersQuery = useRouters({ limit: 5, sortBy: "createdAt", sortOrder: "desc" });
  const attentionRoutersQuery = useRouters({ unhealthyState: "true", limit: 5, sortBy: "lastSeen", sortOrder: "asc" });

  if (statsQuery.isPending) return <TableLoader />;
  if (statsQuery.isError || !statsQuery.data) {
    return <ErrorState title="Unable to load router management overview" description="The admin router overview could not be loaded. Retry after confirming the backend admin router API is available." onAction={() => void statsQuery.refetch()} />;
  }

  const stats = statsQuery.data;
  const byServerCount = Object.keys(stats.routersByServerNode || {}).length;

  return (
    <section className="space-y-6">
      <PageHeader title="Router Management" description="Command-center overview for provisioning, tunnel health, public access mapping, diagnostics, and customer-impacting router operations." meta="Fleet-driven router operations" />

      {can(user, permissions.routersManage) ? (
        <div className="flex justify-end">
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={addRouterDisclosure.onOpen}>
            Add Router
          </Button>
        </div>
      ) : null}

      <Tabs tabs={[...routerManagementTabs]} value={location.pathname} onChange={navigate} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Primary actions</CardTitle>
            <CardDescription>Most-used router workflows, promoted for faster provisioning and operational response.</CardDescription>
          </div>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          {can(user, permissions.routersManage) ? <Button leftIcon={<Plus className="h-4 w-4" />} onClick={addRouterDisclosure.onOpen}>Add Router</Button> : null}
          <Button variant="outline" onClick={() => navigate(appRoutes.routersAll)}>Open All Routers</Button>
          <Button variant="outline" onClick={() => navigate(appRoutes.routersOffline)}>Offline Routers</Button>
          <Button variant="outline" onClick={() => navigate(appRoutes.routersProvisioningQueue)}>Provisioning Queue</Button>
          <Button variant="outline" onClick={() => navigate(appRoutes.routersDiagnosticsReview)}>Diagnostics Review</Button>
        </div>
      </Card>

      <RouterStatsRow stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Attention load" value={String(stats.routersWithActiveAlerts)} progress={Math.min(100, stats.routersWithActiveAlerts * 6)} />
        <MetricCard title="Unhealthy tunnels" value={String(stats.routersWithUnhealthyTunnelState)} progress={Math.min(100, stats.routersWithUnhealthyTunnelState * 8)} />
        <MetricCard title="Port mapping issues" value={String(stats.routersWithoutPorts)} progress={Math.min(100, stats.routersWithoutPorts * 10)} />
        <MetricCard title="Assigned server nodes" value={String(byServerCount)} progress={Math.min(100, byServerCount * 15)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Routers needing attention</CardTitle>
              <CardDescription>Provisioning, tunnel, and public-access conditions that need operator review next.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            <StatCard title="Offline routers" value={String(stats.offlineRouters)} description="Routers currently disconnected or marked offline." icon={WifiOff} tone="danger" />
            <StatCard title="Pending setup" value={String(stats.pendingSetupRouters)} description="Routers still moving through onboarding or awaiting first connection." icon={Wrench} tone="warning" />
            <StatCard title="Failed provisioning" value={String(stats.failedProvisioningRouters)} description="Routers where provisioning has failed and intervention is required." icon={AlertTriangle} tone="danger" />
            <StatCard title="Server spread" value={String(byServerCount)} description="Distinct server assignments currently represented in the active fleet." icon={Server} tone="neutral" />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick jumps</CardTitle>
              <CardDescription>Open the highest-signal router queues directly from the overview.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.routersOffline}>Offline Routers <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.routersProvisioningQueue}>Provisioning Queue <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.routersUnhealthyTunnels}>Unhealthy Tunnels <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-sm font-medium text-slate-200 transition hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100" to={appRoutes.routersDiagnosticsReview}>Diagnostics & Review <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recently added routers</CardTitle>
              <CardDescription>Newest routers entering the platform and likely to need early provisioning visibility.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {recentRoutersQuery.isPending ? <SectionLoader /> : recentRoutersQuery.isError ? <ErrorState title="Unable to load recent routers" description="Retry after confirming the admin routers list endpoint is available." onAction={() => void recentRoutersQuery.refetch()} /> : (recentRoutersQuery.data?.items || []).length ? recentRoutersQuery.data?.items.map((router) => (
              <div key={router.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{router.name}</p>
                    <p className="text-sm text-slate-400">{router.customer?.name || "No customer"} • {router.vpnIp}</p>
                  </div>
                  <span className="font-mono text-xs text-slate-500">{formatDateTime(router.createdAt)}</span>
                </div>
              </div>
            )) : <EmptyState icon={Router} title="No recent routers" description="Recently created routers will appear here as provisioning continues." />}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Operational watchlist</CardTitle>
              <CardDescription>Routers currently carrying unhealthy or review-worthy tunnel and access states.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {attentionRoutersQuery.isPending ? <SectionLoader /> : attentionRoutersQuery.isError ? <ErrorState title="Unable to load attention routers" description="Retry after confirming the router attention query is available." onAction={() => void attentionRoutersQuery.refetch()} /> : (attentionRoutersQuery.data?.items || []).length ? attentionRoutersQuery.data?.items.map((router) => (
              <div key={router.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{router.name}</p>
                    <p className="text-sm text-slate-400">{router.healthSummary.state} • {router.serverNode}</p>
                  </div>
                  <span className="font-mono text-xs text-slate-500">{formatDateTime(router.lastSeen)}</span>
                </div>
              </div>
            )) : <EmptyState icon={AlertTriangle} title="Watchlist is clear" description="No unhealthy or flagged routers currently require urgent review." />}
          </div>
        </Card>
      </div>

      <AddRouterAdminDialog open={addRouterDisclosure.open} onClose={addRouterDisclosure.onClose} />
    </section>
  );
}
