export type PppoePagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type PppoeSecret = {
  id: string;
  routerId: string;
  name: string;
  profile: string;
  service: string;
  localAddress: string;
  remoteAddress: string;
  comment: string;
  isDisabled: boolean;
  online?: boolean;
  routerosId: string;
  createdAt?: string;
};

export type PppoeSession = {
  id: string;
  routerId: string;
  name: string;
  service: string;
  callerIp: string;
  address: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
  sessionId: string;
  connectedAt: string | null;
  isActive?: boolean;
};

export type PppoeProfile = {
  id?: string;
  name: string;
  localAddress: string;
  remoteAddress: string;
  rateLimit: string;
  comment?: string;
};

export type PppoeSecretPayload = {
  name: string;
  password?: string;
  profile: string;
  service: string;
  localAddress?: string;
  remoteAddress?: string;
  comment?: string;
  isDisabled?: boolean;
};

export type PppoeProfilePayload = {
  name: string;
  localAddress?: string;
  remoteAddress?: string;
  rateLimit?: string;
  comment?: string;
};

export type PppoeSecretFilters = {
  page?: number;
  limit?: number;
  search?: string;
};
