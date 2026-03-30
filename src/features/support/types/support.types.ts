export type SupportPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type SupportListResponse<T> = {
  items: T[];
  pagination: SupportPaginationMeta;
};

export type SupportCustomer = {
  id: string;
  name: string | null;
  email: string | null;
  supportTier?: string;
  vip?: boolean;
  openTickets?: number;
  routerCount?: number;
  accountStatus?: string;
};

export type SupportAssignee = {
  id: string;
  name: string | null;
  email: string | null;
  supportRole?: string;
  supportTeam?: string;
};

export type SupportFlag = {
  id: string;
  flag: string;
  severity: string;
  description: string;
  createdBy: string;
  createdAt: string;
};

export type SupportNote = {
  id: string;
  body: string;
  category: string;
  pinned: boolean;
  author: string;
  createdAt: string;
};

export type SupportTicketRow = {
  id: string;
  ticketReference: string;
  subject: string;
  customer: SupportCustomer | null;
  status: string;
  priority: string;
  category: string;
  assignee: SupportAssignee | null;
  assignedTeam: string;
  escalated: boolean;
  escalationState: string;
  relatedResourceSummary: {
    routerId: string | null;
    serverId: string | null;
    incidentId: string | null;
    subscriptionId: string | null;
    transactionId: string | null;
  };
  lastReplySummary: {
    at: string | null;
    direction: string | null;
    awaiting: string;
  };
  age: {
    ageHours: number;
    idleHours: number;
    stale: boolean;
  };
  sla: {
    policy: { firstResponseTargetHours: number; resolutionTargetHours: number };
    firstResponseDueAt: string | null;
    resolutionDueAt: string | null;
    firstResponseAt: string | null;
    firstResolutionAt: string | null;
    responseBreached: boolean;
    resolutionBreached: boolean;
    breached: boolean;
    responseRemainingHours: number | null;
    resolutionRemainingHours: number | null;
  };
  supportTier: string;
  vip: boolean;
  flags: SupportFlag[];
  createdAt: string;
  updatedAt: string;
};

export type SupportOverview = {
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  escalatedTickets: number;
  unassignedTickets: number;
  highPriorityTickets: number;
  staleTickets: number;
  slaBreachedTickets: number;
  ticketsLinkedToIncidents: number;
  ticketsLinkedToBillingIssues: number;
  ticketsLinkedToRouterIssues: number;
  ticketsAwaitingAdminReply: number;
  ticketsAwaitingCustomerReply: number;
  vipCustomerTickets: number;
  lastSupportSyncAt: string | null;
};

export type SupportAnalytics = {
  window: string;
  trends: Array<{ timestamp: string; created: number; resolved: number; closed: number }>;
  totals: { created: number; resolved: number; openBacklog: number };
  averageResolutionHours: number | null;
  averageFirstResponseHours: number | null;
  ticketsByCategory: Array<{ category: string; count: number }>;
  ticketsByPriority: Array<{ priority: string; count: number }>;
  ticketsByAssignee: Array<{ assigneeId: string | null; assigneeName: string; count: number }>;
  ticketsByTeam: Array<{ team: string; count: number }>;
};

export type SupportTicketDetail = {
  ticket: {
    id: string;
    ticketReference: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    escalated: boolean;
    escalationState: string;
    escalationReason: string;
    assignee: SupportAssignee | null;
    assignedTeam: string;
    customer: SupportCustomer | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    closedAt: string | null;
    lastReplyAt: string | null;
    lastReplyDirection: string | null;
    awaitingState: string;
    age: SupportTicketRow["age"];
    sla: SupportTicketRow["sla"];
    internalFlags: SupportFlag[];
    internalNotes: SupportNote[];
  };
  context: {
    customer: SupportCustomer | null;
    router: { id: string; name: string; routerId: string; status: string; vpnIp: string | null } | null;
    vpnServer: { id: string; name: string; nodeId: string; status: string } | null;
    incident: { id: string; title: string; status: string; severity: string } | null;
    subscription: { id: string; status: string; planType: string; nextBillingDate: string | null } | null;
    transaction: { id: string; transactionId: string; type: string; status: string; amount: number } | null;
  };
  recentActivity: SupportActivityItem[];
};

export type SupportMessage = {
  id: string;
  author: { id: string; name: string | null; email: string | null } | null;
  direction: string;
  source: string;
  body: string;
  attachments: Array<{ filename: string; url: string; size: number; contentType: string | null }>;
  visibility: string;
  createdAt: string;
};

export type SupportActivityItem = {
  id: string;
  eventType: string;
  actor: { id: string | null; name: string | null; email: string | null; type?: string } | null;
  summary: string;
  metadata: Record<string, unknown>;
  timestamp: string;
};

export type SupportAgentWorkload = {
  assignee: SupportAssignee | null;
  totalTickets: number;
  openTickets: number;
  escalatedTickets: number;
  highPriorityTickets: number;
  staleTickets: number;
  slaBreachedTickets: number;
};

export type SupportTeamWorkload = {
  team: string;
  totalTickets: number;
  openTickets: number;
  escalatedTickets: number;
  staleTickets: number;
  slaBreachedTickets: number;
};

export type SupportAgent = {
  id: string;
  name: string;
  email: string;
  supportRole: string;
  supportTeam: string;
};

export type SupportTeam =
  | "general"
  | "networking"
  | "billing"
  | "security"
  | "vip"
  | "operations";

export type SupportFilterState = {
  q?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignee?: string;
  team?: string;
  awaiting?: string;
  linkedResourceType?: string;
  sortBy?: string;
  sortOrder?: string;
  escalated?: string;
  unassigned?: string;
  stale?: string;
  vip?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: number;
  limit?: number;
};

export type SupportSection =
  | "tickets"
  | "unassigned"
  | "escalated"
  | "high-priority"
  | "stale"
  | "by-assignee"
  | "linked-issues"
  | "conversations"
  | "notes-flags";

export type CreateTicketPayload = {
  userId: string;
  subject: string;
  description: string;
  category?: string;
  priority?: string;
  assigneeId?: string;
  reason?: string;
};

export type CreateTicketResponse = {
  id: string;
  ticketReference: string;
  subject: string;
  status: string;
  createdAt: string;
};
