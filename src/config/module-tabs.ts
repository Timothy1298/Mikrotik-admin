import { appRoutes } from "@/config/routes";

export const userManagementTabs = [
  { label: "Overview", value: appRoutes.usersOverview },
  { label: "All Users", value: appRoutes.usersAll },
  { label: "Active", value: appRoutes.usersActive },
  { label: "Trials", value: appRoutes.usersTrials },
  { label: "Suspended", value: appRoutes.usersSuspended },
  { label: "Verification", value: appRoutes.usersVerificationQueue },
  { label: "Billing Risk", value: appRoutes.usersBillingRisk },
  { label: "Security", value: appRoutes.usersSecurityReview },
  { label: "Support Impact", value: appRoutes.usersSupportImpact },
  { label: "Notes", value: appRoutes.usersInternalNotes },
] as const;

export const routerManagementTabs = [
  { label: "Add Router", value: appRoutes.routersAdd },
  { label: "Overview", value: appRoutes.routersOverview },
  { label: "All Routers", value: appRoutes.routersAll },
  { label: "Online", value: appRoutes.routersOnline },
  { label: "Offline", value: appRoutes.routersOffline },
  { label: "Provisioning", value: appRoutes.routersProvisioningQueue },
  { label: "Unhealthy", value: appRoutes.routersUnhealthyTunnels },
  { label: "Port Issues", value: appRoutes.routersPortMappingIssues },
  { label: "Server Assign", value: appRoutes.routersServerAssignment },
  { label: "Diagnostics", value: appRoutes.routersDiagnosticsReview },
  { label: "API Connectivity", value: appRoutes.routersApiConnectivity },
  { label: "Notes", value: appRoutes.routersNotesFlags },
] as const;

export const vpnServerManagementTabs = [
  { label: "Overview", value: appRoutes.vpnServersOverview },
  { label: "All Servers", value: appRoutes.vpnServersAll },
  { label: "Healthy", value: appRoutes.vpnServersHealthy },
  { label: "Unhealthy", value: appRoutes.vpnServersUnhealthy },
  { label: "Maintenance", value: appRoutes.vpnServersMaintenance },
  { label: "Overloaded", value: appRoutes.vpnServersOverloaded },
  { label: "Distribution", value: appRoutes.vpnServersRouterDistribution },
  { label: "Peer Health", value: appRoutes.vpnServersPeerHealth },
  { label: "Traffic", value: appRoutes.vpnServersTrafficLoad },
  { label: "Diagnostics", value: appRoutes.vpnServersDiagnosticsReview },
] as const;

export const monitoringTabs = [
  { label: "Overview", value: appRoutes.monitoringOverview },
  { label: "Router Health", value: appRoutes.monitoringRouterHealth },
  { label: "VPN Health", value: appRoutes.monitoringVpnServerHealth },
  { label: "Peer Health", value: appRoutes.monitoringPeerHealth },
  { label: "Traffic", value: appRoutes.monitoringTrafficBandwidth },
  { label: "Customer Impact", value: appRoutes.monitoringCustomerImpact },
  { label: "Provisioning", value: appRoutes.monitoringProvisioningAnalytics },
  { label: "Incidents", value: appRoutes.monitoringIncidentsAlerts },
  { label: "Diagnostics", value: appRoutes.monitoringDiagnostics },
  { label: "Activity Feed", value: appRoutes.monitoringActivityFeed },
] as const;

export const billingTabs = [
  { label: "Overview", value: appRoutes.billingOverview },
  { label: "Subscriptions", value: appRoutes.billingSubscriptions },
  { label: "Trials", value: appRoutes.billingTrials },
  { label: "Active Paid", value: appRoutes.billingActivePaid },
  { label: "Overdue & Risk", value: appRoutes.billingOverdueRisk },
  { label: "Invoices", value: appRoutes.billingInvoices },
  { label: "Payments", value: appRoutes.billingPayments },
  { label: "Entitlements", value: appRoutes.billingEntitlements },
  { label: "Reports", value: appRoutes.billingReports },
  { label: "Activity", value: appRoutes.billingActivity },
  { label: "Notes", value: appRoutes.billingNotesFlags },
] as const;

export const logsSecurityTabs = [
  { label: "Overview", value: appRoutes.logsSecurityOverview },
  { label: "Activity", value: appRoutes.logsSecurityActivity },
  { label: "Audit", value: appRoutes.logsSecurityAudit },
  { label: "Security", value: appRoutes.logsSecuritySecurityOverview },
  { label: "Events", value: appRoutes.logsSecuritySecurityEvents },
  { label: "Suspicious", value: appRoutes.logsSecuritySuspiciousActivity },
  { label: "Sessions", value: appRoutes.logsSecuritySessions },
  { label: "User Review", value: appRoutes.logsSecurityUserSecurityReview },
  { label: "Timelines", value: appRoutes.logsSecurityResourceTimelines },
  { label: "Reviews", value: appRoutes.logsSecurityReviewsNotes },
] as const;

export const supportTabs = [
  { label: "Overview", value: appRoutes.supportOverview },
  { label: "All Tickets", value: appRoutes.supportTickets },
  { label: "Unassigned", value: appRoutes.supportUnassigned },
  { label: "Escalated", value: appRoutes.supportEscalated },
  { label: "High Priority", value: appRoutes.supportHighPriority },
  { label: "Stale", value: appRoutes.supportStale },
  { label: "By Assignee", value: appRoutes.supportByAssignee },
  { label: "Linked Issues", value: appRoutes.supportLinkedIssues },
  { label: "Conversations", value: appRoutes.supportConversations },
  { label: "Notes", value: appRoutes.supportNotesFlags },
] as const;

export const settingsTabs = [
  { label: "Profile", value: appRoutes.settings },
  { label: "Security", value: appRoutes.settingsSecurity },
  { label: "System", value: appRoutes.settingsSystem },
  { label: "Admin Accounts", value: appRoutes.settingsAdmins },
  { label: "Service Plans", value: appRoutes.settingsServicePlans },
  { label: "Resellers", value: appRoutes.settingsResellers },
] as const;
