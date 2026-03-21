import { useEffect, useMemo, useState } from "react";
import { Activity, Fingerprint, ShieldAlert, ShieldQuestion, UserCog } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { TableLoader } from "@/components/feedback/TableLoader";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataToolbar } from "@/components/shared/DataToolbar";
import { MetricCard } from "@/components/shared/MetricCard";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { logsSecurityTabs } from "@/config/module-tabs";
import {
  ActivityLogsTable,
  AuditTrailTable,
  LogsSecurityActionDialog,
  LogsSecurityDetailsModal,
  LogsSecurityFilters,
  ResourceTimelineViewer,
  SecurityEventsTable,
  SessionsTable,
  SuspiciousActivityTable,
  UserSecurityReviewTable,
} from "@/features/logs-security/components";
import {
  useActivityLogs,
  useAcknowledgeSecurityEvent,
  useAddSecurityNote,
  useAuditTrail,
  useExportActivityLogs,
  useExportAuditTrail,
  useExportSecurityEvents,
  useMarkSecurityItemReviewed,
  useResolveSecurityEvent,
  useResourceTimeline,
  useRevokeAllUserSessions,
  useRevokeSession,
  useSecurityEvents,
  useSecurityOverview,
  useSecurityReviews,
  useSessions,
  useSuspiciousActivity,
  useUserSecuritySummary,
} from "@/features/logs-security/hooks/useLogsSecurity";
import type {
  LogsSecurityDetailItem,
  LogsSecurityFilterState,
  LogsSecuritySection,
  SecurityEventItem,
  SessionItem,
  SuspiciousActivityItem,
  UserSecuritySummary,
} from "@/features/logs-security/types/logs-security.types";
import { logsSecuritySections } from "@/features/logs-security/utils/logs-security-sections";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";

const sectionIcons: Record<LogsSecuritySection, typeof Activity> = {
  activity: Activity,
  audit: UserCog,
  "security-overview": ShieldAlert,
  "security-events": ShieldAlert,
  "suspicious-activity": ShieldQuestion,
  sessions: Fingerprint,
  "user-security-review": UserCog,
  "resource-timelines": Activity,
  "reviews-notes": ShieldAlert,
};

const resourceTypeOptions = [
  { label: "User / Account", value: "user" },
  { label: "Router", value: "router" },
  { label: "VPN Server", value: "vpn_server" },
  { label: "Billing Account", value: "billing_account" },
  { label: "Support Ticket", value: "support_ticket" },
  { label: "Incident", value: "incident" },
] as const;

