export type LinkedRouterSummary = {
  _id: string;
  name: string;
  status: string;
  vpnIp?: string | null;
};

export type VpnClientRow = {
  _id: string;
  name: string;
  ip: string;
  publicKey: string;
  enabled: boolean;
  createdBy?: string;
  notes?: string;
  interfaceName?: string;
  endpoint?: string;
  allowedIPs?: string;
  dns?: string;
  persistentKeepalive?: number;
  lastHandshake?: string | null;
  transferRx?: number;
  transferTx?: number;
  lastConnectionTime?: string | null;
  lastConnectionIp?: string | null;
  createdAt?: string;
  updatedAt?: string;
  linkedRouterCount?: number;
};

export type VpnClientDetail = VpnClientRow & {
  privateKey?: string;
  linkedRouters?: LinkedRouterSummary[];
};

export type VpnClientListResponse = {
  clients: VpnClientRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type VpnClientQuery = {
  page?: number;
  limit?: number;
  enabled?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type CreateVpnClientPayload = {
  name: string;
  notes?: string;
  interfaceName?: string;
  allowedIPs?: string;
  endpoint?: string;
  dns?: string;
  persistentKeepalive?: number;
  enabled?: boolean;
};

export type UpdateVpnClientPayload = {
  name?: string;
  notes?: string;
  interfaceName?: string;
  enabled?: boolean;
  ip?: string;
  allowedIPs?: string;
  endpoint?: string;
  dns?: string;
  persistentKeepalive?: number;
};

export type ClientPingResult = {
  success: boolean;
  message: string;
  client: string;
  target: string;
  result?: string;
  details?: string;
};

export type DownloadMikrotikScriptPayload = {
  name: string;
  iface?: string;
  subnet?: string;
};
