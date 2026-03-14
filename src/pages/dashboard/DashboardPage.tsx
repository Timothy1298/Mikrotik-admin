import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Router,
  Shield,
  Wifi,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsChartCard } from "@/components/data-display/AnalyticsChartCard";
import { ActivityTimeline } from "@/components/data-display/ActivityTimeline";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardStatGrid } from "@/features/dashboard/components";
import { useDashboardStats } from "@/features/dashboard/hooks";
import type { DashboardSummaryMetric } from "@/features/dashboard/types";

dayjs.extend(relativeTime);

export function DashboardPage() {
  const dashboardQuery = useDashboardStats();

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
  const connectedPeers = wireguard.connected ?? 0;
  const totalClients = clients.total || 0;
  const enabledClients = clients.enabled || 0;
  const disabledClients = clients.disabled || 0;
  const tunnelHealth = totalClients > 0 ? Math.round((enabledClients / totalClients) * 100) : 0;
  const incidentCount = wireguard.error ? 1 : 0;

  const summaryMetrics: DashboardSummaryMetric[] = [
    {
      title: "Active peers",
      value: String(connectedPeers),
      description: connectedPeers > 0 ? "Peers currently reporting to the WireGuard interface." : "No peers are connected right now.",
      tone: connectedPeers > 0 ? "success" : "warning",
      delta: `${enabledClients} enabled clients`,
    },
    {
      title: "Tunnel health",
      value: `${tunnelHealth}%`,
      description: "Based on enabled clients versus total provisioned clients.",
      tone: tunnelHealth >= 70 ? "success" : tunnelHealth > 0 ? "warning" : "danger",
      delta: `${disabledClients} disabled`,
    },
    {
      title: "Client fleet",
      value: String(totalClients),
      description: "Total WireGuard client records tracked by the backend.",
      tone: totalClients > 0 ? "info" : "neutral",
      delta: `${recent.length} recent updates`,
    },
    {
      title: "Open incidents",
      value: String(incidentCount),
      description: wireguard.error ? wireguard.error : "No transport errors reported.",
      tone: incidentCount > 0 ? "danger" : "success",
      delta: wireguard.status === "disabled" ? "WireGuard disabled" : "API health visible",
    },
  ];

  const transferChartData = recent.map((item) => ({
    name: item.name.length > 12 ? `${item.name.slice(0, 12)}...` : item.name,
    rx: Number((item.transferRx / (1024 * 1024)).toFixed(2)),
    tx: Number((item.transferTx / (1024 * 1024)).toFixed(2)),
  }));

  const distributionData = [
    { label: "Enabled", value: enabledClients, color: "#38bdf8" },
    { label: "Disabled", value: disabledClients, color: "#c4b5fd" },
    { label: "Connected", value: connectedPeers, color: "#7dd3fc" },
  ].filter((item) => item.value > 0 || totalClients === 0);

  const timelineItems = recent.length
    ? recent.map((item) => ({
        title: item.name,
        time: item.lastHandshake ? dayjs(item.lastHandshake).fromNow() : "never seen",
        description: `RX ${Math.round(item.transferRx / 1024)} KB / TX ${Math.round(item.transferTx / 1024)} KB`,
      }))
    : [
        {
          title: "No recent client telemetry",
          time: "waiting",
          description: "Client activity will appear here once the backend records handshakes and transfer counters.",
        },
      ];

  return (
    <section className="space-y-5 rounded-[28px] border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 sm:p-5 lg:p-6">
      <PageHeader
        title="Dashboard"
        description="Monitor VPN clients, tunnel status, router activity, and recent system changes from one view."
      />

      <div className="flex flex-col gap-3 rounded-[24px] border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="icon-block-primary rounded-2xl p-2.5 text-slate-100">
            <Wifi className="h-[18px] w-[18px]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">System status</p>
            <p className="mt-1 text-sm text-slate-400">Live dashboard data with manual refresh when needed.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={wireguard.error ? "danger" : connectedPeers > 0 ? "success" : "warning"}>
            {wireguard.error ? "Needs attention" : connectedPeers > 0 ? "Live" : "Idle"}
          </Badge>
          <RefreshButton loading={dashboardQuery.isFetching} onClick={() => void dashboardQuery.refetch()} />
        </div>
      </div>

      <DashboardStatGrid items={summaryMetrics} />

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <AnalyticsChartCard
          title="Transfer overview"
          description="Inbound and outbound traffic for recently updated clients."
          action={<Badge tone="info">Live stats</Badge>}
        >
          {transferChartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transferChartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="rxFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="txFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(37,99,235,0.12)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  cursor={{ stroke: "rgba(37,99,235,0.35)", strokeWidth: 1 }}
                  contentStyle={{ background: "rgba(8,14,31,0.9)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 18, color: "#e2e8f0" }}
                />
                <Area type="monotone" dataKey="rx" stroke="#38bdf8" fill="url(#rxFill)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="tx" stroke="#7dd3fc" fill="url(#txFill)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center"><EmptyState icon={Activity} title="No transfer metrics yet" description="As clients start exchanging traffic, this chart will visualize RX and TX movement." /></div>
          )}
        </AnalyticsChartCard>

        <div className="space-y-6">
          <Card className="surface-card-3d overflow-hidden p-0">
            <div className="rounded-[24px] border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-4 md:p-5">
              <CardHeader>
                <div>
                  <CardTitle>Fleet status</CardTitle>
                  <CardDescription>Enabled, disabled, and connected peer distribution.</CardDescription>
                </div>
                <div className="icon-block-primary rounded-2xl p-2.5 text-slate-100">
                  <Router className="h-[18px] w-[18px]" />
                </div>
              </CardHeader>
              <div className="h-64 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(37,99,235,0.12)" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "rgba(8,14,31,0.9)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 18, color: "#e2e8f0" }} />
                    <Bar dataKey="value" radius={[12, 12, 4, 4]}>
                      {distributionData.map((entry) => (
                        <Cell key={entry.label} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Card className="surface-card-3d overflow-hidden p-0">
            <div className="rounded-[24px] border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-4 md:p-5">
              <CardHeader>
                <div>
                  <CardTitle>WireGuard state</CardTitle>
                  <CardDescription>Current tunnel status and reported details.</CardDescription>
                </div>
                <div className="rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[linear-gradient(90deg,rgba(124,58,237,0.15),rgba(139,92,246,0.06))] p-2.5 text-warning">
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
                    <div className="mb-2 flex items-center gap-2 font-medium text-[#fecaca]"><AlertTriangle className="h-4 w-4" /> WireGuard reported an issue</div>
                    <p>{wireguard.error}</p>
                  </div>
                ) : null}
                <div className="grid gap-3 md:grid-cols-2">
                  {(wireguard.details || []).slice(0, 4).map((detail) => (
                    <div key={detail} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3 text-sm text-slate-300">
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.14fr)_minmax(300px,0.86fr)]">
        <AnalyticsChartCard
          title="Recent activity"
          description="Latest handshake and transfer updates from tracked clients."
          action={<RefreshButton loading={dashboardQuery.isFetching} onClick={() => void dashboardQuery.refetch()} />}
        >
          <ActivityTimeline items={timelineItems} />
        </AnalyticsChartCard>

        <Card className="surface-card-3d overflow-hidden p-0">
          <div className="rounded-[24px] border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] p-4 md:p-5">
            <CardHeader>
              <div>
                <CardTitle>Quick summary</CardTitle>
                <CardDescription>Keep the most important operational checks in one compact panel.</CardDescription>
              </div>
              <div className="icon-block-primary rounded-2xl p-2.5 text-slate-100">
                <RefreshCw className="h-[18px] w-[18px]" />
              </div>
            </CardHeader>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3">Monitor active peers, client totals, and tunnel health at a glance.</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3">Review traffic trends and recent client activity without leaving the page.</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3">Check WireGuard issues and fleet distribution from the side panels.</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3">Use refresh whenever you need the latest backend state.</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
