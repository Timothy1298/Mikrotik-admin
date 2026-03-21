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
  sessionId: string;
  startedAt: string | null;
  endedAt?: string | null;
  isActive: boolean;
};

export type HotspotProfile = {
  name: string;
  rateLimit: string;
  sessionTimeout: string;
  idleTimeout: string;
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
