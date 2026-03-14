import { appRoutes } from "@/config/routes";
import type { RouterQuery } from "@/features/routers/types/router.types";

export type RouterManagementSection =
  | "all"
  | "online"
  | "offline"
  | "provisioning-queue"
  | "unhealthy-tunnels"
  | "port-mapping-issues"
  | "server-assignment"
  | "diagnostics-review"
  | "notes-flags";

export const routerManagementSections: Record<RouterManagementSection, {
  title: string;
  description: string;
  route: string;
  lockedFilters?: Partial<RouterQuery>;
  emptyTitle: string;
  emptyDescription: string;
}> = {
  all: {
    title: "All routers",
    description: "Search, filter, and operate across the full MikroTik fleet, including provisioning, tunnel health, public access, and customer impact.",
    route: appRoutes.routersAll,
    emptyTitle: "No routers found",
    emptyDescription: "No routers match the current filters.",
  },
  online: {
    title: "Online routers",
    description: "Focus on routers with current live connectivity, fresh handshakes, and active operational access.",
    route: appRoutes.routersOnline,
    lockedFilters: { connectionStatus: "online" },
    emptyTitle: "No online routers found",
    emptyDescription: "No connected routers match the current filters.",
  },
  offline: {
    title: "Offline routers",
    description: "Review routers that have gone offline or lost tunnel connectivity and assess customer impact quickly.",
    route: appRoutes.routersOffline,
    lockedFilters: { connectionStatus: "offline" },
    emptyTitle: "No offline routers found",
    emptyDescription: "No offline routers match the current filters.",
  },
  "provisioning-queue": {
    title: "Provisioning queue",
    description: "Track routers pending setup, awaiting first connection, or failing provisioning so onboarding does not stall.",
    route: appRoutes.routersProvisioningQueue,
    emptyTitle: "Provisioning queue is clear",
    emptyDescription: "No routers currently need provisioning review.",
  },
  "unhealthy-tunnels": {
    title: "Unhealthy tunnels",
    description: "Investigate stale handshakes, peer issues, and weak tunnel health before outages broaden.",
    route: appRoutes.routersUnhealthyTunnels,
    lockedFilters: { unhealthyState: "true" },
    emptyTitle: "No unhealthy tunnels found",
    emptyDescription: "No routers currently match the unhealthy tunnel filters.",
  },
  "port-mapping-issues": {
    title: "Port mapping issues",
    description: "Surface routers with missing or degraded public access mappings across Winbox, SSH, and API forwarding.",
    route: appRoutes.routersPortMappingIssues,
    lockedFilters: { portsState: "missing" },
    emptyTitle: "No port mapping issues found",
    emptyDescription: "All visible routers currently have assigned access ports.",
  },
  "server-assignment": {
    title: "Server assignment",
    description: "Inspect router placement by server node and understand operational exposure when infrastructure changes.",
    route: appRoutes.routersServerAssignment,
    emptyTitle: "No server assignment data found",
    emptyDescription: "No routers match the current server assignment filters.",
  },
  "diagnostics-review": {
    title: "Diagnostics & review",
    description: "Work through routers with derived issues, stale telemetry, provisioning mismatches, or manual review needs.",
    route: appRoutes.routersDiagnosticsReview,
    emptyTitle: "No diagnostics review items found",
    emptyDescription: "No routers currently require diagnostics review.",
  },
  "notes-flags": {
    title: "Notes / flags",
    description: "Track routers under investigation and the internal context captured through admin notes and flags.",
    route: appRoutes.routersNotesFlags,
    lockedFilters: { flaggedState: "true" },
    emptyTitle: "No flagged routers found",
    emptyDescription: "There are no flagged routers under the current filters.",
  },
};
