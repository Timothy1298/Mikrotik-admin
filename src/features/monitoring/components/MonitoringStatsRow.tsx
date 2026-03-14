import { Activity, AlertTriangle, Router, Server, Users, Wifi } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import type { MonitoringOverview } from "@/features/monitoring/types/monitoring.types";

export function MonitoringStatsRow({ overview }: { overview: MonitoringOverview }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <StatCard title="Routers" value={String(overview.routers.total)} description="Total routers currently visible in platform telemetry." icon={Router} tone="neutral" />
      <StatCard title="Offline routers" value={String(overview.routers.offline)} description="Routers currently offline or recently unreachable." icon={Wifi} tone="danger" />
      <StatCard title="Unhealthy routers" value={String(overview.routers.unhealthy)} description="Routers with handshake, setup, telemetry, or access issues." icon={AlertTriangle} tone="warning" />
      <StatCard title="VPN servers" value={String(overview.vpnServers.total)} description="Servers currently carrying platform router and peer traffic." icon={Server} tone="info" />
      <StatCard title="Open incidents" value={String(overview.impact.openIncidents)} description="Open operational incidents requiring acknowledgment or resolution." icon={Activity} tone="danger" />
      <StatCard title="Affected users" value={String(overview.impact.affectedUsers)} description="Users currently impacted by live operational issues." icon={Users} tone="warning" />
    </div>
  );
}
