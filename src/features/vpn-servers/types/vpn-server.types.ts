export type VpnServerStats = {
  totalServers: number;
  healthyServers: number;
  unhealthyServers: number;
  disabledServers: number;
  maintenanceServers: number;
  overloadedServers: number;
  totalPeers: number;
  totalRoutersAttached: number;
  serversWithIncidents: number;
  serversWithStaleTelemetry: number;
};

export type VpnServerPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type VpnServerRow = {
  id: string;
  nodeId: string;
  name: string;
  region: string;
  hostname: string | null;
  endpoint: string | null;
  status: string;
  enabled: boolean;
  maintenanceMode: boolean;
  healthSummary: {
    status: string;
    staleTelemetry: boolean;
    issues: string[];
    load: {
      peerCount: number;
      activePeerCount: number;
      routerCount: number;
      onlineRouters: number;
      offlineRouters: number;
      maxPeers: number | null;
      maxRouters: number | null;
      peerUtilization: number | null;
      routerUtilization: number | null;
      overloaded: boolean;
      nearCapacity: boolean;
    };
  };
  activePeerCount: number;
  routerCount: number;
  onlineRouterCount: number;
  offlineRouterCount: number;
  bandwidthSummary: {
    totalTransferRx: number;
    totalTransferTx: number;
    totalTransferBytes: number;
    activePeerCount: number;
    totalPeerCount: number;
  };
  loadCapacitySummary: VpnServerRow["healthSummary"]["load"];
  lastHeartbeatAt: string | null;
  createdAt: string;
  issueFlags: string[];
};

export type VpnServerDirectoryResponse = {
  items: VpnServerRow[];
  pagination: VpnServerPaginationMeta;
};

export type VpnServerDetail = {
  id: string;
  profile: {
    id: string;
    nodeId: string;
    name: string;
    region: string;
    hostname: string | null;
    endpoint: string | null;
    controlMode: string;
    status: string;
    enabled: boolean;
    maintenanceMode: boolean;
    createdAt: string;
    updatedAt: string;
  };
  health: VpnServerRow["healthSummary"];
  loadCapacity: VpnServerRow["healthSummary"]["load"];
  traffic: VpnServerRow["bandwidthSummary"];
  attachedRoutersCount: number;
  attachedPeersCount: number;
  onlineRoutersCount: number;
  offlineRoutersCount: number;
  recentActivity: Array<{
    id: string;
    type: string;
    source: string;
    actor: string;
    action?: string;
    summary: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
  }>;
  recentIssues: Array<{ code: string; severity: string; message: string }>;
  lastHeartbeatAt: string | null;
  notes: Array<{ id?: string; body: string; category: string; pinned: boolean; author: string; createdAt: string }>;
  flags: Array<{ id?: string; flag: string; severity: string; description?: string; createdBy: string; createdAt: string }>;
};

export type VpnServerRouterItem = {
  id: string;
  name: string;
  customer: { id: string; name: string; email: string } | null;
  status: string;
  vpnIp: string;
  lastSeen: string | null;
  lastHandshake: string | null;
  publicPorts: { winbox?: number; ssh?: number; api?: number };
  provisioningState: string;
};

export type VpnServerPeerItem = {
  id: string;
  reference: string;
  enabled: boolean;
  health: string;
  transferRx: number;
  transferTx: number;
  lastHandshake: string | null;
  router: { id: string; name: string; vpnIp: string } | null;
};

export type VpnServerQuery = {
  q?: string;
  enabled?: string;
  status?: string;
  healthStatus?: string;
  maintenanceMode?: string;
  overloaded?: string;
  region?: string;
  hasIncidents?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type VpnServerActivityItem = {
  id: string;
  type: string;
  source: string;
  actor: string;
  action?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
};

export type VpnServerTrafficDetail = {
  serverId: string;
  totalTransferRx?: number;
  totalTransferTx?: number;
  totalTransferBytes?: number;
  activePeerCount?: number;
  totalPeerCount?: number;
  peerUtilization?: number | null;
  routerUtilization?: number | null;
  trafficByPeer?: Array<{
    peerId: string;
    reference: string;
    transferRx: number;
    transferTx: number;
    lastHandshake: string | null;
  }>;
};

export type VpnServerDiagnosticsResult = {
  serverId: string;
  issues: Array<{ code: string; severity: string; message: string; context?: Record<string, unknown> }>;
  recommendedActions: string[];
  healthChecks: Array<{ check: string; passed: boolean; detail?: string }>;
  generatedAt: string;
};

export type VpnServerHealthDetail = {
  status: string;
  staleTelemetry: boolean;
  issues: string[];
  load: {
    peerCount: number;
    activePeerCount: number;
    routerCount: number;
    onlineRouters: number;
    offlineRouters: number;
    maxPeers: number | null;
    maxRouters: number | null;
    peerUtilization: number | null;
    routerUtilization: number | null;
    overloaded: boolean;
    nearCapacity: boolean;
  };
  lastHeartbeatAt?: string | null;
  generatedAt?: string | null;
};
