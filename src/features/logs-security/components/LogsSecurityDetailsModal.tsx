import { AlertTriangle, Clock3, Fingerprint, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import type { AuditTrailItem, LogsSecurityDetailItem, SecurityNote } from "@/features/logs-security/types/logs-security.types";
import { formatDateTime } from "@/lib/formatters/date";

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
          <p className="mt-2 text-xs text-text-muted">{note.author} · {formatDateTime(note.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}

function MetadataBlock({ data }: { data?: Record<string, unknown> | null }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-sm text-text-muted">No additional metadata.</p>;
  }

  const HIDDEN_KEYS = ["__v", "_id", "updatedAt", "createdAt"];
  const entries = Object.entries(data).filter(([key]) => !HIDDEN_KEYS.includes(key));
  if (entries.length === 0) {
    return <p className="text-sm text-text-muted">No additional metadata.</p>;
  }

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
  if (!actions.length) {
    return <p className="text-sm text-text-muted">No recent admin actions recorded.</p>;
  }
  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <div key={`${action.auditId}-${index}`} className="rounded-2xl border border-background-border bg-background-panel p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-text-primary">{formatActionType(action.actionType)}</p>
            <span className="font-mono text-xs text-text-muted">{formatDateTime(action.timestamp)}</span>
          </div>
          <p className="mt-1 text-xs text-text-secondary">{action.actor?.email || "Unknown admin"}{action.reason ? ` · ${action.reason}` : ""}</p>
        </div>
      ))}
    </div>
  );
}

