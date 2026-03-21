import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  LifeBuoy,
  Router,
  ScrollText,
  Shield,
  TrendingUp,
  UserX,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActivityTimeline } from "@/components/data-display/ActivityTimeline";
import { AnalyticsChartCard } from "@/components/data-display/AnalyticsChartCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Spinner } from "@/components/ui/Spinner";
import { queryKeys } from "@/config/queryKeys";
import { appRoutes } from "@/config/routes";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { TrafficChartCard } from "@/features/dashboard/components";
import { useDashboardStats } from "@/features/dashboard/hooks";
import { useRouterStats, useRouters } from "@/features/routers/hooks/useRouters";
import type { DashboardQuickAction } from "@/features/dashboard/types";
import { useWebSocket } from "@/hooks/api/useWebSocket";
import { formatBytes } from "@/lib/formatters/bytes";
import { formatCurrency } from "@/lib/formatters/currency";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";
import { cn } from "@/lib/utils/cn";

dayjs.extend(relativeTime);

const toneTextClass = {
  info: "text-brand-100",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-slate-100",
} as const;

const toneBorderClass = {
  info: "border-l-brand-400",
  success: "border-l-success",
  warning: "border-l-warning",
  danger: "border-l-danger",
  neutral: "border-l-slate-500",
} as const;

const toneIconClass = {
  info: "text-brand-100",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-slate-300",
} as const;

function getStatusTone(healthy: boolean, warning = false) {
  if (healthy) return "success" as const;
  return warning ? "warning" as const : "danger" as const;
}

