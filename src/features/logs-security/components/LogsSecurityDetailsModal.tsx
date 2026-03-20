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
  if (!notes?.length) return <p className="text-sm text-slate-500">No notes attached.</p>;
  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div key={note.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-3">
          <p className="text-sm text-slate-100">{note.body}</p>
          <p className="mt-2 text-xs text-slate-500">{note.author} · {formatDateTime(note.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}

function MetadataBlock({ data }: { data?: Record<string, unknown> | null }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-sm text-slate-500">No additional metadata.</p>;
  }

  const HIDDEN_KEYS = ["__v", "_id", "updatedAt", "createdAt"];
  const entries = Object.entries(data).filter(([key]) => !HIDDEN_KEYS.includes(key));
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No additional metadata.</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-3 rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-3 py-2">
          <span className="min-w-[120px] text-xs font-medium text-slate-400">{formatActionType(key)}</span>
          <span className="text-xs text-slate-200">{typeof value === "object" ? JSON.stringify(value) : String(value ?? "null")}</span>
        </div>
      ))}
    </div>
  );
}

function AuditActionsBlock({ actions }: { actions: AuditTrailItem[] }) {
  if (!actions.length) {
    return <p className="text-sm text-slate-500">No recent admin actions recorded.</p>;
  }
  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <div key={`${action.auditId}-${index}`} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-100">{formatActionType(action.actionType)}</p>
            <span className="font-mono text-xs text-slate-500">{formatDateTime(action.timestamp)}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{action.actor?.email || "Unknown admin"}{action.reason ? ` · ${action.reason}` : ""}</p>
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
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Summary</p><p className="mt-2 text-sm text-slate-100">{item.item.summary}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Actor</p><p className="mt-2 text-sm text-slate-100">{item.item.actor?.name || "System"} · {item.item.actor?.email || item.item.source || "system"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Resource</p><p className="mt-2 text-sm text-slate-100">{item.item.resourceType || "n/a"} · {item.item.resourceId || "No resource id"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Timestamp</p><p className="mt-2 text-sm text-slate-100">{formatDateTime(item.item.timestamp)}</p></div>
              </div></Card>
              <Card><div className="p-5"><MetadataBlock data={item.item.metadataPreview} /></div></Card>
            </>
          ) : null}

          {item.kind === "audit" ? (
            <>
              <Card><div className="grid gap-3 p-5 md:grid-cols-2">
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Action</p><p className="mt-2 text-sm text-slate-100">{formatActionType(item.item.actionType)}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Actor</p><p className="mt-2 text-sm text-slate-100">{item.item.actor?.name || "Admin"} · {item.item.actor?.email || "unknown"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Target</p><p className="mt-2 text-sm text-slate-100">{item.item.targetAccount?.email || item.item.resourceId || "No target context"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Reason</p><p className="mt-2 text-sm text-slate-100">{item.item.reason || "No explicit reason recorded"}</p></div>
              </div></Card>
              <Card><div className="p-5"><MetadataBlock data={item.item.metadata} /></div></Card>
            </>
          ) : null}

          {item.kind === "security-event" || item.kind === "suspicious" ? (
            <>
              <Card><div className="grid gap-3 p-5 md:grid-cols-2">
                <div className="flex items-center gap-3"><ShieldAlert className="h-5 w-5 text-brand-200" /><div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Event</p><p className="mt-1 text-sm text-slate-100">{formatActionType("eventType" in item.item ? item.item.eventType : item.item.type)}</p></div></div>
                <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-danger-300" /><div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Severity</p><p className="mt-1 text-sm text-slate-100">{item.item.severity}</p></div></div>
                <div className="flex items-center gap-3"><Fingerprint className="h-5 w-5 text-brand-200" /><div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">User</p><p className="mt-1 text-sm text-slate-100">{item.item.user?.email || "No user context"}</p></div></div>
                <div className="flex items-center gap-3"><Clock3 className="h-5 w-5 text-brand-200" /><div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Timestamp</p><p className="mt-1 text-sm text-slate-100">{formatDateTime(item.item.timestamp)}</p></div></div>
              </div></Card>
              {"notes" in item.item ? <Card><div className="p-5"><NotesBlock notes={item.item.notes} /></div></Card> : null}
              {"metadata" in item.item ? <Card><div className="p-5"><MetadataBlock data={item.item.metadata} /></div></Card> : null}
              {item.kind === "security-event" ? (
                <div className="flex flex-wrap gap-2 border-t border-brand-500/15 pt-2">
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
              <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Session</p><p className="mt-2 text-sm text-slate-100">{item.item.sessionId}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">User</p><p className="mt-2 text-sm text-slate-100">{item.item.user?.email || "Unknown user"}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Issued</p><p className="mt-2 text-sm text-slate-100">{formatDateTime(item.item.issuedAt)}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Last seen</p><p className="mt-2 text-sm text-slate-100">{formatDateTime(item.item.lastSeenAt)}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Client</p><p className="mt-2 text-sm text-slate-100">{item.item.ipAddress || "No IP"} · {item.item.userAgent || "No user-agent"}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Revocation</p><p className="mt-2 text-sm text-slate-100">{item.item.revokedAt ? `${formatDateTime(item.item.revokedAt)} by ${item.item.revokedBy || "system"}` : "Active"}</p></div>
            </div></Card>
          ) : null}

          {item.kind === "user-security" ? (
            <>
              <Card><div className="grid gap-3 p-5 md:grid-cols-2">
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">User</p><p className="mt-2 text-sm text-slate-100">{item.item.user.name || "Unknown user"} · {item.item.user.email || "No email"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Review state</p><p className="mt-2 text-sm text-slate-100">{item.item.reviewStatus}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Failed logins</p><p className="mt-2 text-sm text-slate-100">{item.item.repeatedFailedLoginCount}</p></div>
                <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Sessions</p><p className="mt-2 text-sm text-slate-100">{item.item.activeSessionsCount} active · {item.item.revokedSessionsCount} revoked</p></div>
              </div></Card>
              <Card><div className="p-5"><AuditActionsBlock actions={item.item.recentSecurityAdminActions || []} /></div></Card>
            </>
          ) : null}

          {item.kind === "timeline" ? (
            <Card><div className="grid gap-3 p-5 md:grid-cols-2">
              <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Summary</p><p className="mt-2 text-sm text-slate-100">{item.item.summary}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Category</p><p className="mt-2 text-sm text-slate-100">{item.item.category}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Source</p><p className="mt-2 text-sm text-slate-100">{item.item.source || "system"}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Timestamp</p><p className="mt-2 text-sm text-slate-100">{formatDateTime(item.item.timestamp)}</p></div>
              <div className="md:col-span-2"><p className="text-xs uppercase tracking-[0.18em] text-brand-100">Metadata</p><div className="mt-2"><MetadataBlock data={item.item.metadataPreview} /></div></div>
            </div></Card>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
