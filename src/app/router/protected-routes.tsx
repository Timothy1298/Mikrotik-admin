import { Navigate, Route } from "react-router-dom";
import { RequireAuth, RequirePermission } from "@/app/router/guards";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/permissions/permissions";
import { BillingAccountPage } from "@/pages/billing/BillingAccountPage";
import { BillingOverviewPage } from "@/pages/billing/BillingOverviewPage";
import { BillingRouterSubscriptionPage } from "@/pages/billing/BillingRouterSubscriptionPage";
import { BillingSectionPage } from "@/pages/billing/BillingSectionPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { LogsSecurityOverviewPage } from "@/pages/logs-security/LogsSecurityOverviewPage";
import { LogsSecuritySectionPage } from "@/pages/logs-security/LogsSecuritySectionPage";
import { LogsSecurityWorkspacePage } from "@/pages/logs-security/LogsSecurityWorkspacePage";
import { MonitoringOverviewPage } from "@/pages/monitoring/MonitoringOverviewPage";
import { MonitoringSectionPage } from "@/pages/monitoring/MonitoringSectionPage";
import { MonitoringWorkspacePage } from "@/pages/monitoring/MonitoringWorkspacePage";
import { ReferralsPage } from "@/pages/referrals/ReferralsPage";
import { RouterManagementOverviewPage } from "@/pages/routers/RouterManagementOverviewPage";
import { RouterManagementSectionPage } from "@/pages/routers/RouterManagementSectionPage";
import { RouterDetailsPage } from "@/pages/routers/RouterDetailsPage";
import { RouterAddPage } from "@/pages/routers/RouterAddPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { AdminManagementPage } from "@/pages/settings/AdminManagementPage";
import { ResellersPage } from "@/pages/settings/ResellersPage";
import { ServicePlansPage } from "@/pages/settings/ServicePlansPage";
import { TicketDetailsPage } from "@/pages/support/TicketDetailsPage";
import { SupportOverviewPage } from "@/pages/support/SupportOverviewPage";
import { SupportSectionPage } from "@/pages/support/SupportSectionPage";
import { UserDetailsPage } from "@/pages/users/UserDetailsPage";
import { UserManagementOverviewPage } from "@/pages/users/UserManagementOverviewPage";
import { UserManagementSectionPage } from "@/pages/users/UserManagementSectionPage";
import { VpnServerManagementOverviewPage } from "@/pages/vpn-servers/VpnServerManagementOverviewPage";
import { VpnServerManagementSectionPage } from "@/pages/vpn-servers/VpnServerManagementSectionPage";
import { VpnServerDetailsPage } from "@/pages/vpn-servers/VpnServerDetailsPage";
import { VpnClientsPage } from "@/pages/vpn-servers/VpnClientsPage";

