export type LogsSecurityPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type LogsSecurityListResponse<T> = {
  items: T[];
  pagination: LogsSecurityPaginationMeta;
};

export type LogsSecurityActor = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

export type LogsSecurityTarget = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
};

export type ActivityLogItem = {
  id: string;
  eventId: string;
  eventType: string;
  category: string;
  actor?: LogsSecurityActor | null;
  source?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  targetUser?: LogsSecurityTarget | null;
  summary: string;
  metadataPreview?: Record<string, unknown> | null;
  severity?: string | null;
  timestamp: string;
};

export type AuditTrailItem = {
  id: string;
  auditId: string;
  actionType: string;
  actor?: LogsSecurityActor | null;
  resourceType?: string | null;
  resourceId?: string | null;
  targetAccount?: LogsSecurityTarget | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  timestamp: string;
};

export type SecurityNote = {
  id: string;
  body: string;
  category: string;
  author: string;
  createdAt: string;
};

export type SecurityEventItem = {
  id: string;
  eventId: string;
  eventType: string;
  category: string;
  severity: string;
  source?: string | null;
  success?: boolean | null;
  user?: LogsSecurityTarget | null;
  actor?: LogsSecurityActor | null;
  sessionId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  reviewedAt?: string | null;
  notes?: SecurityNote[];
  timestamp: string;
};

export type SuspiciousActivityItem = SecurityEventItem | {
  type: "repeated_failed_logins";
  user: LogsSecurityTarget | null;
  severity: string;
  summary: string;
  timestamp: string;
};

export type SessionItem = {
  id: string;
  sessionId: string;
  user?: LogsSecurityTarget | null;
  source?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  issuedAt?: string | null;
  lastSeenAt?: string | null;
  revokedAt?: string | null;
  revokedBy?: string | null;
  revokeReason?: string | null;
  status: string;
};

export type SecurityOverview = {
  totalSuccessfulLogins: number;
  totalFailedLogins: number;
  suspiciousLoginAttempts: number;
  lockedAccountsCount: number;
  accountsUnderReview: number;
  activeSessionsCount: number;
  recentlyRevokedSessionsCount: number;
  passwordResetRequests: number;
  passwordResetCompletions: number;
  emailVerificationEvents: number;
  adminSecuritySensitiveActions: number;
  unresolvedSecurityFlags: number;
  usersWithRepeatedFailures: number;
  latestSecurityCheckAt: string;
};

export type UserSecuritySummary = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    accountStatus: string;
  };
  lastSuccessfulLogin?: string | null;
  lastFailedLogin?: string | null;
  repeatedFailedLoginCount: number;
  passwordResetRequests: number;
  passwordResetCompletions: number;
  verificationEvents: number;
  activeSessionsCount: number;
  revokedSessionsCount: number;
  suspiciousFlags: Array<Record<string, unknown>>;
  recentSecurityAdminActions: AuditTrailItem[];
  reviewStatus: string;
};

export type ResourceTimelineItem = {
  eventId: string;
  eventType: string;
  category: string;
  source?: string | null;
  summary: string;
  timestamp: string;
  metadataPreview?: Record<string, unknown> | null;
};

export type LogsSecurityFilterState = {
  q?: string;
  status?: string;
  severity?: string;
  source?: string;
  eventType?: string;
  resourceType?: string;
  actorAdmin?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type LogsSecuritySection =
  | "activity"
  | "audit"
  | "security-overview"
  | "security-events"
  | "suspicious-activity"
  | "sessions"
  | "user-security-review"
  | "resource-timelines"
  | "reviews-notes";

export type LogsSecurityDetailItem =
  | { kind: "activity"; item: ActivityLogItem }
  | { kind: "audit"; item: AuditTrailItem }
  | { kind: "security-event"; item: SecurityEventItem }
  | { kind: "suspicious"; item: SuspiciousActivityItem }
  | { kind: "session"; item: SessionItem }
  | { kind: "user-security"; item: UserSecuritySummary }
  | { kind: "timeline"; item: ResourceTimelineItem };
