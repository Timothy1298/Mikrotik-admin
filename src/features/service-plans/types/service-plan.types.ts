export type ServicePlan = {
  id: string;
  name: string;
  description: string | null;
  planType: string;
  price: number;
  currency: string;
  dataCapGB: number;
  speedDownloadKbps: number;
  speedUploadKbps: number;
  fupEnabled: boolean;
  fupThresholdGB: number;
  fupSpeedDownloadKbps: number;
  fupSpeedUploadKbps: number;
  validityDays: number;
  peakSpeedEnabled: boolean;
  peakHoursStart: number;
  peakHoursEnd: number;
  peakSpeedDownloadKbps?: number;
  offPeakSpeedDownloadKbps?: number;
  isActive: boolean;
  assignedToAllRouters?: boolean;
  routerIds?: string[];
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Voucher = {
  id: string;
  code: string;
  planId: string;
  denomination: number;
  currency: string;
  validityDays: number;
  status: "unused" | "used" | "expired" | "revoked";
  usedBy: string | null;
  usedAt: string | null;
  expiresAt: string;
  batchId: string | null;
};

export type CreatePlanPayload = Omit<ServicePlan, "id" | "subscriberCount" | "createdAt" | "updatedAt">;
export type UpdatePlanPayload = Partial<CreatePlanPayload>;

export type GenerateVouchersPayload = {
  quantity: number;
  validityDays?: number;
  batchName?: string;
};

export type RevokeVoucherPayload = {
  reason?: string;
};