export function ProtectedRoutes() {
  return (
    <Route element={<RequireAuth />}>
      <Route element={<AdminLayout />}>
        <Route path={appRoutes.root} element={<DashboardPage />} />
        <Route path={appRoutes.dashboard} element={<DashboardPage />} />
        <Route path={appRoutes.referrals} element={<ReferralsPage />} />
        <Route path={appRoutes.usersRoot} element={<Navigate to={appRoutes.usersOverview} replace />} />
        <Route path={appRoutes.usersOverview} element={<UserManagementOverviewPage />} />
        <Route path={appRoutes.usersAll} element={<UserManagementSectionPage section="all" />} />
        <Route path={appRoutes.usersActive} element={<UserManagementSectionPage section="active" />} />
        <Route path={appRoutes.usersTrials} element={<UserManagementSectionPage section="trials" />} />
        <Route path={appRoutes.usersSuspended} element={<UserManagementSectionPage section="suspended" />} />
        <Route path={appRoutes.usersVerificationQueue} element={<UserManagementSectionPage section="verification" />} />
        <Route path={appRoutes.usersBillingRisk} element={<UserManagementSectionPage section="billing-risk" />} />
        <Route path={appRoutes.usersSecurityReview} element={<UserManagementSectionPage section="security-review" />} />
        <Route path={appRoutes.usersSupportImpact} element={<UserManagementSectionPage section="support-impact" />} />
        <Route path={appRoutes.usersInternalNotes} element={<UserManagementSectionPage section="internal-notes" />} />
        <Route path={appRoutes.userDetail()} element={<UserDetailsPage />} />
        <Route path={appRoutes.routersRoot} element={<Navigate to={appRoutes.routersOverview} replace />} />
        <Route path={appRoutes.routersAdd} element={<RouterAddPage />} />
        <Route path={appRoutes.routers} element={<RouterManagementOverviewPage />} />
        <Route path={appRoutes.routersOverview} element={<RouterManagementOverviewPage />} />
        <Route path={appRoutes.routersAll} element={<RouterManagementSectionPage section="all" />} />
        <Route path={appRoutes.routersOnline} element={<RouterManagementSectionPage section="online" />} />
        <Route path={appRoutes.routersOffline} element={<RouterManagementSectionPage section="offline" />} />
        <Route path={appRoutes.routersProvisioningQueue} element={<RouterManagementSectionPage section="provisioning-queue" />} />
        <Route path={appRoutes.routersUnhealthyTunnels} element={<RouterManagementSectionPage section="unhealthy-tunnels" />} />
        <Route path={appRoutes.routersPortMappingIssues} element={<RouterManagementSectionPage section="port-mapping-issues" />} />
        <Route path={appRoutes.routersServerAssignment} element={<RouterManagementSectionPage section="server-assignment" />} />
        <Route path={appRoutes.routersLiveOperations} element={<RouterManagementSectionPage section="live-operations" />} />
        <Route path={appRoutes.routersDiagnosticsReview} element={<RouterManagementSectionPage section="diagnostics-review" />} />
        <Route path={appRoutes.routersApiConnectivity} element={<RouterManagementSectionPage section="api-connectivity" />} />
        <Route path={appRoutes.routersNotesFlags} element={<RouterManagementSectionPage section="notes-flags" />} />
        <Route path={appRoutes.routerDetail()} element={<RouterDetailsPage />} />
        <Route path={appRoutes.vpnServersRoot} element={<Navigate to={appRoutes.vpnServersOverview} replace />} />
        <Route path={appRoutes.vpnServers} element={<VpnServerManagementOverviewPage />} />
        <Route path={appRoutes.vpnServersOverview} element={<VpnServerManagementOverviewPage />} />
        <Route path={appRoutes.vpnClients} element={<VpnClientsPage />} />
        <Route path={appRoutes.vpnServersAll} element={<VpnServerManagementSectionPage section="all" />} />
        <Route path={appRoutes.vpnServersHealthy} element={<VpnServerManagementSectionPage section="healthy" />} />
        <Route path={appRoutes.vpnServersUnhealthy} element={<VpnServerManagementSectionPage section="unhealthy" />} />
        <Route path={appRoutes.vpnServersMaintenance} element={<VpnServerManagementSectionPage section="maintenance" />} />
        <Route path={appRoutes.vpnServersOverloaded} element={<VpnServerManagementSectionPage section="overloaded" />} />
        <Route path={appRoutes.vpnServersRouterDistribution} element={<VpnServerManagementSectionPage section="router-distribution" />} />
        <Route path={appRoutes.vpnServersPeerHealth} element={<VpnServerManagementSectionPage section="peer-health" />} />
        <Route path={appRoutes.vpnServersTrafficLoad} element={<VpnServerManagementSectionPage section="traffic-load" />} />
        <Route path={appRoutes.vpnServersDiagnosticsReview} element={<VpnServerManagementSectionPage section="diagnostics-review" />} />
        <Route path={appRoutes.vpnServerDetail()} element={<VpnServerDetailsPage />} />
        <Route path={appRoutes.monitoringRoot} element={<Navigate to={appRoutes.monitoringOverview} replace />} />
        <Route path={appRoutes.monitoring} element={<MonitoringOverviewPage />} />
        <Route path={appRoutes.monitoringOverview} element={<MonitoringOverviewPage />} />
        <Route path={appRoutes.monitoringRouterHealth} element={<MonitoringSectionPage section="router-health" />} />
        <Route path={appRoutes.monitoringVpnServerHealth} element={<MonitoringSectionPage section="vpn-server-health" />} />
        <Route path={appRoutes.monitoringPeerHealth} element={<MonitoringSectionPage section="peer-health" />} />
        <Route path={appRoutes.monitoringTrafficBandwidth} element={<MonitoringSectionPage section="traffic-bandwidth" />} />
        <Route path={appRoutes.monitoringCustomerImpact} element={<MonitoringSectionPage section="customer-impact" />} />
        <Route path={appRoutes.monitoringProvisioningAnalytics} element={<MonitoringSectionPage section="provisioning-analytics" />} />
        <Route path={appRoutes.monitoringIncidentsAlerts} element={<MonitoringSectionPage section="incidents-alerts" />} />
        <Route path={appRoutes.monitoringDiagnostics} element={<MonitoringSectionPage section="diagnostics" />} />
        <Route path={appRoutes.monitoringActivityFeed} element={<MonitoringSectionPage section="activity-feed" />} />
        <Route path={appRoutes.monitoringWorkspace()} element={<MonitoringWorkspacePage />} />
        <Route path={appRoutes.billingRoot} element={<Navigate to={appRoutes.billingOverview} replace />} />
        <Route path={appRoutes.billing} element={<BillingOverviewPage />} />
        <Route path={appRoutes.billingOverview} element={<BillingOverviewPage />} />
        <Route path={appRoutes.billingSubscriptions} element={<BillingSectionPage section="subscriptions" />} />
        <Route path={appRoutes.billingTrials} element={<BillingSectionPage section="trials" />} />
        <Route path={appRoutes.billingActivePaid} element={<BillingSectionPage section="active-paid" />} />
        <Route path={appRoutes.billingOverdueRisk} element={<BillingSectionPage section="overdue-risk" />} />
        <Route path={appRoutes.billingInvoices} element={<BillingSectionPage section="invoices" />} />
        <Route path={appRoutes.billingPayments} element={<BillingSectionPage section="payments" />} />
        <Route path={appRoutes.billingEntitlements} element={<BillingSectionPage section="entitlements" />} />
        <Route path={appRoutes.billingReports} element={<BillingSectionPage section="reports" />} />
        <Route path={appRoutes.billingActivity} element={<BillingSectionPage section="activity" />} />
        <Route path={appRoutes.billingNotesFlags} element={<BillingSectionPage section="notes-flags" />} />
        <Route path={appRoutes.billingRouterSubscriptions} element={<BillingRouterSubscriptionPage />} />
        <Route path={appRoutes.billingAccount()} element={<BillingAccountPage />} />
        <Route path={appRoutes.logsSecurityRoot} element={<Navigate to={appRoutes.logsSecurityOverview} replace />} />
        <Route path={appRoutes.logsSecurity} element={<LogsSecurityOverviewPage />} />
        <Route path={appRoutes.logsSecurityOverview} element={<LogsSecurityOverviewPage />} />
        <Route path={appRoutes.logsSecurityActivity} element={<LogsSecuritySectionPage section="activity" />} />
        <Route path={appRoutes.logsSecurityAudit} element={<LogsSecuritySectionPage section="audit" />} />
        <Route path={appRoutes.logsSecuritySecurityOverview} element={<LogsSecuritySectionPage section="security-overview" />} />
        <Route path={appRoutes.logsSecuritySecurityEvents} element={<LogsSecuritySectionPage section="security-events" />} />
        <Route path={appRoutes.logsSecuritySuspiciousActivity} element={<LogsSecuritySectionPage section="suspicious-activity" />} />
        <Route path={appRoutes.logsSecuritySessions} element={<LogsSecuritySectionPage section="sessions" />} />
        <Route path={appRoutes.logsSecurityUserSecurityReview} element={<LogsSecuritySectionPage section="user-security-review" />} />
        <Route path={appRoutes.logsSecurityResourceTimelines} element={<LogsSecuritySectionPage section="resource-timelines" />} />
        <Route path={appRoutes.logsSecurityReviewsNotes} element={<LogsSecuritySectionPage section="reviews-notes" />} />
        <Route path={appRoutes.logsSecurityWorkspace()} element={<LogsSecurityWorkspacePage />} />
        <Route path={appRoutes.supportRoot} element={<Navigate to={appRoutes.supportOverview} replace />} />
        <Route path={appRoutes.support} element={<SupportOverviewPage />} />
        <Route path={appRoutes.supportOverview} element={<SupportOverviewPage />} />
        <Route path={appRoutes.supportTickets} element={<SupportSectionPage section="tickets" />} />
        <Route path={appRoutes.supportUnassigned} element={<SupportSectionPage section="unassigned" />} />
        <Route path={appRoutes.supportEscalated} element={<SupportSectionPage section="escalated" />} />
        <Route path={appRoutes.supportHighPriority} element={<SupportSectionPage section="high-priority" />} />
        <Route path={appRoutes.supportStale} element={<SupportSectionPage section="stale" />} />
        <Route path={appRoutes.supportByAssignee} element={<SupportSectionPage section="by-assignee" />} />
        <Route path={appRoutes.supportLinkedIssues} element={<SupportSectionPage section="linked-issues" />} />
        <Route path={appRoutes.supportConversations} element={<SupportSectionPage section="conversations" />} />
        <Route path={appRoutes.supportNotesFlags} element={<SupportSectionPage section="notes-flags" />} />
        <Route path={appRoutes.supportTicket()} element={<TicketDetailsPage />} />
        <Route path={appRoutes.settings} element={<SettingsPage />} />
        <Route path={appRoutes.settingsSecurity} element={<SettingsPage />} />
        <Route path={appRoutes.settingsSystem} element={<SettingsPage />} />
        <Route element={<RequirePermission permission={permissions.settingsManage} />}>
          <Route path={appRoutes.settingsAdmins} element={<AdminManagementPage />} />
          <Route path={appRoutes.settingsResellers} element={<ResellersPage />} />
        </Route>
        <Route element={<RequirePermission permission={permissions.servicePlansView} />}>
          <Route path={appRoutes.settingsServicePlans} element={<ServicePlansPage />} />
        </Route>
      </Route>
    </Route>
  );
}
