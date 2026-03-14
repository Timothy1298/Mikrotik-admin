import { appRoutes } from "@/config/routes";
import type { VpnServerQuery } from "@/features/vpn-servers/types/vpn-server.types";

export type VpnServerManagementSection =
  | "all"
  | "healthy"
  | "unhealthy"
  | "maintenance"
  | "overloaded"
  | "router-distribution"
  | "peer-health"
  | "traffic-load"
  | "diagnostics-review";

export const vpnServerManagementSections: Record<VpnServerManagementSection, {
  title: string;
  description: string;
  route: string;
  lockedFilters?: Partial<VpnServerQuery>;
  emptyTitle: string;
  emptyDescription: string;
}> = {
  all: {
    title: "All servers",
    description: "Search, filter, and operate across the full VPN infrastructure fleet with health, traffic, peer, and capacity context.",
    route: appRoutes.vpnServersAll,
    emptyTitle: "No VPN servers found",
    emptyDescription: "No VPN servers match the current filters.",
  },
  healthy: {
    title: "Healthy servers",
    description: "Focus on infrastructure nodes that are healthy, active, and not currently carrying operational warnings.",
    route: appRoutes.vpnServersHealthy,
    lockedFilters: { healthStatus: "healthy" },
    emptyTitle: "No healthy servers found",
    emptyDescription: "No healthy VPN servers match the current filters.",
  },
  unhealthy: {
    title: "Unhealthy servers",
    description: "Review degraded infrastructure, stale telemetry, and nodes currently affecting routers or peers.",
    route: appRoutes.vpnServersUnhealthy,
    lockedFilters: { healthStatus: "degraded" },
    emptyTitle: "No unhealthy servers found",
    emptyDescription: "No degraded VPN servers match the current filters.",
  },
  maintenance: {
    title: "Maintenance mode",
    description: "Track servers currently in maintenance and understand active router impact before clearing the state.",
    route: appRoutes.vpnServersMaintenance,
    lockedFilters: { maintenanceMode: "true" },
    emptyTitle: "No maintenance servers found",
    emptyDescription: "No VPN servers are currently in maintenance mode.",
  },
  overloaded: {
    title: "Overloaded servers",
    description: "Inspect nodes near or above capacity thresholds and prepare mitigation or router migration follow-up.",
    route: appRoutes.vpnServersOverloaded,
    lockedFilters: { overloaded: "true" },
    emptyTitle: "No overloaded servers found",
    emptyDescription: "No VPN servers are currently above the configured overload threshold.",
  },
  "router-distribution": {
    title: "Router distribution",
    description: "Understand how routers are distributed across servers and where outages or imbalance create impact.",
    route: appRoutes.vpnServersRouterDistribution,
    emptyTitle: "No router distribution data found",
    emptyDescription: "No VPN servers match the current router distribution filters.",
  },
  "peer-health": {
    title: "Peer health",
    description: "Focus on server-level peer and handshake conditions to understand tunnel health beyond node labels.",
    route: appRoutes.vpnServersPeerHealth,
    emptyTitle: "No peer health issues found",
    emptyDescription: "No VPN servers currently match the peer health filters.",
  },
  "traffic-load": {
    title: "Traffic & load",
    description: "Review traffic concentration, peer totals, and capacity load to prioritize infrastructure actions.",
    route: appRoutes.vpnServersTrafficLoad,
    emptyTitle: "No traffic or load items found",
    emptyDescription: "No VPN servers match the current traffic and load filters.",
  },
  "diagnostics-review": {
    title: "Diagnostics & review",
    description: "Work through derived infrastructure warnings, stale state, and manual review items across the server fleet.",
    route: appRoutes.vpnServersDiagnosticsReview,
    emptyTitle: "No diagnostics review items found",
    emptyDescription: "No VPN servers currently require diagnostics review.",
  },
};
