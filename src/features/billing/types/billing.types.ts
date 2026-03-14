export type BillingOverview = {
  totalSubscribedAccounts: number;
  trialAccounts: number;
  activePaidAccounts: number;
  overdueAccounts: number;
  canceledAccounts: number;
  expiredAccounts: number;
  accountsInGracePeriod: number;
  totalActiveBillableRouters: number;
  estimatedMRR: number;
  overdueInvoiceCount: number;
  openInvoiceCount: number;
  failedPaymentCount: number;
  trialsEndingSoon: number;
  accountsSuspendedForBilling: number;
  accountsReactivatedRecently: number;
  lastBillingSyncAt: string | null;
  pricing: {
    routerMonthlyPrice: number;
    trialDays: number;
  };
};

export type BillingAnalytics = {
  window: string;
  summary: {
    activeMRREstimate: number;
    completedInvoiceRevenue: number;
    completedPayments: number;
    failedPayments: number;
  };
  series: Array<{
    timestamp: string;
    subscriptionsCreated: number;
    invoicesCompleted: number;
    paymentsCompleted: number;
    paymentFailures: number;
    cancellations: number;
  }>;
};

export type BillingRisk = {
  overdueAccounts: number;
  overdueInvoices: number;
  failedPayments: number;
  repeatedPaymentFailures: number;
  trialsEndingSoon: number;
  gracePeriodAccounts: number;
  accountsAtRiskOfSuspension: number;
  accountsSuspendedForBilling: number;
  highValueOverdueAccounts: Array<{
    accountId: string;
    name: string;
    email: string;
    estimatedRecurringValue: number;
  }>;
};

export type BillingPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type BillingNote = {
  id?: string;
  body: string;
  category: string;
  pinned: boolean;
  author: string;
  createdAt: string;
};

export type BillingFlag = {
  id?: string;
  flag: string;
  severity: string;
  description?: string;
  createdBy: string;
  createdAt: string;
};

export type BillingSubscriptionRow = {
  id: string;
  account: {
    id: string;
    name: string;
    email: string;
    accountStatus: string;
    currency: string;
    balance: number;
  } | null;
  subscriptionId: string;
  planName: string;
  subscriptionStatus: string;
  trialStatus: string;
  billableRouterCount: number;
  priceSummary: number;
  billingCycle: string;
  nextBillingDate: string | null;
  overdue: boolean;
  lastPaymentStatus: string | null;
  openInvoiceCount: number;
  accountStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type BillingTransaction = {
  id: string;
  transactionId: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  paymentMethod: string | null;
  paymentGatewayId: string | null;
  dueDate: string | null;
  settledAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  account: {
    id: string;
    name: string;
    email: string;
  } | null;
  subscription: {
    id: string;
    status: string;
    planType: string;
  } | null;
  metadata: Record<string, unknown>;
};

export type BillingEntitlements = {
  routerManagementEnabled: boolean;
  publicAccessPortsEnabled: boolean;
  monitoringEnabled: boolean;
  supportTier: string;
  analyticsAccessEnabled: boolean;
  apiAccessEnabled: boolean;
  trialFeaturesEnabled: boolean;
  billableRouters: number;
  activeRouters: number;
  billingHold: boolean;
  gracePeriodActive: boolean;
  gracePeriodEndsAt: string | null;
  suspendedForBilling: boolean;
  accountOperationalState: string;
};

export type BillingRouterItem = {
  router: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
  };
  subscription: {
    id: string;
    status: string;
    planType: string;
    pricePerMonth: number;
    nextBillingDate: string | null;
  } | null;
  countedTowardBilling: boolean;
  reason: string;
};

export type BillingAccountDetail = {
  account: {
    id: string;
    name: string;
    email: string;
    accountStatus: string;
    currency: string;
    balance: number;
    billingReviewedAt: string | null;
    billingReviewedBy: string | null;
    billingSuspendedAt: string | null;
    billingSuspensionReason: string | null;
    billingReactivatedAt: string | null;
  };
  subscription: {
    id: string;
    status: string;
    planType: string;
    pricePerMonth: number;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
    nextBillingDate: string | null;
    lastPaymentDate: string | null;
    paymentMethod: string | null;
  } | null;
  overview: {
    currentPlan: string;
    subscriptionStatus: string;
    trialStart: string | null;
    trialEnd: string | null;
    billingCycle: string;
    unitPricing: number;
    billableRouters: number;
    estimatedRecurringValue: number;
    nextBillingDate: string | null;
    overdue: boolean;
    gracePeriodActive: boolean;
    gracePeriodEndsAt: string | null;
    openInvoices: number;
    failedPayments: number;
  };
  entitlements: BillingEntitlements;
  routers: {
    total: number;
    items: BillingRouterItem[];
  };
  invoices: BillingTransaction[];
  payments: BillingTransaction[];
  recentEvents: BillingActivityItem[];
  notes: BillingNote[];
  flags: BillingFlag[];
};

export type BillingActivityItem = {
  id: string;
  type: string;
  source: string;
  summary: string;
  timestamp: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
  reason?: string;
  metadata?: Record<string, unknown>;
};

export type BillingTrialRow = {
  accountId: string;
  name: string;
  email: string;
  trialEndsAt: string;
  trialEndingSoon: boolean;
  subscriptionsOnTrial: number;
  estimatedRecurringValue: number;
};

export type BillingSection =
  | "subscriptions"
  | "trials"
  | "active-paid"
  | "overdue-risk"
  | "invoices"
  | "payments"
  | "entitlements"
  | "activity"
  | "notes-flags";

export type BillingFilterState = {
  q?: string;
  status?: string;
  subscriptionStatus?: string;
  paymentMethod?: string;
  source?: string;
  type?: string;
  window?: string;
  page?: number;
  limit?: number;
};
