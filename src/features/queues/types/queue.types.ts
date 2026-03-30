export type RouterQueue = {
  id: string;
  routerId: string;
  name: string;
  target: string;
  maxDownloadKbps: number;
  maxUploadKbps: number;
  comment: string;
  routerosId: string;
  isDynamic: boolean;
  isActive: boolean;
  linkedSubscriptionId: string | null;
  linkedServicePlanId?: string | null;
  overrideSourceType?: "hotspot_user" | "pppoe_secret" | "manual" | "";
  overrideSourceId?: string;
  overrideSourceName?: string;
  queueType?: "simple" | "pcq";
  pcqDownloadProfile?: string;
  pcqUploadProfile?: string;
};

export type QueueStats = {
  total: number;
  active: number;
  totalDownloadKbps: number;
  totalUploadKbps: number;
};

export type QueuePayload = {
  name: string;
  target: string;
  maxDownloadKbps: number;
  maxUploadKbps: number;
  comment?: string;
  overrideSourceType?: "hotspot_user" | "pppoe_secret" | "manual";
  overrideSourceId?: string;
  overrideSourceName?: string;
  queueType?: "simple" | "pcq";
  pcqDownloadProfile?: string;
  pcqUploadProfile?: string;
};

export type ApplyPlanPayload = {
  subscriberIp: string;
  servicePlanId: string;
  subscriptionId?: string;
};
