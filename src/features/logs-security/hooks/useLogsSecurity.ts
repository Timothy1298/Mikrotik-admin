import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  acknowledgeSecurityEvent,
  addSecurityNote,
  exportActivityLogs,
  exportAuditTrail,
  exportSecurityEvents,
  getActivityLogById,
  getActivityLogs,
  getAuditById,
  getAuditTrail,
  getEventNotes,
  getResourceTimeline,
  getSecurityEventById,
  getSecurityEvents,
  getSecurityOverview,
  getSecurityReviews,
  getSessions,
  getSuspiciousActivity,
  getUserSecurityEvents,
  getUserSecurityNotes,
  getUserSecurityReviews,
  getUserSecuritySummary,
  getUserSessions,
  markSecurityEventReviewed,
  markUserSecurityReviewed,
  resolveSecurityEvent,
  revokeAllUserSessions,
  revokeSession,
  searchLogs,
} from "@/features/logs-security/api/getLogsSecurity";
import type { LogsExportParams, LogsSecurityFilterState } from "@/features/logs-security/types/logs-security.types";

const logsSecurityBase = [...queryKeys.logs] as const;

export function useActivityLogs(params?: LogsSecurityFilterState, enabled = true) {
  return useQuery({ queryKey: [...logsSecurityBase, "activity", params], queryFn: () => getActivityLogs(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
}

export function useActivityLog(id: string) {
  return useQuery({ queryKey: [...logsSecurityBase, "activity-item", id], queryFn: () => getActivityLogById(id), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useSearchLogs(params?: LogsSecurityFilterState) {
  return useQuery({ queryKey: [...logsSecurityBase, "search", params], queryFn: () => searchLogs(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useAuditTrail(params?: LogsSecurityFilterState, enabled = true) {
  return useQuery({ queryKey: [...logsSecurityBase, "audit", params], queryFn: () => getAuditTrail(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
}

export function useAudit(id: string) {
  return useQuery({ queryKey: [...logsSecurityBase, "audit-item", id], queryFn: () => getAuditById(id), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useSecurityOverview() {
  return useQuery({ queryKey: [...logsSecurityBase, "security-overview"], queryFn: getSecurityOverview, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useSecurityEvents(params?: LogsSecurityFilterState, enabled = true) {
  return useQuery({ queryKey: [...logsSecurityBase, "security-events", params], queryFn: () => getSecurityEvents(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
}

export function useSecurityEvent(id: string) {
  return useQuery({ queryKey: [...logsSecurityBase, "security-event", id], queryFn: () => getSecurityEventById(id), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useSuspiciousActivity(params?: LogsSecurityFilterState, enabled = true) {
  return useQuery({ queryKey: [...logsSecurityBase, "suspicious", params], queryFn: () => getSuspiciousActivity(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
}

export function useSecurityReviews(params?: LogsSecurityFilterState, enabled = true) {
  return useQuery({ queryKey: [...logsSecurityBase, "reviews", params], queryFn: () => getSecurityReviews(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
}

export function useSessions(params?: LogsSecurityFilterState, enabled = true) {
  return useQuery({ queryKey: [...logsSecurityBase, "sessions", params], queryFn: () => getSessions(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
}

export function useUserSessions(userId: string, params?: LogsSecurityFilterState) {
  return useQuery({ queryKey: [...logsSecurityBase, "user-sessions", userId, params], queryFn: () => getUserSessions(userId, params), enabled: Boolean(userId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useUserSecuritySummary(userId: string) {
  return useQuery({ queryKey: [...logsSecurityBase, "user-summary", userId], queryFn: () => getUserSecuritySummary(userId), enabled: Boolean(userId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useUserSecurityEvents(userId: string, params?: LogsSecurityFilterState) {
  return useQuery({ queryKey: [...logsSecurityBase, "user-events", userId, params], queryFn: () => getUserSecurityEvents(userId, params), enabled: Boolean(userId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useUserSecurityReviews(userId: string, params?: LogsSecurityFilterState) {
  return useQuery({ queryKey: [...logsSecurityBase, "user-reviews", userId, params], queryFn: () => getUserSecurityReviews(userId, params), enabled: Boolean(userId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useUserSecurityNotes(userId: string) {
  return useQuery({ queryKey: [...logsSecurityBase, "user-notes", userId], queryFn: () => getUserSecurityNotes(userId), enabled: Boolean(userId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useEventNotes(eventId: string) {
  return useQuery({ queryKey: [...logsSecurityBase, "event-notes", eventId], queryFn: () => getEventNotes(eventId), enabled: Boolean(eventId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useResourceTimeline(resourceType: "user" | "router" | "vpn_server" | "billing_account" | "support_ticket" | "incident", resourceId: string, params?: LogsSecurityFilterState, enabled = true) {
  return useQuery({ queryKey: [...logsSecurityBase, "timeline", resourceType, resourceId, params], queryFn: () => getResourceTimeline(resourceType, resourceId, params), enabled: Boolean(resourceId) && enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

function useLogsSecurityMutation<TArgs extends unknown[]>(mutationFn: (...args: TArgs) => Promise<{ message?: string }>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async () => {
      toast.success(successMessage);
      await queryClient.invalidateQueries({ queryKey: logsSecurityBase });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Security action failed");
    },
  });
}

export function useRevokeSession() {
  return useLogsSecurityMutation(revokeSession, "Session revoked successfully");
}

export function useRevokeAllUserSessions() {
  return useLogsSecurityMutation(revokeAllUserSessions, "All user sessions revoked successfully");
}

export function useAcknowledgeSecurityEvent() {
  return useLogsSecurityMutation(acknowledgeSecurityEvent, "Security event acknowledged successfully");
}

export function useResolveSecurityEvent() {
  return useLogsSecurityMutation(resolveSecurityEvent, "Security event resolved successfully");
}

export function useMarkSecurityItemReviewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: [target: { eventId?: string; userId?: string }, reason?: string]) => {
      const [target, reason] = variables;
      if (target.eventId) return markSecurityEventReviewed(target.eventId, reason);
      if (target.userId) return markUserSecurityReviewed(target.userId, reason);
      throw new Error("Review target is required");
    },
    onSuccess: async () => {
      toast.success("Review marked successfully");
      await queryClient.invalidateQueries({ queryKey: logsSecurityBase });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to mark item as reviewed");
    },
  });
}

export function useAddSecurityNote() {
  return useLogsSecurityMutation(addSecurityNote, "Security note added successfully");
}

function useExportMutation(mutationFn: (params?: LogsExportParams) => Promise<void>, successMessage: string) {
  return useMutation({
    mutationFn: (variables: [LogsExportParams?]) => mutationFn(variables[0]),
    onSuccess: () => {
      toast.success(successMessage);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Export failed");
    },
  });
}

export function useExportAuditTrail() {
  return useExportMutation(exportAuditTrail, "Audit trail exported");
}

export function useExportActivityLogs() {
  return useExportMutation(exportActivityLogs, "Activity logs exported");
}

export function useExportSecurityEvents() {
  return useExportMutation(exportSecurityEvents, "Security events exported");
}
