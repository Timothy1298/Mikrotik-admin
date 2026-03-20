export type UserDirectoryStats = {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  suspendedUsers: number;
  verifiedUsers: number;
  overdueBillingUsers: number;
  usersWithOfflineRouters: number;
  usersWithOpenSupportTickets: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type UserDirectoryResponse = {
  items: UserRow[];
  pagination: PaginationMeta;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
  phone: string;
  accountStatus: string;
  verificationStatus: string;
  subscriptionStatus: string;
  riskStatus: string;
  supportTier: string;
  routersCount: number;
  onlineRouters: number;
  offlineRouters: number;
  monthlyValue: number;
  billingState: string;
  openTickets: number;
  failedPayments: number;
  health: string;
  flagCount?: number;
  riskIndicator?: string;
  planSummary?: string;
  trialEndsAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string | null;
  country: string;
  timezone: string;
  createdAt: string;
  verifiedAt: string | null;
  referralCode: string | null;
  supportTier: string;
};

export type UserDetail = {
  id: string;
  profile: UserProfile;
  state: {
    accountStatus: string;
    verificationStatus: string;
    subscriptionStatus: string;
    trialStatus: string;
    billingState: string;
    riskStatus: string;
    health: string;
  };
  summary: {
    routersOwned: number;
    onlineRouters: number;
    offlineRouters: number;
    activeSubscriptionValue: number;
    totalMonthlySpend: number;
    lastLogin: string | null;
    openTickets: number;
    failedLoginCount: number;
    accountAgeDays: number;
    lastActivity: string | null;
  };
  services: {
    routerManagementEnabled: boolean;
    billableRouters: number;
    totalRouters: number;
    wireguardConnectivity: boolean;
    publicAccessPortsEnabled?: boolean;
    monitoringEnabled: boolean;
    analyticsReporting: boolean;
    supportTier: string;
    trialFeaturesEnabled: boolean;
    apiAccess?: boolean;
    allocatedPublicPorts: number;
  };
  insights: string[];
  routers: Array<{
    id: string;
    name: string;
    status: string;
    vpnIp: string;
    ports: { winbox: number; ssh: number; api: number };
    lastSeen: string | null;
    createdAt: string;
    transferRx: number;
    transferTx: number;
    lastHandshake: string | null;
  }>;
  billing: {
    currentPlan?: string;
    pricingAmount?: number;
    billingCycle?: string;
    billableRouters?: number;
    routersCount?: number;
    nextBillingDate?: string | null;
    trialStart?: string | null;
    trialEnd?: string | null;
    balance?: number;
    currency?: string;
    overdue?: boolean;
    summary: {
      status: string;
      planType?: string;
      monthlyValue: number;
      nextBillingDate: string | null;
      overdueCount: number;
      trialEndingSoon: boolean;
    };
    subscriptions?: Array<Record<string, unknown>>;
    transactions?: Array<Record<string, unknown>>;
    recentTransactions?: Array<Record<string, unknown>>;
  };
  activity: Array<{
    type: string;
    actor: string;
    source: string;
    timestamp: string;
    summary: string;
    metadata?: string;
  }>;
  security: {
    failedLogins24h: number;
    failedLogins7d: number;
    lastSuccessfulLogin: string | null;
    lastFailedLogin: string | null;
    activeSessionsCount: number;
    suspiciousIpCount: number;
    riskStatus: string;
    events: Array<{
      type: string;
      actor: string;
      source: string;
      timestamp: string;
      summary: string;
      metadata?: string;
    }>;
    flags: Array<{
      flag: string;
      severity: string;
      description?: string;
      createdBy: string;
      createdAt: string;
    }>;
  };
  support: {
    openTickets?: number;
    summary?: {
      totalTickets?: number;
      openTickets?: number;
      closedTickets?: number;
      urgentTickets?: number;
    };
    tickets?: Array<Record<string, unknown>>;
  };
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

export type UsersQuery = {
  q?: string;
  accountStatus?: string;
  verificationStatus?: string;
  subscriptionStatus?: string;
  riskStatus?: string;
  supportState?: string;
  billingState?: string;
  routerOwnershipState?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  country?: string;
  reason?: string;
};

export type CreateUserResponse = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type EditUserProfilePayload = {
  name?: string;
  phone?: string;
  company?: string;
  country?: string;
  reason?: string;
};

export type UserSubResourceBilling = {
  summary: UserDetail["billing"]["summary"];
  subscriptions: Array<{
    id: string;
    status: string;
    planType: string;
    pricePerMonth: number;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    nextBillingDate: string | null;
  }>;
  transactions: Array<{
    id: string;
    transactionId: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
};
