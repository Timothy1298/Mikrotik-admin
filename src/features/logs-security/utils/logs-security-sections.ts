import { appRoutes } from "@/config/routes";
import type { LogsSecuritySection } from "@/features/logs-security/types/logs-security.types";

export const logsSecuritySections: Record<LogsSecuritySection, { title: string; description: string; route: string; emptyTitle: string; emptyDescription: string }> = {
  activity: {
    title: "Activity Logs",
    description: "Search platform-wide operational activity across users, routers, servers, billing, support, and incidents.",
    route: appRoutes.logsSecurityActivity,
    emptyTitle: "No activity events found",
    emptyDescription: "No platform activity matched the current search and filter criteria.",
  },
  audit: {
    title: "Audit Trail",
    description: "Review sensitive admin and system actions with actor context, reasons, targets, and timestamps.",
    route: appRoutes.logsSecurityAudit,
    emptyTitle: "No audit records found",
    emptyDescription: "No audit trail records matched the current filter set.",
  },
  "security-overview": {
    title: "Security Overview",
    description: "Track security posture with failed logins, active sessions, password resets, reviews, and unresolved risks.",
    route: appRoutes.logsSecuritySecurityOverview,
    emptyTitle: "No security summary available",
    emptyDescription: "The security overview endpoint did not return any current posture data.",
  },
  "security-events": {
    title: "Security Events",
    description: "Investigate authentication, session, verification, and password-reset events with operational context.",
    route: appRoutes.logsSecuritySecurityEvents,
    emptyTitle: "No security events found",
    emptyDescription: "No security events matched the current filter set.",
  },
  "suspicious-activity": {
    title: "Suspicious Activity",
    description: "Focus on high-severity events, repeated failures, and accounts or resources that need rapid review.",
    route: appRoutes.logsSecuritySuspiciousActivity,
    emptyTitle: "No suspicious activity found",
    emptyDescription: "There are no suspicious activity items matching the current criteria.",
  },
  sessions: {
    title: "Sessions",
    description: "Inspect active, revoked, and expired sessions, then revoke risky sessions with review context.",
    route: appRoutes.logsSecuritySessions,
    emptyTitle: "No sessions found",
    emptyDescription: "No sessions matched the current filters.",
  },
  "user-security-review": {
    title: "User Security Review",
    description: "Review user-focused security posture, repeated failures, active sessions, and recent admin interventions.",
    route: appRoutes.logsSecurityUserSecurityReview,
    emptyTitle: "No user security review items found",
    emptyDescription: "No users currently require security review under the selected criteria.",
  },
  "resource-timelines": {
    title: "Resource Timelines",
    description: "Search by resource and reconstruct a normalized history across activity, audit, security, support, and incidents.",
    route: appRoutes.logsSecurityResourceTimelines,
    emptyTitle: "No timeline loaded",
    emptyDescription: "Choose a resource type and ID to load an investigation timeline.",
  },
  "reviews-notes": {
    title: "Reviews & Notes",
    description: "Work through review queues, unresolved high-severity events, and note-driven follow-up items.",
    route: appRoutes.logsSecurityReviewsNotes,
    emptyTitle: "No review items found",
    emptyDescription: "There are no review items or notes matching the current filters.",
  },
};
