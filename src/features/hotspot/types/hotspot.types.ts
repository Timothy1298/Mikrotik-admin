export type HotspotPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type HotspotUser = {
  id: string;
  routerId: string;
  username: string;
  profile: string;
  isActive: boolean;
  online?: boolean;
  bytesIn: number;
  bytesOut: number;
  dataLimitBytes: number;
  timeLimitSeconds: number;
  expiresAt: string | null;
  comment: string;
  routerosId: string;
  createdAt: string;
  updatedAt?: string;
};

export type HotspotSession = {
  id: string;
  routerId: string;
  hotspotUserId?: string | null;
  username: string;
  ip: string;
  mac: string;
  uplinkBytes: number;
  downlinkBytes: number;
  currentUplinkBps: number;
  currentDownlinkBps: number;
  uptimeSeconds: number;
  sessionTimeLeftSeconds: number;
  idleTimeoutSeconds: number;
  keepaliveTimeoutSeconds: number;
  server: string;
  hostName: string;
  deviceLabel: string;
  profile: string;
  averageUplinkBps: number;
  averageDownlinkBps: number;
  sessionId: string;
  startedAt: string | null;
  endedAt?: string | null;
  isActive: boolean;
};

export type HotspotProfile = {
  id?: string;
  name: string;
  rateLimit: string;
  comment?: string;
  sessionTimeout: string;
  idleTimeout: string;
};

export type HotspotProfilePayload = {
  name: string;
  rateLimit?: string;
  comment?: string;
  sessionTimeout?: string;
  idleTimeout?: string;
};

export type HotspotVoucher = {
  id: string;
  routerId: string;
  hotspotUserId?: string | null;
  username: string;
  password: string;
  profile: string;
  dataLimitBytes: number;
  timeLimitSeconds: number;
  comment: string;
  batchId: string;
  status: "unused" | "used" | "expired" | "revoked";
  expiresAt: string | null;
  usedAt?: string | null;
  revokedAt?: string | null;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
};

export type GenerateVouchersPayload = {
  count: number;
  profile: string;
  dataLimitBytes: number;
  timeLimitSeconds: number;
  expiresAt?: string | null;
  prefix?: string;
};

export type HotspotUserFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export type HotspotVoucherFilters = {
  page?: number;
  limit?: number;
  status?: string;
};

export type HotspotUserPayload = {
  username: string;
  password?: string;
  profile: string;
  dataLimitBytes: number;
  timeLimitSeconds: number;
  expiresAt?: string | null;
  comment?: string;
  isActive?: boolean;
};
