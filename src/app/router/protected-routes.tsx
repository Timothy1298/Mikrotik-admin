import { Navigate, Route } from "react-router-dom";
import { RequireAuth } from "@/app/router/guards";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { appRoutes } from "@/config/routes";
import { BillingPage } from "@/pages/billing/BillingPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { LogsPage } from "@/pages/logs/LogsPage";
import { MonitoringPage } from "@/pages/monitoring/MonitoringPage";
import { RouterManagementOverviewPage } from "@/pages/routers/RouterManagementOverviewPage";
import { RouterManagementSectionPage } from "@/pages/routers/RouterManagementSectionPage";
import { RouterDetailsPage } from "@/pages/routers/RouterDetailsPage";
import { RoutersPage } from "@/pages/routers/RoutersPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { TicketDetailsPage } from "@/pages/support/TicketDetailsPage";
import { TicketsPage } from "@/pages/support/TicketsPage";
import { UserDetailsPage } from "@/pages/users/UserDetailsPage";
import { UserManagementOverviewPage } from "@/pages/users/UserManagementOverviewPage";
import { UserManagementSectionPage } from "@/pages/users/UserManagementSectionPage";
import { VpnServerDetailsPage } from "@/pages/vpn-servers/VpnServerDetailsPage";
import { VpnServersPage } from "@/pages/vpn-servers/VpnServersPage";

export function ProtectedRoutes() {
  return (
    <Route element={<RequireAuth />}>
      <Route element={<AdminLayout />}>
        <Route path={appRoutes.root} element={<DashboardPage />} />
        <Route path={appRoutes.dashboard} element={<DashboardPage />} />
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
        <Route path={appRoutes.routers} element={<RouterManagementOverviewPage />} />
        <Route path={appRoutes.routersOverview} element={<RouterManagementOverviewPage />} />
        <Route path={appRoutes.routersAll} element={<RouterManagementSectionPage section="all" />} />
        <Route path={appRoutes.routersOnline} element={<RouterManagementSectionPage section="online" />} />
        <Route path={appRoutes.routersOffline} element={<RouterManagementSectionPage section="offline" />} />
        <Route path={appRoutes.routersProvisioningQueue} element={<RouterManagementSectionPage section="provisioning-queue" />} />
        <Route path={appRoutes.routersUnhealthyTunnels} element={<RouterManagementSectionPage section="unhealthy-tunnels" />} />
        <Route path={appRoutes.routersPortMappingIssues} element={<RouterManagementSectionPage section="port-mapping-issues" />} />
        <Route path={appRoutes.routersServerAssignment} element={<RouterManagementSectionPage section="server-assignment" />} />
        <Route path={appRoutes.routersDiagnosticsReview} element={<RouterManagementSectionPage section="diagnostics-review" />} />
        <Route path={appRoutes.routersNotesFlags} element={<RouterManagementSectionPage section="notes-flags" />} />
        <Route path={appRoutes.routerDetail()} element={<RouterDetailsPage />} />
        <Route path={appRoutes.vpnServers} element={<VpnServersPage />} />
        <Route path={appRoutes.vpnServerDetail()} element={<VpnServerDetailsPage />} />
        <Route path={appRoutes.monitoring} element={<MonitoringPage />} />
        <Route path={appRoutes.billing} element={<BillingPage />} />
        <Route path={appRoutes.billingInvoices} element={<BillingPage />} />
        <Route path={appRoutes.billingSubscriptions} element={<BillingPage />} />
        <Route path={appRoutes.logs} element={<LogsPage />} />
        <Route path={appRoutes.activityLogs} element={<LogsPage />} />
        <Route path={appRoutes.securityLogs} element={<LogsPage />} />
        <Route path={appRoutes.support} element={<TicketsPage />} />
        <Route path={appRoutes.supportTicket()} element={<TicketDetailsPage />} />
        <Route path={appRoutes.settings} element={<SettingsPage />} />
        <Route path={appRoutes.settingsSecurity} element={<SettingsPage />} />
        <Route path={appRoutes.settingsSystem} element={<SettingsPage />} />
      </Route>
    </Route>
  );
}
