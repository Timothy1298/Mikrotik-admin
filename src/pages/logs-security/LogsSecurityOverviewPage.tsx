import { useMemo, useState } from "react";
import { AlertTriangle, Fingerprint, ShieldAlert, UserCog } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { logsSecurityTabs } from "@/config/module-tabs";
import { LogsSecurityDetailsModal } from "@/features/logs-security/components";
import {
  useActivityLogs,
  useAuditTrail,
  useSecurityEvents,
  useSecurityOverview,
  useSecurityReviews,
  useSessions,
  useSuspiciousActivity,
} from "@/features/logs-security/hooks/useLogsSecurity";
import type { LogsSecurityDetailItem } from "@/features/logs-security/types/logs-security.types";
import { useDisclosure } from "@/hooks/ui/useDisclosure";

export function LogsSecurityOverviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDetail, setSelectedDetail] = useState<LogsSecurityDetailItem | null>(null);
  const detailDisclosure = useDisclosure(false);

  const overviewQuery = useSecurityOverview();
  const activityQuery = useActivityLogs({ limit: 5 });
  const auditQuery = useAuditTrail({ limit: 5 });
  const securityEventsQuery = useSecurityEvents({ limit: 5 });
  const suspiciousQuery = useSuspiciousActivity({ limit: 5 });
  const sessionsQuery = useSessions({ limit: 5 });
  const reviewsQuery = useSecurityReviews({ limit: 5 });

  const isPending = overviewQuery.isPending || activityQuery.isPending || auditQuery.isPending || securityEventsQuery.isPending || suspiciousQuery.isPending || sessionsQuery.isPending || reviewsQuery.isPending;
  const isError = overviewQuery.isError;

  const metrics = useMemo(() => {
    if (!overviewQuery.data) return [];
    return [
      { title: "Activity events", value: String(activityQuery.data?.pagination.total || 0), progress: Math.min(100, activityQuery.data?.pagination.total || 0) },
      { title: "Audit actions", value: String(auditQuery.data?.pagination.total || 0), progress: Math.min(100, auditQuery.data?.pagination.total || 0) },
      { title: "Security events", value: String(securityEventsQuery.data?.pagination.total || 0), progress: Math.min(100, securityEventsQuery.data?.pagination.total || 0) },
      { title: "Failed logins", value: String(overviewQuery.data.totalFailedLogins), progress: Math.min(100, overviewQuery.data.totalFailedLogins) },
      { title: "Suspicious activity", value: String(suspiciousQuery.data?.pagination.total || 0), progress: Math.min(100, suspiciousQuery.data?.pagination.total || 0) },
      { title: "Active sessions", value: String(overviewQuery.data.activeSessionsCount), progress: Math.min(100, overviewQuery.data.activeSessionsCount) },
      { title: "Revoked sessions", value: String(overviewQuery.data.recentlyRevokedSessionsCount), progress: Math.min(100, overviewQuery.data.recentlyRevokedSessionsCount * 4) },
      { title: "Unresolved reviews", value: String(overviewQuery.data.unresolvedSecurityFlags), progress: Math.min(100, overviewQuery.data.unresolvedSecurityFlags * 5) },
    ];
  }, [activityQuery.data?.pagination.total, auditQuery.data?.pagination.total, overviewQuery.data, securityEventsQuery.data?.pagination.total, suspiciousQuery.data?.pagination.total]);

  const openDetail = (item: LogsSecurityDetailItem) => {
    setSelectedDetail(item);
    detailDisclosure.onOpen();
  };

  if (isPending) return <SectionLoader />;
  if (isError || !overviewQuery.data) return <ErrorState title="Unable to load logs, audit, and security overview" description="Retry after confirming the admin logs and security endpoints are available." onAction={() => void overviewQuery.refetch()} />;

  return (
    <section className="space-y-6">
      <PageHeader title="Logs, Audit & Security" description="Platform-wide command center for traceability, suspicious activity, session risk, and sensitive admin action visibility." meta="Security operations" />
      <Tabs tabs={[...logsSecurityTabs]} value={location.pathname} onChange={navigate} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.title} title={metric.title} value={metric.value} progress={metric.progress} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3"><div className="icon-block-primary rounded-2xl p-2 text-text-primary"><ShieldAlert className="h-4 w-4" /></div><div><p className="text-sm font-medium text-text-primary">Recent high-severity activity</p><p className="font-mono text-xs text-text-muted">Security events and suspicious findings</p></div></div>
            <RefreshButton loading={securityEventsQuery.isFetching || suspiciousQuery.isFetching} onClick={() => { void securityEventsQuery.refetch(); void suspiciousQuery.refetch(); }} />
          </div>
          <div className="space-y-3 px-5 pb-5">
            {[...(securityEventsQuery.data?.items || []).filter((item) => ["high", "critical"].includes(item.severity)), ...(suspiciousQuery.data?.items || [])].slice(0, 5).map((item, index) => {
              const title = "eventType" in item ? item.eventType : item.summary;
              const detail = item.user?.email || ("eventType" in item ? item.reason : item.summary) || "No additional context";
              return (
                <button
                  key={`${index}-${item.timestamp}`}
                  type="button"
                  onClick={() => openDetail("eventType" in item ? { kind: "security-event", item } : { kind: "suspicious", item })}
                  className="w-full rounded-2xl border border-background-border bg-background-panel p-4 text-left transition hover:border-primary/40 hover:bg-primary/10"
                >
                  <p className="font-medium text-text-primary">{title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{detail}</p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 p-5"><div className="icon-block-primary rounded-2xl p-2 text-text-primary"><UserCog className="h-4 w-4" /></div><div><p className="text-sm font-medium text-text-primary">Recent admin audit actions</p><p className="font-mono text-xs text-text-muted">Sensitive admin operations and reasons</p></div></div>
          <div className="space-y-3 px-5 pb-5">
            {(auditQuery.data?.items || []).map((item) => (
              <button key={item.id} type="button" onClick={() => openDetail({ kind: "audit", item })} className="w-full rounded-2xl border border-background-border bg-background-panel p-4 text-left transition hover:border-primary/40 hover:bg-primary/10">
                <p className="font-medium text-text-primary">{item.actionType}</p>
                <p className="mt-1 text-sm text-text-secondary">{item.actor?.email || "Unknown admin"} · {item.reason || "No reason recorded"}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 p-5"><div className="icon-block-primary rounded-2xl p-2 text-text-primary"><Fingerprint className="h-4 w-4" /></div><div><p className="text-sm font-medium text-text-primary">Session risk snapshot</p><p className="font-mono text-xs text-text-muted">Active and recently revoked sessions</p></div></div>
          <div className="grid gap-3 px-5 pb-5 md:grid-cols-2">
            {(sessionsQuery.data?.items || []).map((item) => (
              <button key={item.id} type="button" onClick={() => openDetail({ kind: "session", item })} className="rounded-2xl border border-background-border bg-background-panel p-4 text-left transition hover:border-primary/40 hover:bg-primary/10">
                <p className="font-medium text-text-primary">{item.user?.email || item.sessionId}</p>
                <p className="mt-1 text-sm text-text-secondary">{item.status} · {item.ipAddress || "No IP"}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 p-5"><div className="icon-block-primary rounded-2xl p-2 text-text-primary"><AlertTriangle className="h-4 w-4" /></div><div><p className="text-sm font-medium text-text-primary">Review queue</p><p className="font-mono text-xs text-text-muted">Reviewed and unresolved security items</p></div></div>
          <div className="space-y-3 px-5 pb-5">
            {(reviewsQuery.data?.items || []).map((item) => (
              <button key={item.id} type="button" onClick={() => openDetail({ kind: "security-event", item })} className="w-full rounded-2xl border border-background-border bg-background-panel p-4 text-left transition hover:border-primary/40 hover:bg-primary/10">
                <p className="font-medium text-text-primary">{item.eventType}</p>
                <p className="mt-1 text-sm text-text-secondary">{item.user?.email || "No user"} · {item.reviewedAt ? "Reviewed" : "Pending review"}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <LogsSecurityDetailsModal open={detailDisclosure.open} item={selectedDetail} onClose={detailDisclosure.onClose} />
    </section>
  );
}
