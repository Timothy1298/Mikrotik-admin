import { appRoutes } from "@/config/routes";
import type { SupportSection } from "@/features/support/types/support.types";

export const supportSections: Record<SupportSection, { title: string; description: string; route: string; emptyTitle: string; emptyDescription: string }> = {
  tickets: {
    title: "All Tickets",
    description: "Global support inbox across customer issues, billing follow-up, provisioning failures, and operational escalations.",
    route: appRoutes.supportTickets,
    emptyTitle: "No tickets found",
    emptyDescription: "No support tickets matched the current search and filter set.",
  },
  unassigned: {
    title: "Unassigned Queue",
    description: "Tickets waiting for ownership assignment with aging, customer context, and linked resource visibility.",
    route: appRoutes.supportUnassigned,
    emptyTitle: "No unassigned tickets",
    emptyDescription: "Every current ticket already has an assignee.",
  },
  escalated: {
    title: "Escalated Tickets",
    description: "High-touch tickets carrying escalation state, elevated urgency, or sensitive customer/resource impact.",
    route: appRoutes.supportEscalated,
    emptyTitle: "No escalated tickets",
    emptyDescription: "There are no escalated tickets in the current queue.",
  },
  "high-priority": {
    title: "High Priority",
    description: "High and urgent support tickets with SLA pressure, operator visibility, and quick action workflows.",
    route: appRoutes.supportHighPriority,
    emptyTitle: "No high priority tickets",
    emptyDescription: "No high-priority tickets matched the current filters.",
  },
  stale: {
    title: "Stale / Aging",
    description: "Tickets that have been idle too long, are breaching response expectations, or need fresh operator action.",
    route: appRoutes.supportStale,
    emptyTitle: "No stale tickets",
    emptyDescription: "No stale or aging tickets matched the current filters.",
  },
  "by-assignee": {
    title: "By Assignee",
    description: "Workload visibility by support agent with drill-down into open, escalated, and stale tickets.",
    route: appRoutes.supportByAssignee,
    emptyTitle: "No assignee workload",
    emptyDescription: "There is no current assignee workload data to show.",
  },
  "linked-issues": {
    title: "Linked Issues",
    description: "Tickets connected to routers, VPN servers, incidents, subscriptions, and billing transactions.",
    route: appRoutes.supportLinkedIssues,
    emptyTitle: "No linked-issue tickets",
    emptyDescription: "No tickets with linked operational or billing resources matched the current filters.",
  },
  conversations: {
    title: "Conversations",
    description: "Recent customer and admin reply flow with last-reply direction and live support thread visibility.",
    route: appRoutes.supportConversations,
    emptyTitle: "No recent conversations",
    emptyDescription: "No recent conversation-heavy tickets matched the current filters.",
  },
  "notes-flags": {
    title: "Internal Notes & Flags",
    description: "Tickets carrying internal notes, VIP context, review markers, and support workflow flags.",
    route: appRoutes.supportNotesFlags,
    emptyTitle: "No flagged tickets",
    emptyDescription: "No tickets with internal notes or workflow flags matched the current filters.",
  },
};
