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
  connectionMode?: "wireguard" | "management_only";
  setupStatus: string;
  connectionStatus: string;
  vpnIp: string | null;
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
  apiConnectivity: {
    username: string;
    apiPort: number;
    hasPassword: boolean;
    hasCredentials: boolean;
    routerosVersion: string | null;
    lastSuccessAt: string | null;
    lastErrorAt: string | null;
    lastError: string | null;
    state: "healthy" | "failing" | "pending" | "unconfigured";
  };
  ownerTunnel?: {
    source: string;
    sourceRouterId: string;
    sourceRouterName: string | null;
    peerId: string;
    peerName: string | null;
    peerEnabled: boolean;
    serverNode: string;
    vpnIp: string | null;
    publicKeyFingerprint: string | null;
    lastHandshake: string | null;
    handshakeState: string;
    transferRx: number;
    transferTx: number;
    tunnelStatus: string;
    peerCreatedAt: string | null;
  } | null;
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
    vpnIp: string | null;
    connectionMode?: "wireguard" | "management_only";
    serverNode: string;
    status: string;
    setupStatus: string;
    connectionStatus: string;
    localAddress: string | null;
    hostname: string | null;
    macAddress: string | null;
    discoverySource: string | null;
    openPorts: number[];
    boardName: string | null;
    model: string | null;
    serialNumber: string | null;
    routerosVersion: string | null;
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
    connectionMode?: "wireguard" | "management_only";
    peerId: string | null;
    peerEnabled: boolean;
    peerName: string | null;
    serverNode: string;
    vpnIp: string | null;
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
    ownerTunnel?: {
      source: string;
      sourceRouterId: string;
      sourceRouterName: string | null;
      peerId: string;
      peerName: string | null;
      peerEnabled: boolean;
      serverNode: string;
      vpnIp: string | null;
      publicKeyFingerprint: string | null;
      lastHandshake: string | null;
      handshakeState: string;
      transferRx: number;
      transferTx: number;
      tunnelStatus: string;
      peerCreatedAt: string | null;
    } | null;
  };
  discovery: {
    localAddress: string | null;
    subnet: string | null;
    hostname: string | null;
    macAddress: string | null;
    source: string | null;
    openPorts: number[];
    importedAt: string | null;
  };
  apiAccess: RouterRow["apiConnectivity"];
  pingHistory: RouterPingResult[];
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
    ownerTunnel?: RouterDetail["connectivity"]["ownerTunnel"];
  };
  wireguard: {
    mode: "owner_tunnel" | "router_tunnel";
    available: boolean;
    primaryTunnel: {
      source: string;
      sourceRouterId: string;
      sourceRouterName: string | null;
      peerId: string;
      peerName: string | null;
      peerEnabled: boolean;
      serverNode: string;
      vpnIp: string | null;
      publicKeyFingerprint: string | null;
      lastHandshake: string | null;
      handshakeState: string;
      transferRx: number;
      transferTx: number;
      tunnelStatus: string;
      peerCreatedAt: string | null;
      interfaceName?: string | null;
      endpoint?: string | null;
      allowedIPs?: string | string[] | null;
      persistentKeepalive?: number | null;
    } | null;
    trackingSource?: {
      sourceRouterId: string;
      sourceRouterName: string | null;
      peerPublicKey: string | null;
      peerName: string | null;
      allowedAddress: string | null;
      endpoint: string | null;
      reason: string | null;
    } | null;
    sharedDevices: Array<{
      routerId: string;
      routerName: string | null;
      connectionMode: "wireguard" | "management_only";
      status: string;
      serverNode: string;
      vpnIp: string | null;
      peerName: string | null;
      peerEnabled: boolean;
      lastHandshake: string | null;
      handshakeState: string;
      tunnelStatus: string;
      transferRx: number;
      transferTx: number;
      sourceRouterId: string | null;
      sourceRouterName: string | null;
    }>;
    sharedDeviceCount: number;
    runtime?: {
      available: boolean;
      interfaces: Array<{
        id: string | null;
        name: string | null;
        listenPort: number | null;
        mtu: number | null;
        privateKeyConfigured: boolean;
        publicKey: string | null;
        disabled: boolean;
        running: boolean;
      }>;
      peers: Array<{
        id: string | null;
        interface: string | null;
        publicKey: string | null;
        endpointAddress: string | null;
        endpointPort: number | null;
        currentEndpointAddress: string | null;
        currentEndpointPort: number | null;
        allowedAddress: string | null;
        persistentKeepalive: number | null;
        lastHandshake: string | null;
        rx: number;
        tx: number;
        disabled: boolean;
        trackedDeviceCount?: number;
        trackedDevices?: Array<{
          routerId: string;
          routerName: string | null;
          connectionMode: "wireguard" | "management_only";
          status: string;
          serverNode: string;
          vpnIp: string | null;
          localAddress: string | null;
          hostname: string | null;
          source: string | null;
          lastSeen: string | null;
          sourceRouterId?: string | null;
          sourceRouterName?: string | null;
        }>;
        trackingMarker?: string | null;
      }>;
      error: string | null;
    } | null;
  };
  downstreamDiscovery?: RouterDownstreamDiscoveryRun | null;
  provisioning: {
    state: string;
    configGenerationStatus: string;
    provisioningError: string | null;
    assignedResources: {
      vpnIp: string | null;
      localAddress: string | null;
      serverNode: string;
      openPorts: number[];
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
  target?: string;
  error?: string;
  actor?: string;
  createdAt?: string;
};

export type RouterCommandResult = {
  success: boolean;
  output?: string;
  error?: string;
};

export type TrackRuntimePeerResult = {
  id: string;
  name: string;
  connectionMode?: "wireguard" | "management_only";
  status: string;
};

export type RouterDownstreamDiscoveryRun = {
  id: string;
  parentRouterId: string;
  status: "running" | "completed" | "failed";
  dryRun: boolean;
  timestamp: string;
  startedAt: string;
  completedAt: string | null;
  sourceTunnelIp: string | null;
  sourceRouterIdentity: string | null;
  sourceRouterVersion: string | null;
  discoveryMethodUsed: string[];
  candidateSubnets: string[];
  previewTargets: Array<{
    ipAddress: string;
    sourceMethod: string[];
    candidateSubnet: string | null;
    priority: number;
    evidence: string[];
  }>;
  candidateSubnetCount: number;
  probedTargetCount: number;
  discoveredRouterCount: number;
  partialVisibility: boolean;
  warnings: string[];
  errors: string[];
  discoveredRouters: Array<{
    ipAddress: string;
    identity: string | null;
    platform: string | null;
    vendor: string | null;
    confidence: "high" | "medium" | "low";
    evidence: string[];
    sourceMethod: string[];
    reachable: boolean;
    apiReachable: boolean;
    sshReachable: boolean;
    winboxReachable: boolean;
    rosVersion: string | null;
    macAddress: string | null;
    interfaceContext: string | null;
    viaRouter: {
      routerId: string | null;
      routerName: string | null;
    } | null;
    candidateSubnet: string | null;
    notes: string | null;
    adoptedRouterId: string | null;
    lastSeenAt: string | null;
  }>;
};

export type RouterApiConnectionTest = {
  resource: {
    cpuLoad: number | null;
    freeMemory: number | null;
    totalMemory: number | null;
    uptime: string | null;
    boardName: string | null;
    version: string | null;
    platform: string | null;
    architectureName: string | null;
    freeHddSpace: number | null;
    totalHddSpace: number | null;
    memoryUsage: number | null;
  };
  interfaces: Array<{
    name: string;
    type: string;
    running: boolean;
    disabled: boolean;
    rxBytes: number;
    txBytes: number;
  }>;
  testedAt: string;
};

export type RouterMetricPoint = {
  routerId: string;
  timestamp: string;
  cpuLoad: number | null;
  memUsedBytes: number | null;
  memTotalBytes: number | null;
  uptime: string | null;
  interfaces: Array<{
    name: string;
    rxBps: number;
    txBps: number;
    running: boolean;
  }>;
  collectionMethod: string;
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
  vpnIp: string | null;
  ports: { winbox: number | null; ssh: number | null; api: number | null };
  status: string;
  connectionMode?: "wireguard" | "management_only";
  wireguardConfig?: string;
};

export type RouterSetupArtifacts = {
  routerId: string;
  generatedAt: string;
  wireguardConfig: string;
  mikrotikScript: string;
  connectivity: {
    endpoint: string;
    serverPublicKey: string;
    allowedIps: string[];
    dns: string[];
  };
};

export type RouterOnboardingClaim = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  requestedName: string;
  serverNode: string;
  reason: string;
  expectedAddressHint: string | null;
  status: "pending" | "claimed" | "adopted" | "cancelled" | "expired";
  expiresAt: string;
  claimedAt: string | null;
  adoptedAt: string | null;
  cancelledAt: string | null;
  provisionedRouterId: string | null;
  detected: {
    sourceIp: string | null;
    userAgent: string | null;
    identity: string | null;
    boardName: string | null;
    serialNumber: string | null;
    routerosVersion: string | null;
    wanIp: string | null;
    lanIp: string | null;
    lastSeenAt: string | null;
    matchedExpectedAddress: boolean | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type RouterOnboardingClaimPayload = {
  userId: string;
  name: string;
  serverNode?: string;
  reason?: string;
  expectedAddressHint?: string;
  expiresInHours?: number;
};

export type RouterOnboardingClaimCreateResponse = {
  claim: RouterOnboardingClaim;
  token: string;
  callbackUrl: string;
  bootstrapScript: string;
};

export type RouterDiscoveryCandidateVerification = {
  status: "unverified" | "verified" | "failed" | "unsupported" | "duplicate" | "imported";
  method: string | null;
  verifiedAt: string | null;
  expiresAt: string | null;
  metadata: {
    identity: string | null;
    boardName: string | null;
    serialNumber: string | null;
    routerosVersion: string | null;
    firmware: string | null;
    model: string | null;
    macAddress: string | null;
    interfaceCount: number;
    interfaces: Array<{
      name: string;
      type: string;
      running: boolean;
      disabled: boolean;
      comment: string;
    }>;
    raw?: Record<string, unknown> | null;
  } | null;
  readiness: {
    status: "ready" | "warning" | "blocked";
    reasons: string[];
    apiReachable: boolean;
    sshReachable: boolean;
    winboxReachable: boolean;
    wireGuardReady: boolean;
    duplicateRouterId: string | null;
  } | null;
  error: string | null;
};

export type RouterDiscoveryCandidate = {
  id: string;
  ipAddress: string;
  subnet: string | null;
  hostname: string | null;
  macAddress: string | null;
  vendor: string | null;
  openPorts: number[];
  detectedServices: string[];
  isLikelyMikrotik: boolean;
  confidence: number;
  discoverySource: string;
  scannedAt: string;
  verification: RouterDiscoveryCandidateVerification | null;
  importedRouterId: string | null;
  importedAt: string | null;
};

export type RouterDiscoverySession = {
  id: string;
  source: "server" | "agent";
  status: "pending" | "scanning" | "completed" | "failed" | "expired";
  requestedSubnet: string | null;
  scannedSubnets: string[];
  hostCountScanned: number;
  candidateCount: number;
  truncatedReason: string | null;
  reason: string;
  error: string | null;
  truncated: boolean;
  scanStartedAt: string;
  scanCompletedAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  candidates: RouterDiscoveryCandidate[];
};

export type RouterDiscoveryScanPayload = {
  subnet?: string;
  reason?: string;
};

export type RouterDiscoveryVerifyPayload = {
  sessionId: string;
  candidateId: string;
  username: string;
  password: string;
  method?: "auto" | "ssh" | "api";
};

export type RouterDiscoveryImportPayload = {
  sessionId: string;
  candidateId: string;
  userId: string;
  name?: string;
  serverNode?: string;
  connectionMode?: "wireguard" | "management_only";
  reason?: string;
};

export type RouterDiscoveryImportResult = {
  message: string;
  router: CreateRouterResponse;
  artifacts?: RouterSetupArtifacts | null;
  session: RouterDiscoverySession;
  candidate: RouterDiscoveryCandidate;
};
