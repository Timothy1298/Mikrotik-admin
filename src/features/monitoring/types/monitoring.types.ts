import type { RouterRow } from "@/features/routers/types/router.types";
import type { VpnServerRow } from "@/features/vpn-servers/types/vpn-server.types";

export type MonitoringOverview = {
  routers: {
    total: number;
    online: number;
    offline: number;
    unhealthy: number;
    pendingSetup: number;
    failedProvisioning: number;
    staleTelemetry: number;
    missingPorts: number;
    brokenAccessMappings: number;
  };
  vpnServers: {
    total: number;
    healthy: number;
    unhealthy: number;
    overloaded: number;
    maintenance: number;
    staleTelemetry: number;
  };
  peers: {
    total: number;
    active: number;
    stale: number;
  };
  impact: {
    affectedUsers: number;
    openIncidents: number;
    acknowledgedIncidents: number;
  };
  lastMonitoringSyncAt: string;
};

export type MonitoringTrendPoint = {
  timestamp: string;
  incidentsOpened?: number;
  incidentsResolved?: number;
  routersCreated?: number;
  routersConnected?: number;
  setupRequested?: number;
  setupCompleted?: number;
  provisioningFailures?: number;
  totalTransferRx?: number;
  totalTransferTx?: number;
  totalTransferBytes?: number;
};

export type MonitoringTrends = {
  window: string;
  supportedSeries?: string[];
  supported?: boolean;
  reason?: string;
  series: MonitoringTrendPoint[];
};

export type MonitoringDiagnostics = {
  status: string;
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    openIncidents: number;
  };
  issues: MonitoringDiagnosticItem[];
};

export type MonitoringDiagnosticItem = {
  code: string;
  severity: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  message: string;
};

export type MonitoringActivityItem = {
  id: string;
  type: string;
  source: string;
  severity: string;
  summary: string;
  timestamp: string;
  actor?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  resource?: {
    type: string;
    id: string;
    name: string | null;
  } | null;
  metadata?: Record<string, unknown>;
};

export type MonitoringPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type MonitoringListResponse<T> = {
  items: T[];
  pagination: MonitoringPaginationMeta;
};

export type RouterHealthSummary = {
  totalRouters: number;
  byStatus: Record<string, number>;
  bySetupState: Record<string, number>;
  staleHandshakeRouters: number;
  noHandshakeRouters: number;
  staleTelemetryRouters: number;
  missingPortsRouters: number;
  unhealthyRouters: number;
  byServer: Record<string, number>;
};

export type VpnServerHealthSummary = {
  totalServers: number;
  healthyServers: number;
  unhealthyServers: number;
  maintenanceServers: number;
  overloadedServers: number;
  staleServers: number;
  totalPeers: number;
  totalRouters: number;
  topImpactServers: Array<{
    id: string;
    nodeId: string;
    name: string;
    affectedRouters: number;
    healthStatus: string;
  }>;
};

export type PeerHealthSummary = {
  totalPeers: number;
  activePeers: number;
  stalePeers: number;
  peersWithNoHandshake: number;
  disabledPeers: number;
  unlinkedRouters: number;
  totalTransferRx: number;
  totalTransferTx: number;
};

export type MonitoringPeerRow = {
  id: string;
  peerName: string | null;
  router: { id: string; name: string };
  user?: { id: string; name: string | null; email: string | null } | null;
  enabled: boolean;
  handshakeState: string;
  lastHandshake: string | null;
  transferRx: number;
  transferTx: number;
  serverNode?: string;
  issues?: string[];
};

export type TrafficSummary = {
  totalTransferRx: number;
  totalTransferTx: number;
  totalTransferBytes: number;
  topRouters: TrafficRouterRow[];
  topServers: TrafficServerRow[];
};

export type TrafficRouterRow = {
  id: string;
  name: string;
  user: { id: string; name: string | null; email: string | null } | null;
  serverNode: string;
  transferRx: number;
  transferTx: number;
  totalTransferBytes: number;
};

export type TrafficServerRow = {
  nodeId: string;
  transferRx: number;
  transferTx: number;
  totalTransferBytes: number;
};

export type CustomerImpactSummary = {
  affectedUsers: number;
  customersWithOfflineRouters: number;
  customersWithProvisioningFailures: number;
  customersAffectedByServerIssues: number;
  topAffectedCustomers: AffectedCustomerRow[];
};

export type AffectedCustomerRow = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    isActive: boolean | null;
  };
  offlineRouters: number;
  unhealthyRouters: number;
  failedProvisioningRouters: number;
  staleRouters: number;
  affectedByServer: boolean;
};

export type ProvisioningSummary = {
  totalRouters: number;
  pendingSetup: number;
  awaitingFirstHandshake: number;
  setupSucceeded: number;
  provisioningFailures: number;
  averageSetupCompletionMinutes: number | null;
};

export type MonitoringIncidentNote = {
  id: string;
  body: string;
  author: string;
  category: string;
  createdAt: string;
};

export type MonitoringIncident = {
  id: string;
  incidentKey: string;
  source: string;
  sourceType: string;
  type: string;
  severity: string;
  status: string;
  title: string;
  summary: string;
  impact: {
    affectedRouters: number;
    affectedUsers: number;
  };
  relatedUser: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  relatedRouter: {
    id: string;
    name: string | null;
    status: string | null;
  } | null;
  relatedServer: {
    id: string;
    name: string | null;
    nodeId: string | null;
  } | null;
  relatedPeer: {
    id: string;
    name: string | null;
    enabled: boolean | null;
  } | null;
  metadata: Record<string, unknown>;
  firstDetectedAt: string;
  lastSeenAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  notes: MonitoringIncidentNote[];
};

export type MonitoringSection =
  | "router-health"
  | "vpn-server-health"
  | "peer-health"
  | "traffic-bandwidth"
  | "customer-impact"
  | "provisioning-analytics"
  | "incidents-alerts"
  | "diagnostics"
  | "activity-feed";

export type MonitoringFilterState = {
  q?: string;
  status?: string;
  severity?: string;
  source?: string;
  type?: string;
  window?: string;
  page?: number;
  limit?: number;
};

export type MonitoringDetailItem =
  | { kind: "incident"; item: MonitoringIncident }
  | { kind: "diagnostic"; item: MonitoringDiagnosticItem }
  | { kind: "activity"; item: MonitoringActivityItem }
  | { kind: "router"; item: RouterRow }
  | { kind: "vpn-server"; item: VpnServerRow }
  | { kind: "peer"; item: MonitoringPeerRow }
  | { kind: "customer"; item: AffectedCustomerRow }
  | { kind: "traffic-router"; item: TrafficRouterRow }
  | { kind: "traffic-server"; item: TrafficServerRow };
