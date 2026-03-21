import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { HealthStatusBadge } from "@/features/monitoring/components/HealthStatusBadge";
import { IncidentSeverityBadge } from "@/features/monitoring/components/IncidentSeverityBadge";
import type { MonitoringIncident } from "@/features/monitoring/types/monitoring.types";
import { formatDateTime } from "@/lib/formatters/date";

dayjs.extend(relativeTime);

export function IncidentDetailsModal({
  open,
  incident,
  onClose,
  onAcknowledge,
  onResolve,
  onMarkReviewed,
  onAddNote,
}: {
  open: boolean;
  incident: MonitoringIncident | null;
  onClose: () => void;
  onAcknowledge?: () => void;
  onResolve?: () => void;
  onMarkReviewed?: () => void;
  onAddNote?: () => void;
}) {
  if (!open || !incident) return null;

  return (
    <Modal open={open} title={incident.title} description={incident.summary || "Operational incident detail"} onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Summary</CardTitle>
              <CardDescription>{incident.incidentKey}</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Severity</p><div className="mt-2"><IncidentSeverityBadge severity={incident.severity} /></div></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Status</p><div className="mt-2"><HealthStatusBadge status={incident.status} /></div></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Source</p><p className="mt-2 text-sm text-text-primary">{incident.sourceType} / {incident.source}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Last seen</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(incident.lastSeenAt)}</p></div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Impact</CardTitle>
              <CardDescription>Current affected resources</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3 text-sm text-text-primary">
            <p>{incident.impact.affectedRouters} routers affected</p>
            <p>{incident.impact.affectedUsers} users affected</p>
            {incident.relatedRouter ? <p>Router: {incident.relatedRouter.name}</p> : null}
            {incident.relatedServer ? <p>Server: {incident.relatedServer.name} ({incident.relatedServer.nodeId})</p> : null}
            {incident.relatedUser ? <p>User: {incident.relatedUser.name || incident.relatedUser.email}</p> : null}
          </div>
        </Card>
      </div>

      {incident.notes.length ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Notes / timeline</CardTitle>
              <CardDescription>Stored incident follow-up and review context.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {incident.notes.map((note) => (
              <div key={note.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone="info">{note.category}</Badge>
                  <span className="font-mono text-xs text-text-muted">{dayjs(note.createdAt).fromNow()}</span>
                </div>
                <p className="mt-3 text-text-primary">{note.body}</p>
                <p className="mt-2 text-xs text-text-muted">by {note.author} • {formatDateTime(note.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-2 border-t border-background-border pt-2">
        {incident.status === "open" && onAcknowledge ? <Button variant="outline" onClick={onAcknowledge}>Acknowledge</Button> : null}
        {incident.status !== "resolved" && onResolve ? <Button variant="danger" onClick={onResolve}>Resolve</Button> : null}
        {incident.status === "resolved" && onMarkReviewed ? <Button variant="outline" onClick={onMarkReviewed}>Mark reviewed</Button> : null}
        {onAddNote ? <Button variant="outline" onClick={onAddNote}>Add note</Button> : null}
      </div>
    </Modal>
  );
}
