import { appRoutes } from "@/config/routes";
import type { MonitoringSection } from "@/features/monitoring/types/monitoring.types";

export const monitoringSections: Record<MonitoringSection, { title: string; description: string; route: string; emptyTitle: string; emptyDescription: string }> = {
  "router-health": {
    title: "Router Health",
    description: "Platform-wide router reachability, stale handshake, provisioning failure, and operational issue visibility.",
    route: appRoutes.monitoringRouterHealth,
    emptyTitle: "No unhealthy routers found",
    emptyDescription: "The current monitoring filters did not return any router health issues.",
  },
  "vpn-server-health": {
    title: "VPN Server Health",
    description: "Operational health, maintenance state, capacity pressure, and stale telemetry across VPN nodes.",
    route: appRoutes.monitoringVpnServerHealth,
    emptyTitle: "No unhealthy VPN servers found",
    emptyDescription: "The current monitoring filters did not return any server issues.",
  },
  "peer-health": {
    title: "Peer / Tunnel Health",
    description: "WireGuard peer freshness, disabled peers, stale handshakes, and tunnel health impact.",
    route: appRoutes.monitoringPeerHealth,
    emptyTitle: "No unhealthy peers found",
    emptyDescription: "No stale or unhealthy peers matched the current filters.",
  },
  "traffic-bandwidth": {
    title: "Traffic & Bandwidth",
    description: "Current traffic distribution, top routers, top servers, and aggregate transfer visibility.",
    route: appRoutes.monitoringTrafficBandwidth,
    emptyTitle: "No traffic records found",
    emptyDescription: "Traffic counters are not currently available for the selected filters.",
  },
  "customer-impact": {
    title: "Customer Impact",
    description: "Customers currently affected by router outages, provisioning failures, or unhealthy VPN infrastructure.",
    route: appRoutes.monitoringCustomerImpact,
    emptyTitle: "No affected customers found",
    emptyDescription: "No impacted customers matched the selected criteria.",
  },
  "provisioning-analytics": {
    title: "Provisioning Analytics",
    description: "Router onboarding throughput, queue pressure, awaiting first handshake, and provisioning failure visibility.",
    route: appRoutes.monitoringProvisioningAnalytics,
    emptyTitle: "No provisioning issues found",
    emptyDescription: "No provisioning failures or setup backlog items matched the selected filters.",
  },
  "incidents-alerts": {
    title: "Incidents & Alerts",
    description: "Open, acknowledged, and resolved incidents with operational impact and action workflows.",
    route: appRoutes.monitoringIncidentsAlerts,
    emptyTitle: "No incidents found",
    emptyDescription: "There are no incidents matching the current filter set.",
  },
  diagnostics: {
    title: "Diagnostics",
    description: "Derived system consistency issues, missing assignments, stale telemetry, and infrastructure mismatches.",
    route: appRoutes.monitoringDiagnostics,
    emptyTitle: "No diagnostics issues found",
    emptyDescription: "No derived diagnostics issues currently require attention.",
  },
  "activity-feed": {
    title: "Activity Feed",
    description: "Recent operational activity across routers, incidents, support signals, and admin actions.",
    route: appRoutes.monitoringActivityFeed,
    emptyTitle: "No activity found",
    emptyDescription: "There are no activity events matching the current filters.",
  },
};
