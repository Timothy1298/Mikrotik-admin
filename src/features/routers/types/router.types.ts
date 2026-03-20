export type RouterDirectoryStats = {
  totalRouters: number;
  onlineRouters: number;
  offlineRouters: number;
  pendingSetupRouters: number;
  failedProvisioningRouters: number;
  routersWithoutPorts: number;
  routersWithUnhealthyTunnelState: number;
  routersByServerNode: Record<string, number>;
  routersWithActiveAlerts: number;
};

export type RouterPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type RouterRow = {
  id: string;
  name: string;
  customer: {
    id: string;
    name: string;
    email: string;
    accountStatus: string;
    verificationStatus: string;
    routersOwned: number;
    supportState: string;
    subscriptionState: string;
  } | null;
  status: string;
  setupStatus: string;
  connectionStatus: string;
  vpnIp: string;
  serverNode: string;
  winboxPort: number | null;
  sshPort: number | null;
  apiPort: number | null;
  location: string | null;
  lastSeen: string | null;
  lastHandshake: string | null;
  healthSummary: {
    state: string;
    issues: string[];
  };
  createdAt: string;
  billingState: string;
  issueFlags: string[];
  unhealthy: boolean;
};

export type RouterDirectoryResponse = {
  items: RouterRow[];
  pagination: RouterPaginationMeta;
};

export type RouterDetail = {
  id: string;
  profile: {
    id: string;
    name: string;
    vpnIp: string;
    serverNode: string;
    status: string;
    setupStatus: string;
    connectionStatus: string;
    createdAt: string;
    updatedAt: string;
  };
  customer: RouterRow["customer"];
  accessPorts: {
    winbox: { publicPort: number | null; targetPort: number; allocationStatus: string; forwardingStatus: string };
    ssh: { publicPort: number | null; targetPort: number; allocationStatus: string; forwardingStatus: string };
    api: { publicPort: number | null; targetPort: number; allocationStatus: string; forwardingStatus: string };
    proxyStatus?: Record<string, unknown>;
  };
  connectivity: {
    peerId: string | null;
    peerEnabled: boolean;
    peerName: string | null;
    serverNode: string;
    vpnIp: string;
    allowedIPs: string[] | string;
    publicKeyFingerprint: string | null;
    tunnelStatus: string;
    lastHandshake: string | null;
    handshakeState: string;
    transferRx: number;
    transferTx: number;
    peerCreatedAt: string | null;
    configGenerationStatus: string;
    rekeyEligible: boolean;
    reconciliationState: string;
  };
  monitoring: {
    online: boolean;
    status: string;
    lastSeen: string | null;
    lastHandshake: string | null;
    handshakeState: string;
    transferRx: number;
    transferTx: number;
    uptime: string | null;
    cpuLoad: number | null;
    memoryUsage: number | null;
    totalMemory: number | null;
    freeMemory: number | null;
    firmware: string | null;
    lastTelemetryAt: string | null;
    staleTelemetry: boolean;
    health: {
      state: string;
      issues: string[];
    };
  };
  provisioning: {
    state: string;
    configGenerationStatus: string;
    provisioningError: string | null;
    assignedResources: {
      vpnIp: string;
      serverNode: string;
      ports?: { winbox?: number; ssh?: number; api?: number };
    };
    timestamps: {
      createdAt: string;
      setupGeneratedAt: string | null;
      firstConnectedAt: string | null;
      lastReconfiguredAt: string | null;
      provisioningReviewedAt: string | null;
    };
  };
  billing: {
    subscription: Record<string, unknown> | null;
    transactionsPreview: Array<Record<string, unknown>>;
  };
  issues: {
    status: string;
    issues: Array<{ code: string; severity: string; message: string }>;
    proxyStatus?: Record<string, unknown>;
    recommendedActions: string[];
  };
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
  notes: Array<{
    id?: string;
    body: string;
    category: string;
    pinned: boolean;
    author: string;
    createdAt: string;
  }>;
  flags: Array<{
    id?: string;
    flag: string;
    severity: string;
    description?: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type RouterQuery = {
  q?: string;
  status?: string;
  setupStatus?: string;
  connectionStatus?: string;
  serverNode?: string;
  ownerId?: string;
  billingState?: string;
  portsState?: string;
  handshakeState?: string;
  recentlyOffline?: string;
  unhealthyState?: string;
  flaggedState?: string;
  createdFrom?: string;
  createdTo?: string;
  lastSeenFrom?: string;
  lastSeenTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type RouterLiveHealth = {
  uptime: string | null;
  cpuLoad: number | null;
  freeMemory: number | null;
  totalMemory: number | null;
  freeHddSpace: number | null;
  boardName: string | null;
  routerosVersion: string | null;
  reachable: boolean;
  error?: string;
};

export type RouterInterface = {
  name: string;
  type: string;
  running: boolean;
  disabled: boolean;
  comment: string | null;
};

export type RouterPingResult = {
  reachable: boolean;
  packetsSent?: number;
  packetsReceived?: number;
  packetLoss?: number;
  avgRtt?: number;
  error?: string;
};

export type RouterCommandResult = {
  success: boolean;
  output?: string;
  error?: string;
};

export type CreateRouterPayload = {
  userId: string;
  name: string;
  serverNode?: string;
  reason?: string;
};

export type CreateRouterResponse = {
  id: string;
  name: string;
  vpnIp: string;
  ports: { winbox: number; ssh: number; api: number };
  status: string;
  wireguardConfig?: string;
};
