import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  useAcknowledgeSecurityEvent,
  useMarkSecurityItemReviewed,
  useResolveSecurityEvent,
  useRevokeAllUserSessions,
  useRevokeSession,
} from "@/features/logs-security/hooks/useLogsSecurity";
import type { AuditTrailItem, LogsSecurityDetailItem, SecurityNote } from "@/features/logs-security/types/logs-security.types";
import { formatDateTime } from "@/lib/formatters/date";
import { appRoutes } from "@/config/routes";

type LogsWorkspaceState = {
  detail?: LogsSecurityDetailItem | null;
};

function formatActionType(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function NotesBlock({ notes }: { notes?: SecurityNote[] }) {
  if (!notes?.length) return <p className="text-sm text-text-muted">No notes attached.</p>;
  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div key={note.id} className="rounded-2xl border border-background-border bg-background-panel p-3">
          <p className="text-sm text-text-primary">{note.body}</p>
          <p className="mt-2 text-xs text-text-muted">{note.author} • {formatDateTime(note.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}

function MetadataBlock({ data }: { data?: Record<string, unknown> | null }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-sm text-text-muted">No additional metadata.</p>;
  }

  const hiddenKeys = ["__v", "_id", "updatedAt", "createdAt"];
  const entries = Object.entries(data).filter(([key]) => !hiddenKeys.includes(key));
  if (!entries.length) return <p className="text-sm text-text-muted">No additional metadata.</p>;

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-3 rounded-2xl border border-background-border bg-background-panel px-3 py-2">
          <span className="min-w-[120px] text-xs font-medium text-text-secondary">{formatActionType(key)}</span>
          <span className="text-xs text-text-primary">{typeof value === "object" ? JSON.stringify(value) : String(value ?? "null")}</span>
        </div>
      ))}
    </div>
  );
}

function AuditActionsBlock({ actions }: { actions: AuditTrailItem[] }) {
  if (!actions.length) return <p className="text-sm text-text-muted">No recent admin actions recorded.</p>;
  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <div key={`${action.auditId}-${index}`} className="rounded-2xl border border-background-border bg-background-panel p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-text-primary">{formatActionType(action.actionType)}</p>
            <span className="font-mono text-xs text-text-muted">{formatDateTime(action.timestamp)}</span>
          </div>
          <p className="mt-1 text-xs text-text-secondary">{action.actor?.email || "Unknown admin"}{action.reason ? ` • ${action.reason}` : ""}</p>
        </div>
      ))}
    </div>
  );
}

function getTitle(item: LogsSecurityDetailItem) {
  if (item.kind === "activity") return item.item.summary;
  if (item.kind === "audit") return formatActionType(item.item.actionType);
  if (item.kind === "session") return item.item.sessionId;
  if (item.kind === "user-security") return item.item.user.name || item.item.user.email || item.item.user.id;
  if (item.kind === "timeline") return item.item.summary;
  if (item.kind === "suspicious") return item.item.summary;
  return formatActionType(item.item.eventType);
}

export function LogsSecurityWorkspacePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LogsWorkspaceState;
  const detail = useMemo(() => state.detail || null, [state.detail]);

  const acknowledgeMutation = useAcknowledgeSecurityEvent();
  const resolveMutation = useResolveSecurityEvent();
  const reviewedMutation = useMarkSecurityItemReviewed();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllUserSessions();

  if (!detail) {
    return <ErrorState title="Unable to load logs workspace" description="This logs workspace needs a selected record from the logs tables. Open the item again from Logs, Audit & Security." onAction={() => navigate(appRoutes.logsSecuritySecurityOverview)} />;
  }

  const title = getTitle(detail);
  const userContext = detail.kind === "activity"
    ? detail.item.targetUser
    : detail.kind === "audit"
      ? detail.item.targetAccount
      : detail.kind === "security-event" || detail.kind === "suspicious"
        ? detail.item.user
        : detail.kind === "session"
          ? detail.item.user
          : detail.kind === "user-security"
            ? detail.item.user
            : null;
  const userName = userContext?.name || userContext?.email || "Unclassified record";
  const userEmail = userContext?.email || "No direct user email";

  return (
    <section className="space-y-6">
      <PageHeader title={userName} description="User-classified logs and security workspace for audit context, session review, and investigation actions." meta={userEmail} />

      <Card className="space-y-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-text-primary">{userName}</h2>
              <Badge tone="info">{detail.kind.replace(/-/g, " ")}</Badge>
              {detail.kind === "security-event" ? <Badge tone="warning">{detail.item.severity}</Badge> : null}
              {detail.kind === "suspicious" ? <Badge tone="warning">{detail.item.severity}</Badge> : null}
              {detail.kind === "session" ? <Badge tone={detail.item.status === "active" ? "success" : "neutral"}>{detail.item.status}</Badge> : null}
              {detail.kind === "user-security" ? <Badge tone="neutral">{detail.item.reviewStatus}</Badge> : null}
            </div>
            <p className="text-sm text-text-secondary">{userEmail}</p>
            <p className="text-sm text-text-secondary">Focused record: {title}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Security tools</p>
            <div className="flex flex-wrap gap-2">
              {detail.kind === "security-event" ? <Button variant="outline" onClick={() => acknowledgeMutation.mutate([detail.item.eventId, "Workspace acknowledgment"] as never)}>Acknowledge</Button> : null}
              {detail.kind === "security-event" ? <Button variant="outline" onClick={() => resolveMutation.mutate([detail.item.eventId, "Workspace resolution"] as never)}>Resolve</Button> : null}
              {detail.kind === "security-event" ? <Button variant="outline" onClick={() => reviewedMutation.mutate([{ eventId: detail.item.eventId }, "Workspace review"], { })}>Mark reviewed</Button> : null}
              {detail.kind === "session" ? <Button variant="outline" onClick={() => revokeSessionMutation.mutate([detail.item.sessionId, "Workspace revoke"] as never)}>Revoke session</Button> : null}
              {detail.kind === "user-security" ? <Button variant="outline" onClick={() => revokeAllMutation.mutate([detail.item.user.id, "Workspace revoke all"] as never)}>Revoke all sessions</Button> : null}
              <Button variant="ghost" onClick={() => navigate(appRoutes.logsSecuritySecurityOverview)}>Back to logs</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-4">
        <Card>
          <div className="space-y-3 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Classification</p>
            <p className="text-2xl font-semibold text-text-primary">{detail.kind.replace(/-/g, " ")}</p>
            <p className="text-sm text-text-secondary">Record family in the security workspace.</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-3 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Timestamp</p>
            <p className="text-2xl font-semibold text-text-primary">
              {detail.kind === "activity" || detail.kind === "audit" || detail.kind === "security-event" || detail.kind === "suspicious" || detail.kind === "timeline"
                ? formatDateTime(detail.item.timestamp)
                : detail.kind === "session"
                  ? formatDateTime(detail.item.lastSeenAt || detail.item.issuedAt)
                  : formatDateTime(detail.item.lastSuccessfulLogin || detail.item.lastFailedLogin)}
            </p>
            <p className="text-sm text-text-secondary">Latest visible activity for this user-classified record.</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-3 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">User link</p>
            <p className="text-2xl font-semibold text-text-primary">{userContext?.id || "None"}</p>
            <p className="text-sm text-text-secondary">Resolved user/account reference.</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-3 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Status</p>
            <p className="text-2xl font-semibold text-text-primary">
              {detail.kind === "session"
                ? detail.item.status
                : detail.kind === "security-event"
                  ? detail.item.resolvedAt ? "resolved" : detail.item.acknowledgedAt ? "acknowledged" : "open"
                  : detail.kind === "user-security"
                    ? detail.item.reviewStatus
                    : "active"}
            </p>
            <p className="text-sm text-text-secondary">Review or workflow state for this record.</p>
          </div>
        </Card>
      </div>

      {detail.kind === "activity" ? (
        <>
          <Card><div className="grid gap-3 p-5 md:grid-cols-2">
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Summary</p><p className="mt-2 text-sm text-text-primary">{detail.item.summary}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Actor</p><p className="mt-2 text-sm text-text-primary">{detail.item.actor?.name || "System"} • {detail.item.actor?.email || detail.item.source || "system"}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Resource</p><p className="mt-2 text-sm text-text-primary">{detail.item.resourceType || "n/a"} • {detail.item.resourceId || "No resource id"}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Timestamp</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(detail.item.timestamp)}</p></div>
          </div></Card>
          <Card><div className="p-5"><MetadataBlock data={detail.item.metadataPreview} /></div></Card>
        </>
      ) : null}

      {detail.kind === "audit" ? (
        <>
          <Card><div className="grid gap-3 p-5 md:grid-cols-2">
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Action</p><p className="mt-2 text-sm text-text-primary">{formatActionType(detail.item.actionType)}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Actor</p><p className="mt-2 text-sm text-text-primary">{detail.item.actor?.name || "Admin"} • {detail.item.actor?.email || "unknown"}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Target</p><p className="mt-2 text-sm text-text-primary">{detail.item.targetAccount?.email || detail.item.resourceId || "No target context"}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Reason</p><p className="mt-2 text-sm text-text-primary">{detail.item.reason || "No explicit reason recorded"}</p></div>
          </div></Card>
          <Card><div className="p-5"><MetadataBlock data={detail.item.metadata} /></div></Card>
        </>
      ) : null}

      {detail.kind === "security-event" || detail.kind === "suspicious" ? (
        <>
          <Card><div className="grid gap-3 p-5 md:grid-cols-2">
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Event</p><p className="mt-1 text-sm text-text-primary">{formatActionType("eventType" in detail.item ? detail.item.eventType : detail.item.type)}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Severity</p><p className="mt-1 text-sm text-text-primary">{detail.item.severity}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">User</p><p className="mt-1 text-sm text-text-primary">{detail.item.user?.email || "No user context"}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Timestamp</p><p className="mt-1 text-sm text-text-primary">{formatDateTime(detail.item.timestamp)}</p></div>
          </div></Card>
          {"notes" in detail.item ? <Card><div className="p-5"><NotesBlock notes={detail.item.notes} /></div></Card> : null}
          {"metadata" in detail.item ? <Card><div className="p-5"><MetadataBlock data={detail.item.metadata} /></div></Card> : null}
        </>
      ) : null}

      {detail.kind === "session" ? (
        <Card><div className="grid gap-3 p-5 md:grid-cols-2">
          <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Session</p><p className="mt-2 text-sm text-text-primary">{detail.item.sessionId}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-primary">User</p><p className="mt-2 text-sm text-text-primary">{detail.item.user?.email || "Unknown user"}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Issued</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(detail.item.issuedAt)}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Last seen</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(detail.item.lastSeenAt)}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Client</p><p className="mt-2 text-sm text-text-primary">{detail.item.ipAddress || "No IP"} • {detail.item.userAgent || "No user-agent"}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Revocation</p><p className="mt-2 text-sm text-text-primary">{detail.item.revokedAt ? `${formatDateTime(detail.item.revokedAt)} by ${detail.item.revokedBy || "system"}` : "Active"}</p></div>
        </div></Card>
      ) : null}

      {detail.kind === "user-security" ? (
        <>
          <Card><div className="grid gap-3 p-5 md:grid-cols-2">
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">User</p><p className="mt-2 text-sm text-text-primary">{detail.item.user.name || "Unknown user"} • {detail.item.user.email || "No email"}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Review state</p><p className="mt-2 text-sm text-text-primary">{detail.item.reviewStatus}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Failed logins</p><p className="mt-2 text-sm text-text-primary">{detail.item.repeatedFailedLoginCount}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Sessions</p><p className="mt-2 text-sm text-text-primary">{detail.item.activeSessionsCount} active • {detail.item.revokedSessionsCount} revoked</p></div>
          </div></Card>
          <Card><div className="p-5"><AuditActionsBlock actions={detail.item.recentSecurityAdminActions || []} /></div></Card>
        </>
      ) : null}

      {detail.kind === "timeline" ? (
        <Card><div className="grid gap-3 p-5 md:grid-cols-2">
          <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Summary</p><p className="mt-2 text-sm text-text-primary">{detail.item.summary}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Category</p><p className="mt-2 text-sm text-text-primary">{detail.item.category}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Source</p><p className="mt-2 text-sm text-text-primary">{detail.item.source || "system"}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Timestamp</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(detail.item.timestamp)}</p></div>
          <div className="md:col-span-2"><p className="text-xs uppercase tracking-[0.18em] text-primary">Metadata</p><div className="mt-2"><MetadataBlock data={detail.item.metadataPreview} /></div></div>
        </div></Card>
      ) : null}
    </section>
  );
}