function RouterStatusSummary({
  isConnected,
}: {
  isConnected: boolean;
}) {
  const routerStatsQuery = useRouterStats();
  const stats = routerStatsQuery.data;

  return (
    <Card className="surface-card-3d overflow-hidden p-0">
      <div className="rounded-[24px] border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-4 md:p-5">
        <CardHeader>
          <div>
            <CardTitle>Router Status Summary</CardTitle>
            <CardDescription>Fleet counts from the router workspace, refreshed by live websocket events and API polling.</CardDescription>
          </div>
          <Badge tone={isConnected ? "success" : "warning"}>{isConnected ? "WebSocket connected" : "Polling fallback"}</Badge>
        </CardHeader>

        {routerStatsQuery.isPending ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                <div className="h-4 w-24 animate-pulse rounded-xl bg-brand-500/15" />
                <div className="mt-4 h-8 w-14 animate-pulse rounded-xl bg-brand-500/15" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Routers", value: stats?.totalRouters ?? 0, tone: "text-brand-100" },
              { label: "Online Routers", value: stats?.onlineRouters ?? 0, tone: "text-success" },
              { label: "Offline Routers", value: stats?.offlineRouters ?? 0, tone: "text-danger" },
              { label: "Pending Setup", value: stats?.pendingSetupRouters ?? 0, tone: "text-warning" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className={cn("mt-3 text-2xl font-semibold", item.tone)}>{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const dashboardQuery = useDashboardStats();
  const currentUserQuery = useCurrentUser(true);
  const featuredRoutersQuery = useRouters({ limit: 6, sortBy: "lastSeen", sortOrder: "desc" });
  const { lastMessage, isConnected } = useWebSocket(["router:all"]);
  const user = currentUserQuery.data;

  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== "object") return;

    const messageType = typeof lastMessage.type === "string" ? lastMessage.type : null;
    const routerId = typeof lastMessage.routerId === "string" ? lastMessage.routerId : null;

    if (messageType === "router_status") {
      void queryClient.invalidateQueries({ queryKey: queryKeys.routers });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      return;
    }

    if (messageType === "router_metric") {
      if (routerId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.routerMetrics(routerId, 24) });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    }
  }, [lastMessage, queryClient]);

  if (dashboardQuery.isPending) {
    return <PageLoader />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        description="The admin stats endpoint did not return a usable response. Retry after confirming the backend is reachable and your session is valid."
        onAction={() => void dashboardQuery.refetch()}
      />
    );
  }

  const { clients, wireguard, recent } = dashboardQuery.data;
  const users = dashboardQuery.data.users ?? { total: 0, active: 0, suspended: 0, trial: 0 };
  const routers = dashboardQuery.data.routers ?? { total: 0, online: 0, offline: 0, pending: 0 };
  const billing = dashboardQuery.data.billing ?? { monthlyRevenue: 0 };
  const incidents = dashboardQuery.data.incidents ?? { open: 0 };
  const support = dashboardQuery.data.support ?? { openTickets: 0 };
  const recentActivity = dashboardQuery.data.recentActivity ?? [];
  const featuredRouter = featuredRoutersQuery.data?.items?.find((router) => router.status === "active")
    ?? featuredRoutersQuery.data?.items?.[0]
    ?? null;

  const connectedPeers = wireguard.connected ?? 0;
  const tunnelHealth = clients.total > 0 ? Math.round((clients.enabled / clients.total) * 100) : 0;
  const routerHealth = routers.total > 0 ? Math.round((routers.online / routers.total) * 100) : 0;
  const subscriberHealth = users.total > 0 ? Math.round((users.active / users.total) * 100) : 0;

  const transferChartData = recent
    .filter((item) => item.transferRx > 0 || item.transferTx > 0)
    .map((item) => ({
      name: item.name.length > 12 ? `${item.name.slice(0, 12)}...` : item.name,
      rx: item.transferRx,
      tx: item.transferTx,
    }));

  const distributionBase = [
    { label: "Enabled", value: clients.enabled, color: "#38bdf8" },
    { label: "Disabled", value: clients.disabled, color: "#f97316" },
    { label: "Connected", value: connectedPeers, color: "#22c55e" },
  ];
  const distributionTotal = distributionBase.reduce((sum, item) => sum + item.value, 0);
  const distributionData = distributionBase.map((item) => ({
    ...item,
    percentLabel: distributionTotal > 0 ? `${Math.round((item.value / distributionTotal) * 100)}%` : "0%",
  }));

  const statusItems = [
    {
      label: "WireGuard Tunnel",
      value: wireguard.error ? "Degraded" : "Operational",
      tone: getStatusTone(!wireguard.error),
      online: !wireguard.error,
    },
    {
      label: "Router Fleet",
      value: routers.offline > 0 ? `${routers.offline} offline` : "All online",
      tone: getStatusTone(routers.offline === 0),
      online: routers.offline === 0,
    },
    {
      label: "Active Subscribers",
      value: `${users.active}`,
      tone: "info" as const,
      online: true,
    },
    {
      label: "Open Incidents",
      value: incidents.open > 0 ? `${incidents.open} open` : "None",
      tone: getStatusTone(incidents.open === 0),
      online: incidents.open === 0,
    },
    {
      label: "Support Queue",
      value: support.openTickets > 0 ? `${support.openTickets} tickets` : "Clear",
      tone: getStatusTone(support.openTickets === 0, true),
      online: support.openTickets === 0,
    },
  ];

  const kpiCards = [
    {
      title: "Total Subscribers",
      value: String(users.total),
      delta: `+${users.trial} on trial`,
      tone: "info" as const,
      path: appRoutes.usersAll,
      icon: Users,
    },
    {
      title: "Active Subscribers",
      value: String(users.active),
      delta: `${users.suspended} suspended`,
      tone: users.active > 0 ? ("success" as const) : ("warning" as const),
      path: appRoutes.usersActive,
      icon: TrendingUp,
    },
    {
      title: "Total Routers",
      value: String(routers.total),
      delta: `${routers.pending} pending setup`,
      tone: "info" as const,
      path: appRoutes.routersAll,
      icon: Router,
    },
    {
      title: "Online Routers",
      value: String(routers.online),
      delta: `${routers.offline} offline`,
      tone: routers.offline === 0 ? ("success" as const) : ("danger" as const),
      path: appRoutes.routersOnline,
      icon: Wifi,
    },
    {
      title: "VPN Peers Active",
      value: String(connectedPeers),
      delta: `${clients.enabled} enabled`,
      tone: connectedPeers > 0 ? ("success" as const) : ("warning" as const),
      path: appRoutes.vpnServersAll,
      icon: Shield,
    },
    {
      title: "Tunnel Health",
      value: `${tunnelHealth}%`,
      delta: `${clients.disabled} disabled`,
      tone: tunnelHealth >= 70 ? ("success" as const) : tunnelHealth > 0 ? ("warning" as const) : ("danger" as const),
      path: appRoutes.monitoringPeerHealth,
      icon: Activity,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(billing.monthlyRevenue),
      delta: "This calendar month",
      tone: "info" as const,
      path: appRoutes.billingOverview,
      icon: CreditCard,
    },
    {
      title: "Open Incidents",
      value: String(incidents.open),
      delta: `${support.openTickets} support tickets`,
      tone: incidents.open > 0 ? ("danger" as const) : ("success" as const),
      path: appRoutes.monitoringIncidentsAlerts,
      icon: AlertTriangle,
    },
  ];

  const quickActions: DashboardQuickAction[] = [
    {
      label: "Manage Routers",
      description: "Open the router fleet workspace.",
      icon: Router,
      path: appRoutes.routersAll,
      permission: permissions.routersView,
      tone: "info",
    },
    {
      label: "Offline Routers",
      description: "Review disconnected router nodes.",
      icon: WifiOff,
      path: appRoutes.routersOffline,
      permission: permissions.routersView,
      tone: "danger",
    },
    {
      label: "Active Users",
      description: "Open the active subscriber queue.",
      icon: Users,
      path: appRoutes.usersActive,
      permission: permissions.usersView,
      tone: "success",
    },
    {
      label: "Suspended",
      description: "Review suspended subscribers.",
      icon: UserX,
      path: appRoutes.usersSuspended,
      permission: permissions.usersView,
      tone: "warning",
    },
    {
      label: "Billing",
      description: "Open billing overview and revenue state.",
      icon: CreditCard,
      path: appRoutes.billingOverview,
      permission: permissions.billingView,
      tone: "info",
    },
    {
      label: "Incidents",
      description: "Jump into open monitoring incidents.",
      icon: AlertTriangle,
      path: appRoutes.monitoringIncidentsAlerts,
      permission: permissions.monitoringView,
      tone: "danger",
    },
    {
      label: "Support Queue",
      description: "Review open support tickets.",
      icon: LifeBuoy,
      path: appRoutes.supportTickets,
      permission: permissions.supportView,
      tone: "warning",
    },
    {
      label: "Audit Trail",
      description: "Open recent admin audit history.",
      icon: ScrollText,
      path: appRoutes.logsSecurityAudit,
      permission: permissions.logsView,
      tone: "neutral",
    },
  ];

  const timelineItems = recentActivity.length
    ? recentActivity.map((log) => ({
        title: log.action.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()),
        time: dayjs(log.createdAt).fromNow(),
        description: `${log.adminName} — ${log.resourceType}${log.resourceId ? ` #${log.resourceId.slice(-6)}` : ""}`,
      }))
    : recent.length
      ? recent.map((item) => ({
          title: item.name,
          time: item.lastHandshake ? dayjs(item.lastHandshake).fromNow() : "never seen",
          description: `RX ${formatBytes(item.transferRx)} / TX ${formatBytes(item.transferTx)}`,
        }))
      : [
          {
            title: "No recent activity",
            time: "waiting",
            description: "Recent admin actions and tunnel updates will appear here once the backend records them.",
          },
        ];

  const showBillingSection = can(user || undefined, permissions.billingView);
  const showMonitoringSection = can(user || undefined, permissions.monitoringView);
  const showLogsSection = can(user || undefined, permissions.logsView);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your ISP platform — routers, subscribers, billing, VPN, and system health."
        meta="Live command center"
      />

      <div className="flex flex-col gap-3 rounded-[24px] border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Badge tone={wireguard.error ? "danger" : connectedPeers > 0 ? "success" : "warning"}>
              {wireguard.error ? "Needs attention" : connectedPeers > 0 ? "Live" : "Idle"}
            </Badge>
            <span className="text-xs text-slate-400">Auto-refreshes every 30s</span>
          </div>
          {dashboardQuery.isFetching && !dashboardQuery.isPending ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Spinner className="h-3.5 w-3.5 border-[1.5px]" />
              <span>Refreshing...</span>
            </div>
          ) : null}
        </div>
        <RefreshButton loading={dashboardQuery.isFetching} onClick={() => void dashboardQuery.refetch()} />
      </div>

      <div className="flex flex-wrap gap-3 rounded-[24px] border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.5)] px-3 py-2">
            <span className={cn("h-2 w-2 rounded-full", item.online ? "bg-success animate-pulse" : item.tone === "warning" ? "bg-warning" : "bg-danger")} />
            <span className="text-xs font-medium text-slate-300">{item.label}</span>
            <span className={cn("text-xs", toneTextClass[item.tone])}>{item.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 2xl:grid-cols-8">
        {kpiCards.map((card) => (
          <Link key={card.title} to={card.path} className="group">
            <div className="flex h-full flex-col gap-2 rounded-[20px] border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 transition-colors hover:border-brand-500/40 hover:bg-[rgba(8,14,31,1)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">{card.title}</p>
                <div className="flex items-center gap-2">
                  <card.icon className="h-4 w-4 text-slate-500 transition-colors group-hover:text-brand-400" />
                  <ArrowRight className="h-4 w-4 text-slate-600 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-brand-300" />
                </div>
              </div>
              <p className={cn("text-2xl font-bold", toneTextClass[card.tone])}>{card.value}</p>
              <p className="text-xs text-slate-500">{card.delta}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
        <RouterStatusSummary isConnected={isConnected} />
        {featuredRouter ? (
          <TrafficChartCard routerId={featuredRouter.id} title={`Live Telemetry: ${featuredRouter.name}`} />
        ) : (
          <Card className="surface-card-3d overflow-hidden p-0">
            <div className="rounded-[24px] border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-4 md:p-5">
              <CardHeader>
                <div>
                  <CardTitle>Live Telemetry</CardTitle>
                  <CardDescription>Select or onboard a router to start collecting dashboard telemetry.</CardDescription>
                </div>
              </CardHeader>
              <div className="flex min-h-[288px] items-center justify-center">
                <EmptyState icon={Router} title="No router available" description="The live traffic chart appears once the platform has at least one router record." />
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AnalyticsChartCard
          title="Network Health"
          description="Routers, subscribers, and billing posture in one operational summary."
          action={<Badge tone="info">Platform</Badge>}
        >
          <div className="flex h-full flex-col justify-between gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Wifi, label: "Online Routers", value: routers.online, progress: routerHealth, tone: "success" as const },
                { icon: WifiOff, label: "Offline Routers", value: routers.offline, progress: routers.total > 0 ? Math.round((routers.offline / routers.total) * 100) : 0, tone: "danger" as const },
                { icon: Users, label: "Active Subscribers", value: users.active, progress: subscriberHealth, tone: "success" as const },
                { icon: UserX, label: "Suspended Subscribers", value: users.suspended, progress: users.total > 0 ? Math.round((users.suspended / users.total) * 100) : 0, tone: "warning" as const },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.75)] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="icon-block-primary rounded-2xl p-2 text-slate-100">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-slate-300">{item.label}</p>
                    </div>
                    <p className={cn("text-lg font-semibold", toneTextClass[item.tone])}>{item.value}</p>
                  </div>
                  <Progress value={item.progress} />
                </div>
              ))}
            </div>

            {showBillingSection ? (
              <div className="flex flex-col gap-4 rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.75)] p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Revenue this month</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(billing.monthlyRevenue)}</p>
                </div>
                <Link to={appRoutes.billingOverview} className="inline-flex items-center gap-2 text-sm font-medium text-brand-100 transition hover:text-white">
                  View billing <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </div>
        </AnalyticsChartCard>

        <Card className="surface-card-3d overflow-hidden p-0">
          <div className="rounded-[24px] border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-4 md:p-5">
            <CardHeader>
              <div>
                <CardTitle>WireGuard State</CardTitle>
                <CardDescription>Transport health, connected peers, and the latest tunnel details.</CardDescription>
              </div>
              <div className="icon-block-primary rounded-2xl p-2.5 text-slate-100">
                <Shield className="h-[18px] w-[18px]" />
              </div>
            </CardHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-100">Transport status</p>
                  <p className="text-sm text-slate-400">{wireguard.status || (wireguard.error ? "degraded" : "running")}</p>
                </div>
                <Badge tone={wireguard.error ? "danger" : "success"}>{wireguard.error ? "Issue detected" : "Operational"}</Badge>
              </div>

              {wireguard.error ? (
                <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                  <div className="mb-2 flex items-center gap-2 font-medium text-[#fecaca]">
                    <AlertTriangle className="h-4 w-4" />
                    WireGuard reported an issue
                  </div>
                  <p>{wireguard.error}</p>
                </div>
              ) : null}

              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Connected peers</p>
                <p className="mt-2 text-3xl font-semibold text-white">{connectedPeers}</p>
              </div>

              {(wireguard.details ?? []).length ? (
                <div className="grid gap-3">
                  {(wireguard.details ?? []).slice(0, 4).map((detail) => (
                    <div key={detail} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3 text-sm text-slate-300">
                      {detail}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[148px] items-center justify-center">
                  <EmptyState icon={Shield} title="No active tunnel details" description="Detailed peer tunnel state will appear here when the interface reports active sessions." />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <AnalyticsChartCard
          title="Transfer Traffic"
          description="RX / TX for recently active WireGuard peers"
          action={
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" /> RX</div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#7dd3fc]" /> TX</div>
            </div>
          }
        >
          {transferChartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState icon={Activity} title="No transfer data" description="As peers exchange traffic, RX and TX history will appear here." />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transferChartData} margin={{ top: 10, right: 12, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboard-rx-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="dashboard-tx-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(37,99,235,0.12)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(value) => formatBytes(Number(value))} />
                <Tooltip
                  cursor={{ stroke: "rgba(37,99,235,0.35)", strokeWidth: 1 }}
                  contentStyle={{ background: "rgba(8,14,31,0.9)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 18, color: "#e2e8f0" }}
                  formatter={(value: number, name: string) => [formatBytes(Number(value)), name.toUpperCase()]}
                />
                <Area type="monotone" dataKey="rx" stroke="#38bdf8" fill="url(#dashboard-rx-fill)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="tx" stroke="#7dd3fc" fill="url(#dashboard-tx-fill)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </AnalyticsChartCard>

        <Card className="surface-card-3d overflow-hidden p-0">
          <div className="rounded-[24px] border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-4 md:p-5">
            <CardHeader>
              <div>
                <CardTitle>Peer Distribution</CardTitle>
                <CardDescription>Enabled, disabled, and currently connected peers</CardDescription>
              </div>
              <Badge tone="info">Health {tunnelHealth}%</Badge>
            </CardHeader>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 18, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(37,99,235,0.12)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "rgba(8,14,31,0.9)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 18, color: "#e2e8f0" }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 4, 4]}>
                    {distributionData.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                    <LabelList dataKey="percentLabel" position="top" fill="#cbd5e1" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.75)] px-3 py-2 text-sm text-slate-300">Total {clients.total}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.75)] px-3 py-2 text-sm text-slate-300">Connected {connectedPeers}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.75)] px-3 py-2 text-sm text-slate-300">Health {tunnelHealth}%</div>
            </div>
          </div>
        </Card>
      </div>

      <div className={cn("grid gap-5", showLogsSection ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]" : "grid-cols-1")}>
        {showLogsSection ? (
          <Card className="surface-card-3d overflow-hidden p-0">
            <div className="rounded-[24px] border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-4 md:p-5">
              <CardHeader>
                <div>
                  <CardTitle>Recent Admin Activity</CardTitle>
                  <CardDescription>Latest privileged actions and platform activity entering the audit stream.</CardDescription>
                </div>
                <Badge tone="info">{recentActivity.length ? "Audit stream" : "Peer fallback"}</Badge>
              </CardHeader>

              <ActivityTimeline items={timelineItems} />

              <div className="mt-4">
                <Link to={appRoutes.logsSecurityAudit} className="inline-flex items-center gap-2 text-sm font-medium text-brand-100 transition hover:text-white">
                  View full audit trail <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
        ) : null}

        <Card className="surface-card-3d overflow-hidden p-0">
          <div className="rounded-[24px] border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-4 md:p-5">
            <CardHeader>
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump to the most common admin tasks</CardDescription>
              </div>
            </CardHeader>

            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className={cn(
                    "flex items-center gap-3 rounded-[16px] border border-brand-500/15 border-l-2 bg-[rgba(8,14,31,0.9)] px-3 py-3 transition-all hover:border-brand-500/40 hover:bg-[rgba(8,14,31,1)]",
                    toneBorderClass[action.tone],
                  )}
                >
                  <action.icon className={cn("h-4 w-4 flex-shrink-0", toneIconClass[action.tone])} />
                  <div className="min-w-0">
                    <span className="block text-sm font-medium text-slate-300">{action.label}</span>
                    <span className="block truncate text-xs text-slate-500">{action.description}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {(showBillingSection || showMonitoringSection) ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {showBillingSection ? (
            <Card className="surface-card-3d overflow-hidden p-0">
              <div className="rounded-[24px] border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-4 md:p-5">
                <CardHeader>
                  <div>
                    <CardTitle>Revenue Snapshot</CardTitle>
                    <CardDescription>Current month collections and subscriber monetization posture.</CardDescription>
                  </div>
                  <div className="icon-block-primary rounded-2xl p-2 text-slate-100">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </CardHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.75)] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Monthly revenue</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(billing.monthlyRevenue)}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.75)] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Trial users</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{users.trial}</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {showMonitoringSection ? (
            <Card className="surface-card-3d overflow-hidden p-0">
              <div className="rounded-[24px] border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-4 md:p-5">
                <CardHeader>
                  <div>
                    <CardTitle>Incident Focus</CardTitle>
                    <CardDescription>Operational issues and support load that need network attention.</CardDescription>
                  </div>
                  <div className="icon-block-primary rounded-2xl p-2 text-slate-100">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </CardHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.75)] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open incidents</p>
                    <p className={cn("mt-2 text-2xl font-semibold", incidents.open > 0 ? "text-danger" : "text-success")}>{incidents.open}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.75)] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Support queue</p>
                    <p className={cn("mt-2 text-2xl font-semibold", support.openTickets > 0 ? "text-warning" : "text-success")}>{support.openTickets}</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
