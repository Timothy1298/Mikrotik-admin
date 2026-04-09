export type ResellerAssignmentUser = {
  id: string;
  name: string;
  email: string;
  company: string;
};

export type ResellerAssignmentRouter = {
  id: string;
  name: string;
  routerId: string;
  status: string;
  vpnIp: string | null;
};

export type ResellerAssignmentPlan = {
  id: string;
  name: string;
  planType: string;
  price: number;
  currency: string;
  isActive: boolean;
};

export type ResellerRecord = {
  id: string;
  name: string;
  code: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: "active" | "inactive";
  territory: string;
  commissionRate: number;
  priceOverridePercent: number;
  notes: string;
  payoutBalance: number;
  totalPaidOut: number;
  lastPayoutAt: string | null;
  lastPayoutReference: string;
  assignedUsers: ResellerAssignmentUser[];
  assignedRouters: ResellerAssignmentRouter[];
  assignedPlans: ResellerAssignmentPlan[];
  summary: {
    assignedUsers: number;
    assignedRouters: number;
    assignedPlans: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ResellerPayload = {
  name: string;
  code: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: "active" | "inactive";
  territory?: string;
  commissionRate?: number;
  priceOverridePercent?: number;
  notes?: string;
  payoutBalance?: number;
  totalPaidOut?: number;
  lastPayoutAt?: string | null;
  lastPayoutReference?: string;
  assignedUserIds?: string[];
  assignedRouterIds?: string[];
  assignedPlanIds?: string[];
  reason?: string;
};