export function LogsSecurityDetailsModal({
  open,
  item,
  onClose,
  onAcknowledge,
  onResolve,
  onMarkReviewed,
  onAddNote,
}: {
  open: boolean;
  item: LogsSecurityDetailItem | null;
  onClose: () => void;
  onAcknowledge?: () => void;
  onResolve?: () => void;
  onMarkReviewed?: () => void;
  onAddNote?: () => void;
}) {
  const title = item?.kind === "activity"
    ? "Activity Event Details"
    : item?.kind === "audit"
      ? "Audit Record Details"
      : item?.kind === "session"
        ? "Session Details"
        : item?.kind === "user-security"
          ? "User Security Details"
          : item?.kind === "timeline"
            ? "Timeline Event Details"
            : "Security Event Details";

  const description = item?.kind === "activity"
    ? "Platform-wide activity context, actor identity, target resource, and metadata."
    : item?.kind === "audit"
      ? "Sensitive admin action context including actor, reason, target, and metadata."
      : item?.kind === "session"
        ? "Session issuance, activity, revocation, and client context."
        : item?.kind === "user-security"
          ? "User-focused security posture, active sessions, repeated failures, and recent admin interventions."
          : item?.kind === "timeline"
            ? "Normalized resource timeline event context."
            : "Security event, impact, review state, and related note context.";

  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      {!item ? null : (
        <div className="space-y-4">
          {item.kind === "activity" ? (
            <>
              <Card><div className="grid gap-3 p-5 md:grid-cols-2">
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Summary</p><p className="mt-2 text-sm text-text-primary">{item.item.summary}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Actor</p><p className="mt-2 text-sm text-text-primary">{item.item.actor?.name || "System"} · {item.item.actor?.email || item.item.source || "system"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Resource</p><p className="mt-2 text-sm text-text-primary">{item.item.resourceType || "n/a"} · {item.item.resourceId || "No resource id"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Timestamp</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(item.item.timestamp)}</p></div>
              </div></Card>
              <Card><div className="p-5"><MetadataBlock data={item.item.metadataPreview} /></div></Card>
            </>
          ) : null}

          {item.kind === "audit" ? (
            <>
              <Card><div className="grid gap-3 p-5 md:grid-cols-2">
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Action</p><p className="mt-2 text-sm text-text-primary">{formatActionType(item.item.actionType)}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Actor</p><p className="mt-2 text-sm text-text-primary">{item.item.actor?.name || "Admin"} · {item.item.actor?.email || "unknown"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Target</p><p className="mt-2 text-sm text-text-primary">{item.item.targetAccount?.email || item.item.resourceId || "No target context"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Reason</p><p className="mt-2 text-sm text-text-primary">{item.item.reason || "No explicit reason recorded"}</p></div>
              </div></Card>
              <Card><div className="p-5"><MetadataBlock data={item.item.metadata} /></div></Card>
            </>
          ) : null}

          {item.kind === "security-event" || item.kind === "suspicious" ? (
            <>
              <Card><div className="grid gap-3 p-5 md:grid-cols-2">
                <div className="flex items-center gap-3"><ShieldAlert className="h-5 w-5 text-primary" /><div><p className="text-xs uppercase tracking-[0.18em] text-primary">Event</p><p className="mt-1 text-sm text-text-primary">{formatActionType("eventType" in item.item ? item.item.eventType : item.item.type)}</p></div></div>
                <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-danger" /><div><p className="text-xs uppercase tracking-[0.18em] text-primary">Severity</p><p className="mt-1 text-sm text-text-primary">{item.item.severity}</p></div></div>
                <div className="flex items-center gap-3"><Fingerprint className="h-5 w-5 text-primary" /><div><p className="text-xs uppercase tracking-[0.18em] text-primary">User</p><p className="mt-1 text-sm text-text-primary">{item.item.user?.email || "No user context"}</p></div></div>
                <div className="flex items-center gap-3"><Clock3 className="h-5 w-5 text-primary" /><div><p className="text-xs uppercase tracking-[0.18em] text-primary">Timestamp</p><p className="mt-1 text-sm text-text-primary">{formatDateTime(item.item.timestamp)}</p></div></div>
              </div></Card>
              {"notes" in item.item ? <Card><div className="p-5"><NotesBlock notes={item.item.notes} /></div></Card> : null}
              {"metadata" in item.item ? <Card><div className="p-5"><MetadataBlock data={item.item.metadata} /></div></Card> : null}
              {item.kind === "security-event" ? (
                <div className="flex flex-wrap gap-2 border-t border-background-border pt-2">
                  {!item.item.acknowledgedAt && onAcknowledge ? <Button variant="outline" onClick={onAcknowledge}>Acknowledge</Button> : null}
                  {!item.item.resolvedAt && onResolve ? <Button variant="outline" onClick={onResolve}>Resolve</Button> : null}
                  {!item.item.reviewedAt && onMarkReviewed ? <Button variant="outline" onClick={onMarkReviewed}>Mark reviewed</Button> : null}
                  {onAddNote ? <Button variant="outline" onClick={onAddNote}>Add note</Button> : null}
                </div>
              ) : null}
            </>
          ) : null}

          {item.kind === "session" ? (
            <Card><div className="grid gap-3 p-5 md:grid-cols-2">
              <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Session</p><p className="mt-2 text-sm text-text-primary">{item.item.sessionId}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-primary">User</p><p className="mt-2 text-sm text-text-primary">{item.item.user?.email || "Unknown user"}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Issued</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(item.item.issuedAt)}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Last seen</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(item.item.lastSeenAt)}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Client</p><p className="mt-2 text-sm text-text-primary">{item.item.ipAddress || "No IP"} · {item.item.userAgent || "No user-agent"}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Revocation</p><p className="mt-2 text-sm text-text-primary">{item.item.revokedAt ? `${formatDateTime(item.item.revokedAt)} by ${item.item.revokedBy || "system"}` : "Active"}</p></div>
            </div></Card>
          ) : null}

          {item.kind === "user-security" ? (
            <>
              <Card><div className="grid gap-3 p-5 md:grid-cols-2">
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">User</p><p className="mt-2 text-sm text-text-primary">{item.item.user.name || "Unknown user"} · {item.item.user.email || "No email"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Review state</p><p className="mt-2 text-sm text-text-primary">{item.item.reviewStatus}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Failed logins</p><p className="mt-2 text-sm text-text-primary">{item.item.repeatedFailedLoginCount}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Sessions</p><p className="mt-2 text-sm text-text-primary">{item.item.activeSessionsCount} active · {item.item.revokedSessionsCount} revoked</p></div>
              </div></Card>
              <Card><div className="p-5"><AuditActionsBlock actions={item.item.recentSecurityAdminActions || []} /></div></Card>
            </>
          ) : null}

          {item.kind === "timeline" ? (
            <Card><div className="grid gap-3 p-5 md:grid-cols-2">
              <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Summary</p><p className="mt-2 text-sm text-text-primary">{item.item.summary}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Category</p><p className="mt-2 text-sm text-text-primary">{item.item.category}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Source</p><p className="mt-2 text-sm text-text-primary">{item.item.source || "system"}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Timestamp</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(item.item.timestamp)}</p></div>
              <div className="md:col-span-2"><p className="text-xs uppercase tracking-[0.18em] text-primary">Metadata</p><div className="mt-2"><MetadataBlock data={item.item.metadataPreview} /></div></div>
            </div></Card>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