export function LogsSecuritySectionPage({ section }: { section: LogsSecuritySection }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser(true);
  const sectionMeta = logsSecuritySections[section];
  const Icon = sectionIcons[section];

  const [filters, setFilters] = useState<LogsSecurityFilterState>({ limit: 50, page: 1 });
  const [selectedDetail, setSelectedDetail] = useState<LogsSecurityDetailItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEventItem | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [timelineResourceType, setTimelineResourceType] = useState<(typeof resourceTypeOptions)[number]["value"]>("user");
  const [timelineResourceId, setTimelineResourceId] = useState("");

  const detailDisclosure = useDisclosure(false);
  const acknowledgeDisclosure = useDisclosure(false);
  const resolveDisclosure = useDisclosure(false);
  const reviewedDisclosure = useDisclosure(false);
  const addNoteDisclosure = useDisclosure(false);
  const revokeSessionDisclosure = useDisclosure(false);
  const revokeAllDisclosure = useDisclosure(false);

  const activityEnabled = section === "activity";
  const auditEnabled = section === "audit";
  const securityOverviewEnabled = section === "security-overview" || section === "security-events";
  const securityEventsEnabled = ["security-events", "security-overview", "user-security-review", "reviews-notes"].includes(section);
  const suspiciousEnabled = section === "suspicious-activity";
  const sessionsEnabled = ["sessions", "security-overview", "user-security-review"].includes(section);
  const reviewsEnabled = section === "reviews-notes";
  const timelineEnabled = section === "resource-timelines" && timelineResourceId.trim() !== "";

  useEffect(() => {
    setFilters({ limit: 50, page: 1 });
  }, [section]);

  const activityQuery = useActivityLogs(filters, activityEnabled);
  const auditQuery = useAuditTrail(filters, auditEnabled);
  const securityOverviewQuery = useSecurityOverview();
  const securityEventsQuery = useSecurityEvents(filters, securityEventsEnabled);
  const suspiciousQuery = useSuspiciousActivity(filters, suspiciousEnabled);
  const sessionsQuery = useSessions(filters, sessionsEnabled);
  const reviewsQuery = useSecurityReviews(filters, reviewsEnabled);
  const selectedUserSummaryQuery = useUserSecuritySummary(selectedUserId);
  const timelineQuery = useResourceTimeline(timelineResourceType, timelineResourceId, filters, timelineEnabled);

  const acknowledgeMutation = useAcknowledgeSecurityEvent();
  const resolveMutation = useResolveSecurityEvent();
  const reviewedMutation = useMarkSecurityItemReviewed();
  const addNoteMutation = useAddSecurityNote();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllUserSessions();
  const exportAuditMutation = useExportAuditTrail();
  const exportActivityMutation = useExportActivityLogs();
  const exportSecurityMutation = useExportSecurityEvents();

  const openDetail = (item: LogsSecurityDetailItem) => {
    setSelectedDetail(item);
    detailDisclosure.onOpen();
  };

  const userReviewRows = useMemo<UserSecuritySummary[]>(() => {
    const eventRows = securityEventsQuery.data?.items || [];
    const sessionRows = sessionsQuery.data?.items || [];
    const grouped = new Map<string, UserSecuritySummary>();
    eventRows.forEach((event) => {
      if (!event.user?.id) return;
      const current = grouped.get(event.user.id) || {
        user: { id: event.user.id, name: event.user.name || null, email: event.user.email || null, accountStatus: "active" },
        lastSuccessfulLogin: null,
        lastFailedLogin: null,
        repeatedFailedLoginCount: 0,
        passwordResetRequests: 0,
        passwordResetCompletions: 0,
        verificationEvents: 0,
        activeSessionsCount: 0,
        revokedSessionsCount: 0,
        suspiciousFlags: [],
        recentSecurityAdminActions: [],
        reviewStatus: "pending",
      };
      if (event.eventType === "login_failed") {
        current.repeatedFailedLoginCount += 1;
        current.lastFailedLogin = event.timestamp;
      }
      if (event.eventType === "login_succeeded") current.lastSuccessfulLogin = event.timestamp;
      if (event.eventType === "password_reset_requested") current.passwordResetRequests += 1;
      if (event.eventType === "password_reset_completed") current.passwordResetCompletions += 1;
      if (["email_verified", "verification_email_sent"].includes(event.eventType)) current.verificationEvents += 1;
      if (event.reviewedAt) current.reviewStatus = "reviewed";
      grouped.set(event.user.id, current);
    });
    sessionRows.forEach((session) => {
      if (!session.user?.id) return;
      const current = grouped.get(session.user.id);
      if (!current) return;
      if (session.status === "active") current.activeSessionsCount += 1;
      if (session.status === "revoked") current.revokedSessionsCount += 1;
    });
    return Array.from(grouped.values()).filter((item) => item.repeatedFailedLoginCount > 0 || item.activeSessionsCount > 0);
  }, [securityEventsQuery.data?.items, sessionsQuery.data?.items]);

  const metrics = useMemo(() => {
    if (section === "activity") {
      return [
        { title: "Visible events", value: String(activityQuery.data?.pagination.total || 0), progress: Math.min(100, activityQuery.data?.pagination.total || 0) },
        { title: "Critical / high", value: String((activityQuery.data?.items || []).filter((item) => ["critical", "high"].includes(item.severity || "")).length), progress: Math.min(100, (activityQuery.data?.items || []).filter((item) => ["critical", "high"].includes(item.severity || "")).length * 10) },
        { title: "Admin sourced", value: String((activityQuery.data?.items || []).filter((item) => item.source === "admin").length), progress: Math.min(100, (activityQuery.data?.items || []).filter((item) => item.source === "admin").length * 8) },
        { title: "Targeted users", value: String((activityQuery.data?.items || []).filter((item) => item.targetUser?.id).length), progress: Math.min(100, (activityQuery.data?.items || []).filter((item) => item.targetUser?.id).length) },
      ];
    }
    if (section === "audit") {
      return [
        { title: "Audit records", value: String(auditQuery.data?.pagination.total || 0), progress: Math.min(100, auditQuery.data?.pagination.total || 0) },
        { title: "Actions with reasons", value: String((auditQuery.data?.items || []).filter((item) => item.reason).length), progress: Math.min(100, (auditQuery.data?.items || []).filter((item) => item.reason).length) },
        { title: "User-targeted", value: String((auditQuery.data?.items || []).filter((item) => item.targetAccount?.id).length), progress: Math.min(100, (auditQuery.data?.items || []).filter((item) => item.targetAccount?.id).length) },
        { title: "Admin actors", value: String(new Set((auditQuery.data?.items || []).map((item) => item.actor?.email).filter(Boolean)).size), progress: 100 },
      ];
    }
    if (section === "security-overview") {
      return securityOverviewQuery.data ? [
        { title: "Failed logins", value: String(securityOverviewQuery.data.totalFailedLogins), progress: Math.min(100, securityOverviewQuery.data.totalFailedLogins) },
        { title: "Suspicious", value: String(securityOverviewQuery.data.suspiciousLoginAttempts), progress: Math.min(100, securityOverviewQuery.data.suspiciousLoginAttempts * 10) },
        { title: "Active sessions", value: String(securityOverviewQuery.data.activeSessionsCount), progress: Math.min(100, securityOverviewQuery.data.activeSessionsCount) },
        { title: "Under review", value: String(securityOverviewQuery.data.accountsUnderReview), progress: Math.min(100, securityOverviewQuery.data.accountsUnderReview * 6) },
      ] : [];
    }
    if (section === "security-events" || section === "reviews-notes") {
      return [
        { title: "Visible events", value: String(securityEventsQuery.data?.pagination.total || 0), progress: Math.min(100, securityEventsQuery.data?.pagination.total || 0) },
        { title: "Reviewed", value: String((securityEventsQuery.data?.items || []).filter((item) => item.reviewedAt).length), progress: Math.min(100, (securityEventsQuery.data?.items || []).filter((item) => item.reviewedAt).length * 8) },
        { title: "Acknowledged", value: String((securityEventsQuery.data?.items || []).filter((item) => item.acknowledgedAt).length), progress: Math.min(100, (securityEventsQuery.data?.items || []).filter((item) => item.acknowledgedAt).length * 8) },
        { title: "Resolved", value: String((securityEventsQuery.data?.items || []).filter((item) => item.resolvedAt).length), progress: Math.min(100, (securityEventsQuery.data?.items || []).filter((item) => item.resolvedAt).length * 8) },
      ];
    }
    if (section === "suspicious-activity") {
      return [
        { title: "Suspicious items", value: String(suspiciousQuery.data?.pagination.total || 0), progress: Math.min(100, suspiciousQuery.data?.pagination.total || 0) },
        { title: "Critical / high", value: String((suspiciousQuery.data?.items || []).filter((item) => ["critical", "high"].includes(item.severity)).length), progress: Math.min(100, (suspiciousQuery.data?.items || []).filter((item) => ["critical", "high"].includes(item.severity)).length * 10) },
        { title: "Repeated failures", value: String((suspiciousQuery.data?.items || []).filter((item) => "type" in item && item.type === "repeated_failed_logins").length), progress: Math.min(100, (suspiciousQuery.data?.items || []).filter((item) => "type" in item && item.type === "repeated_failed_logins").length * 10) },
        { title: "Event-backed", value: String((suspiciousQuery.data?.items || []).filter((item) => "eventId" in item).length), progress: Math.min(100, (suspiciousQuery.data?.items || []).filter((item) => "eventId" in item).length * 10) },
      ];
    }
    if (section === "sessions") {
      return [
        { title: "Visible sessions", value: String(sessionsQuery.data?.pagination.total || 0), progress: Math.min(100, sessionsQuery.data?.pagination.total || 0) },
        { title: "Active", value: String((sessionsQuery.data?.items || []).filter((item) => item.status === "active").length), progress: Math.min(100, (sessionsQuery.data?.items || []).filter((item) => item.status === "active").length) },
        { title: "Revoked", value: String((sessionsQuery.data?.items || []).filter((item) => item.status === "revoked").length), progress: Math.min(100, (sessionsQuery.data?.items || []).filter((item) => item.status === "revoked").length * 6) },
        { title: "Unique users", value: String(new Set((sessionsQuery.data?.items || []).map((item) => item.user?.id).filter(Boolean)).size), progress: 100 },
      ];
    }
    if (section === "user-security-review") {
      return [
        { title: "Users in review", value: String(userReviewRows.length), progress: Math.min(100, userReviewRows.length) },
        { title: "Repeated failures", value: String(userReviewRows.reduce((sum, item) => sum + item.repeatedFailedLoginCount, 0)), progress: Math.min(100, userReviewRows.reduce((sum, item) => sum + item.repeatedFailedLoginCount, 0)) },
        { title: "Active sessions", value: String(userReviewRows.reduce((sum, item) => sum + item.activeSessionsCount, 0)), progress: Math.min(100, userReviewRows.reduce((sum, item) => sum + item.activeSessionsCount, 0)) },
        { title: "Reviewed users", value: String(userReviewRows.filter((item) => item.reviewStatus === "reviewed").length), progress: Math.min(100, userReviewRows.filter((item) => item.reviewStatus === "reviewed").length * 8) },
      ];
    }
    if (section === "resource-timelines") {
      return [
        { title: "Timeline rows", value: String(timelineQuery.data?.pagination.total || 0), progress: Math.min(100, timelineQuery.data?.pagination.total || 0) },
        { title: "Search target", value: timelineResourceId || "Waiting", progress: timelineResourceId ? 100 : 0 },
        { title: "Resource type", value: timelineResourceType.replace(/_/g, " "), progress: 100 },
        { title: "Recent window", value: `${filters.limit || 50} rows`, progress: 100 },
      ];
    }
    return [
      { title: "Review items", value: String(reviewsQuery.data?.pagination.total || 0), progress: Math.min(100, reviewsQuery.data?.pagination.total || 0) },
      { title: "Pending", value: String((reviewsQuery.data?.items || []).filter((item) => !item.reviewedAt).length), progress: Math.min(100, (reviewsQuery.data?.items || []).filter((item) => !item.reviewedAt).length * 8) },
      { title: "Reviewed", value: String((reviewsQuery.data?.items || []).filter((item) => item.reviewedAt).length), progress: Math.min(100, (reviewsQuery.data?.items || []).filter((item) => item.reviewedAt).length * 8) },
      { title: "Critical", value: String((reviewsQuery.data?.items || []).filter((item) => item.severity === "critical").length), progress: Math.min(100, (reviewsQuery.data?.items || []).filter((item) => item.severity === "critical").length * 12) },
    ];
  }, [activityQuery.data, auditQuery.data, filters.limit, reviewsQuery.data, section, securityEventsQuery.data, securityOverviewQuery.data, sessionsQuery.data, suspiciousQuery.data, timelineQuery.data, timelineResourceId, timelineResourceType, userReviewRows]);

  const renderContent = () => {
    if (section === "activity") {
      if (activityQuery.isPending) return <TableLoader />;
      if (activityQuery.isError) return <ErrorState title="Unable to load activity logs" description="Retry after confirming the activity log endpoints are available." onAction={() => void activityQuery.refetch()} />;
      return <ActivityLogsTable rows={activityQuery.data?.items || []} onOpen={(item) => openDetail({ kind: "activity", item })} />;
    }
    if (section === "audit") {
      if (auditQuery.isPending) return <TableLoader />;
      if (auditQuery.isError) return <ErrorState title="Unable to load audit trail" description="Retry after confirming the audit endpoints are available." onAction={() => void auditQuery.refetch()} />;
      return <AuditTrailTable rows={auditQuery.data?.items || []} onOpen={(item) => openDetail({ kind: "audit", item })} />;
    }
    if (section === "security-overview") {
      if (securityOverviewQuery.isPending) return <SectionLoader />;
      if (securityOverviewQuery.isError || !securityOverviewQuery.data) return <ErrorState title="Unable to load security overview" description="Retry after confirming the security overview endpoint is available." onAction={() => void securityOverviewQuery.refetch()} />;
      return (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card><div className="p-5"><SecurityEventsTable rows={(securityEventsQuery.data?.items || []).slice(0, 10)} onOpen={(item) => openDetail({ kind: "security-event", item })} onAcknowledge={(item) => { setSelectedEvent(item); acknowledgeDisclosure.onOpen(); }} onResolve={(item) => { setSelectedEvent(item); resolveDisclosure.onOpen(); }} onMarkReviewed={(item) => { setSelectedEvent(item); reviewedDisclosure.onOpen(); }} /></div></Card>
          <Card><div className="p-5"><SessionsTable rows={(sessionsQuery.data?.items || []).slice(0, 10)} onOpen={(item) => openDetail({ kind: "session", item })} onRevoke={(item) => { setSelectedSession(item); revokeSessionDisclosure.onOpen(); }} /></div></Card>
        </div>
      );
    }
    if (section === "security-events") {
      if (securityEventsQuery.isPending) return <TableLoader />;
      if (securityEventsQuery.isError) return <ErrorState title="Unable to load security events" description="Retry after confirming the security events endpoints are available." onAction={() => void securityEventsQuery.refetch()} />;
      return <SecurityEventsTable rows={securityEventsQuery.data?.items || []} onOpen={(item) => openDetail({ kind: "security-event", item })} onAcknowledge={(item) => { setSelectedEvent(item); acknowledgeDisclosure.onOpen(); }} onResolve={(item) => { setSelectedEvent(item); resolveDisclosure.onOpen(); }} onMarkReviewed={(item) => { setSelectedEvent(item); reviewedDisclosure.onOpen(); }} />;
    }
    if (section === "suspicious-activity") {
      if (suspiciousQuery.isPending) return <TableLoader />;
      if (suspiciousQuery.isError) return <ErrorState title="Unable to load suspicious activity" description="Retry after confirming the suspicious activity endpoints are available." onAction={() => void suspiciousQuery.refetch()} />;
      return <SuspiciousActivityTable rows={suspiciousQuery.data?.items || []} onOpen={(item) => {
        if ("eventId" in item) {
          setSelectedEvent(item);
          if (item.user?.id) setSelectedUserId(item.user.id);
          openDetail({ kind: "security-event", item });
          return;
        }
        if (item.user?.id) setSelectedUserId(item.user.id);
        openDetail({ kind: "suspicious", item });
      }} />;
    }
    if (section === "sessions") {
      if (sessionsQuery.isPending) return <TableLoader />;
      if (sessionsQuery.isError) return <ErrorState title="Unable to load sessions" description="Retry after confirming the sessions endpoints are available." onAction={() => void sessionsQuery.refetch()} />;
      return <SessionsTable rows={sessionsQuery.data?.items || []} onOpen={(item) => openDetail({ kind: "session", item })} onRevoke={(item) => { setSelectedSession(item); revokeSessionDisclosure.onOpen(); }} />;
    }
    if (section === "user-security-review") {
      if (securityEventsQuery.isPending || sessionsQuery.isPending) return <TableLoader />;
      return <UserSecurityReviewTable rows={userReviewRows} onOpen={(item) => { setSelectedUserId(item.user.id); openDetail({ kind: "user-security", item }); }} onRevokeAll={(item) => { setSelectedUserId(item.user.id); revokeAllDisclosure.onOpen(); }} />;
    }
    if (section === "resource-timelines") {
      return (
        <div className="space-y-5">
          <Card>
            <div className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto]">
              <Select label="Resource type" options={[...resourceTypeOptions]} value={timelineResourceType} onChange={(event) => setTimelineResourceType(event.target.value as typeof timelineResourceType)} />
              <Input label="Resource id" value={timelineResourceId} onChange={(event) => setTimelineResourceId(event.target.value)} placeholder="Enter the exact user, router, server, billing, ticket, or incident id" />
              <div className="flex items-end"><Button onClick={() => void timelineQuery.refetch()} disabled={!timelineResourceId.trim()}>Load timeline</Button></div>
            </div>
          </Card>
          {timelineQuery.isPending ? <TableLoader /> : null}
          {timelineQuery.isError ? <ErrorState title="Unable to load resource timeline" description="Retry after confirming the selected resource exists and the timeline endpoint is available." onAction={() => void timelineQuery.refetch()} /> : null}
          {timelineResourceId && timelineQuery.data ? <ResourceTimelineViewer rows={timelineQuery.data.items || []} onOpen={(item) => openDetail({ kind: "timeline", item })} /> : null}
        </div>
      );
    }
    if (reviewsQuery.isPending) return <TableLoader />;
    if (reviewsQuery.isError) return <ErrorState title="Unable to load review items" description="Retry after confirming the review endpoints are available." onAction={() => void reviewsQuery.refetch()} />;
    return <SecurityEventsTable rows={reviewsQuery.data?.items || []} onOpen={(item) => openDetail({ kind: "security-event", item })} onAcknowledge={(item) => { setSelectedEvent(item); acknowledgeDisclosure.onOpen(); }} onResolve={(item) => { setSelectedEvent(item); resolveDisclosure.onOpen(); }} onMarkReviewed={(item) => { setSelectedEvent(item); reviewedDisclosure.onOpen(); }} />;
  };

  const detailItem = selectedDetail?.kind === "user-security" && selectedUserSummaryQuery.data ? { kind: "user-security" as const, item: selectedUserSummaryQuery.data } : selectedDetail;
  const canExportLogs = can(currentUser, permissions.logsExport);
  const canManageLogs = can(currentUser, permissions.logsManage);
  const showAddNote = ["security-events", "suspicious-activity", "user-security-review", "reviews-notes"].includes(section);

  return (
    <section className="space-y-6">
      <PageHeader title={sectionMeta.title} description={sectionMeta.description} meta="Logs, audit, and security" />
      <Tabs tabs={[...logsSecurityTabs]} value={location.pathname} onChange={navigate} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.title} title={metric.title} value={metric.value} progress={metric.progress} />)}
      </div>

      {section !== "resource-timelines" ? <LogsSecurityFilters section={section} filters={filters} onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))} /> : null}

      <Card>
        <DataToolbar>
          <div className="flex items-center gap-3">
            <div className="icon-block-primary rounded-2xl p-2 text-text-primary"><Icon className="h-4 w-4" /></div>
            <div>
              <p className="text-sm font-medium text-text-primary">{sectionMeta.title}</p>
              <p className="font-mono text-xs text-text-muted">{sectionMeta.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {section === "audit" && canExportLogs ? <Button variant="outline" onClick={() => exportAuditMutation.mutate([filters])}>Export CSV</Button> : null}
            {section === "activity" ? <Button variant="outline" onClick={() => exportActivityMutation.mutate([filters])}>Export CSV</Button> : null}
            {section === "security-events" && canExportLogs ? <Button variant="outline" onClick={() => exportSecurityMutation.mutate([filters])}>Export CSV</Button> : null}
            {showAddNote ? <Button variant="ghost" onClick={addNoteDisclosure.onOpen} disabled={!selectedEvent && !selectedUserId}>Add note</Button> : null}
            <RefreshButton
              loading={activityQuery.isFetching || auditQuery.isFetching || securityOverviewQuery.isFetching || securityEventsQuery.isFetching || suspiciousQuery.isFetching || sessionsQuery.isFetching || reviewsQuery.isFetching || timelineQuery.isFetching || selectedUserSummaryQuery.isFetching}
              onClick={() => {
                if (activityEnabled) void activityQuery.refetch();
                if (auditEnabled) void auditQuery.refetch();
                if (securityOverviewEnabled) void securityOverviewQuery.refetch();
                if (securityEventsEnabled) void securityEventsQuery.refetch();
                if (suspiciousEnabled) void suspiciousQuery.refetch();
                if (sessionsEnabled) void sessionsQuery.refetch();
                if (reviewsEnabled) void reviewsQuery.refetch();
                if (timelineEnabled) void timelineQuery.refetch();
                if (selectedUserId) void selectedUserSummaryQuery.refetch();
              }}
            />
          </div>
        </DataToolbar>
        <div className="mt-4 p-0 md:p-0">{renderContent()}</div>
      </Card>

      <LogsSecurityDetailsModal
        open={detailDisclosure.open}
        item={detailItem}
        onClose={detailDisclosure.onClose}
        onAcknowledge={selectedEvent ? () => { detailDisclosure.onClose(); acknowledgeDisclosure.onOpen(); } : undefined}
        onResolve={selectedEvent && canManageLogs ? () => { detailDisclosure.onClose(); resolveDisclosure.onOpen(); } : undefined}
        onMarkReviewed={selectedEvent ? () => { detailDisclosure.onClose(); reviewedDisclosure.onOpen(); } : undefined}
        onAddNote={selectedEvent ? () => { detailDisclosure.onClose(); addNoteDisclosure.onOpen(); } : undefined}
      />

      <LogsSecurityActionDialog open={acknowledgeDisclosure.open} title="Acknowledge security event" description="Record that this security event has been seen and triaged." confirmLabel="Acknowledge" loading={acknowledgeMutation.isPending} onClose={acknowledgeDisclosure.onClose} onConfirm={({ reason }) => selectedEvent && acknowledgeMutation.mutate([selectedEvent.eventId, reason] as never, { onSuccess: () => acknowledgeDisclosure.onClose() })} />
      <LogsSecurityActionDialog open={resolveDisclosure.open} title="Resolve security event" description="Mark the selected security event as resolved and capture context." confirmLabel="Resolve event" loading={resolveMutation.isPending} onClose={resolveDisclosure.onClose} onConfirm={({ reason }) => selectedEvent && resolveMutation.mutate([selectedEvent.eventId, reason] as never, { onSuccess: () => resolveDisclosure.onClose() })} />
      <LogsSecurityActionDialog open={reviewedDisclosure.open} title="Mark reviewed" description="Mark this event or user security item as reviewed." confirmLabel="Mark reviewed" loading={reviewedMutation.isPending} onClose={reviewedDisclosure.onClose} onConfirm={({ reason }) => reviewedMutation.mutate([{ eventId: selectedEvent?.eventId, userId: selectedUserId || undefined }, reason], { onSuccess: () => reviewedDisclosure.onClose() })} />
      <LogsSecurityActionDialog open={addNoteDisclosure.open} title="Add security note" description="Add investigation or follow-up context to the selected event or user." confirmLabel="Add note" requireBody loading={addNoteMutation.isPending} onClose={addNoteDisclosure.onClose} onConfirm={({ reason, body }) => addNoteMutation.mutate([{ eventId: selectedEvent?.eventId, userId: !selectedEvent ? selectedUserId || undefined : undefined }, { body: body || "", category: "review", reason }], { onSuccess: () => addNoteDisclosure.onClose() })} />
      <LogsSecurityActionDialog open={revokeSessionDisclosure.open} title="Revoke session" description="Immediately revoke the selected session and record a reason." confirmLabel="Revoke session" loading={revokeSessionMutation.isPending} onClose={revokeSessionDisclosure.onClose} onConfirm={({ reason }) => selectedSession && revokeSessionMutation.mutate([selectedSession.sessionId, reason] as never, { onSuccess: () => revokeSessionDisclosure.onClose() })} />
      <LogsSecurityActionDialog open={revokeAllDisclosure.open} title="Revoke all user sessions" description="Revoke every active session for the selected user." confirmLabel="Revoke all sessions" loading={revokeAllMutation.isPending} onClose={revokeAllDisclosure.onClose} onConfirm={({ reason }) => selectedUserId && revokeAllMutation.mutate([selectedUserId, reason] as never, { onSuccess: () => revokeAllDisclosure.onClose() })} />
    </section>
  );
}
