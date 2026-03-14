import { Activity, AlertTriangle, Router, Server, ShieldAlert, Users } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import type { VpnServerStats } from "@/features/vpn-servers/types/vpn-server.types";

export function VpnServerStatsRow({ stats }: { stats: VpnServerStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total servers" value={String(stats.totalServers)} description="Infrastructure nodes currently registered in the VPN fleet." icon={Server} tone="info" />
      <StatCard title="Healthy servers" value={String(stats.healthyServers)} description="Servers with healthy state and no current operational degradation." icon={Activity} tone="success" />
      <StatCard title="Unhealthy servers" value={String(stats.unhealthyServers)} description="Servers currently degraded, stale, or affecting operational health." icon={AlertTriangle} tone="danger" />
      <StatCard title="Maintenance servers" value={String(stats.maintenanceServers)} description="Servers intentionally isolated for maintenance or infrastructure work." icon={ShieldAlert} tone="warning" />
      <StatCard title="Overloaded servers" value={String(stats.overloadedServers)} description="Servers near or above configured capacity thresholds." icon={AlertTriangle} tone="warning" />
      <StatCard title="Total peers" value={String(stats.totalPeers)} description="Peer footprint currently attached across the VPN infrastructure." icon={Users} tone="neutral" />
      <StatCard title="Attached routers" value={String(stats.totalRoutersAttached)} description="Managed routers currently assigned across the server fleet." icon={Router} tone="info" />
      <StatCard title="Review pressure" value={String(stats.serversWithIncidents)} description="Servers with flags, incidents, or diagnostics issues requiring attention." icon={ShieldAlert} tone="danger" />
    </div>
  );
}
