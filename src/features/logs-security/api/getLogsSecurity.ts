import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ActivityLogItem,
  AuditTrailItem,
  LogsSecurityFilterState,
  LogsSecurityListResponse,
  ResourceTimelineItem,
  SecurityEventItem,
  SecurityNote,
  SecurityOverview,
  SessionItem,
  SuspiciousActivityItem,
  UserSecuritySummary,
} from "@/features/logs-security/types/logs-security.types";

export async function getActivityLogs(params?: LogsSecurityFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: ActivityLogItem[]; pagination: LogsSecurityListResponse<ActivityLogItem>["pagination"] }>(endpoints.admin.logsActivity, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getActivityLogById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; event: ActivityLogItem }>(endpoints.admin.logsActivityDetail(id));
  return data.event;
}

export async function searchLogs(params?: LogsSecurityFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: ActivityLogItem[]; pagination: LogsSecurityListResponse<ActivityLogItem>["pagination"] }>(endpoints.admin.logsSearch, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getAuditTrail(params?: LogsSecurityFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: AuditTrailItem[]; pagination: LogsSecurityListResponse<AuditTrailItem>["pagination"] }>(endpoints.admin.auditTrail, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getAuditById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; audit: AuditTrailItem }>(endpoints.admin.auditDetail(id));
  return data.audit;
}

export async function getSecurityOverview() {
  const { data } = await apiClient.get<{ success: boolean; overview: SecurityOverview }>(endpoints.admin.securityOverview);
  return data.overview;
}

export async function getSecurityEvents(params?: LogsSecurityFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SecurityEventItem[]; pagination: LogsSecurityListResponse<SecurityEventItem>["pagination"] }>(endpoints.admin.securityEvents, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getSecurityEventById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; event: SecurityEventItem }>(endpoints.admin.securityEventDetail(id));
  return data.event;
}

export async function getSuspiciousActivity(params?: LogsSecurityFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SuspiciousActivityItem[]; pagination: LogsSecurityListResponse<SuspiciousActivityItem>["pagination"] }>(endpoints.admin.suspiciousSecurityActivity, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getSecurityReviews(params?: LogsSecurityFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SecurityEventItem[]; pagination: LogsSecurityListResponse<SecurityEventItem>["pagination"] }>(endpoints.admin.securityReviews, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getSessions(params?: LogsSecurityFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SessionItem[]; pagination: LogsSecurityListResponse<SessionItem>["pagination"] }>(endpoints.admin.securitySessions, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getUserSessions(userId: string, params?: LogsSecurityFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SessionItem[]; pagination: LogsSecurityListResponse<SessionItem>["pagination"] }>(endpoints.admin.userSecuritySessions(userId), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getUserSecuritySummary(userId: string) {
  const { data } = await apiClient.get<{ success: boolean; summary: UserSecuritySummary }>(endpoints.admin.userSecuritySummary(userId));
  return data.summary;
}

export async function getUserSecurityEvents(userId: string, params?: LogsSecurityFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SecurityEventItem[]; pagination: LogsSecurityListResponse<SecurityEventItem>["pagination"] }>(endpoints.admin.userSecurityEvents(userId), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getUserSecurityReviews(userId: string, params?: LogsSecurityFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SecurityEventItem[]; pagination: LogsSecurityListResponse<SecurityEventItem>["pagination"] }>(endpoints.admin.userSecurityReviews(userId), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getUserSecurityNotes(userId: string) {
  const { data } = await apiClient.get<{ success: boolean; items: SecurityNote[] }>(endpoints.admin.userSecurityNotes(userId));
  return data.items;
}

export async function getEventNotes(eventId: string) {
  const { data } = await apiClient.get<{ success: boolean; items: SecurityNote[] }>(endpoints.admin.securityEventNotes(eventId));
  return data.items;
}

const timelineEndpoints = {
  user: endpoints.admin.logsUserTimeline,
  router: endpoints.admin.logsRouterTimeline,
  vpn_server: endpoints.admin.logsVpnServerTimeline,
  billing_account: endpoints.admin.logsBillingTimeline,
  support_ticket: endpoints.admin.logsSupportTicketTimeline,
  incident: endpoints.admin.logsIncidentTimeline,
} as const;

export async function getResourceTimeline(resourceType: keyof typeof timelineEndpoints, resourceId: string, params?: LogsSecurityFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: ResourceTimelineItem[]; pagination: LogsSecurityListResponse<ResourceTimelineItem>["pagination"] }>(timelineEndpoints[resourceType](resourceId), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function revokeSession(sessionId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.revokeSecuritySession(sessionId), { reason });
  return data;
}

export async function revokeAllUserSessions(userId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.revokeAllUserSecuritySessions(userId), { reason });
  return data;
}

export async function acknowledgeSecurityEvent(eventId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.acknowledgeSecurityEvent(eventId), { reason });
  return data;
}

export async function resolveSecurityEvent(eventId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.resolveSecurityEvent(eventId), { reason });
  return data;
}

export async function markSecurityEventReviewed(eventId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.markSecurityEventReviewed(eventId), { reason });
  return data;
}

export async function markUserSecurityReviewed(userId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.markUserSecurityReviewed(userId), { reason });
  return data;
}

export async function addSecurityNote(target: { eventId?: string; userId?: string }, payload: { body: string; category?: string; reason?: string; pinned?: boolean }) {
  if (target.eventId) {
    const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.securityEventNotes(target.eventId), payload);
    return data;
  }
  if (target.userId) {
    const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.userSecurityNotes(target.userId), payload);
    return data;
  }
  throw new Error("A security note target is required");
}
