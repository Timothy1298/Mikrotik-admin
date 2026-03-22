export type RouterQueue = {
  id: string;
  routerId: string;
  name: string;
  target: string;
  maxDownloadKbps: number;
  maxUploadKbps: number;
  comment: string;
  routerosId: string;
  isActive: boolean;
  linkedSubscriptionId: string | null;
  linkedServicePlanId?: string | null;
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
  queueType?: "simple" | "pcq";
  pcqDownloadProfile?: string;
  pcqUploadProfile?: string;
};

export type ApplyPlanPayload = {
  subscriberIp: string;
  servicePlanId: string;
  subscriptionId?: string;
};
