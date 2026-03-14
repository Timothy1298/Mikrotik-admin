import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { HealthStatusBadge } from "@/features/monitoring/components/HealthStatusBadge";
import { IncidentSeverityBadge } from "@/features/monitoring/components/IncidentSeverityBadge";
import type { MonitoringIncident } from "@/features/monitoring/types/monitoring.types";
import { formatDateTime } from "@/lib/formatters/date";

export function IncidentDetailsModal({
  open,
  incident,
  onClose,
}: {
  open: boolean;
  incident: MonitoringIncident | null;
  onClose: () => void;
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
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Severity</p><div className="mt-2"><IncidentSeverityBadge severity={incident.severity} /></div></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p><div className="mt-2"><HealthStatusBadge status={incident.status} /></div></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Source</p><p className="mt-2 text-sm text-slate-100">{incident.sourceType} / {incident.source}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Last seen</p><p className="mt-2 text-sm text-slate-100">{formatDateTime(incident.lastSeenAt)}</p></div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Impact</CardTitle>
              <CardDescription>Current affected resources</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3 text-sm text-slate-200">
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
              <div key={note.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone="info">{note.category}</Badge>
                  <span className="font-mono text-xs text-slate-500">{formatDateTime(note.createdAt)}</span>
                </div>
                <p className="mt-3 text-sm text-slate-200">{note.body}</p>
                <p className="mt-2 text-xs text-slate-500">{note.author}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </Modal>
  );
}
