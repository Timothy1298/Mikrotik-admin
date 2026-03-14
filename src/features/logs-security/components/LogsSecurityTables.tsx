import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/data-display/DataTable";
import type {
  ActivityLogItem,
  AuditTrailItem,
  ResourceTimelineItem,
  SecurityEventItem,
  SessionItem,
  SuspiciousActivityItem,
  UserSecuritySummary,
} from "@/features/logs-security/types/logs-security.types";

function SeverityBadge({ value }: { value?: string | null }) {
  const tone = value === "critical" || value === "high" ? "danger" : value === "medium" ? "warning" : "info";
  return <Badge tone={tone as "danger" | "warning" | "info"}>{value || "normal"}</Badge>;
}

function StatusBadge({ value }: { value?: string | null }) {
  const tone = value === "revoked" || value === "resolved" ? "danger" : value === "active" ? "success" : "info";
  return <Badge tone={tone as "danger" | "success" | "info"}>{value || "unknown"}</Badge>;
}

export function ActivityLogsTable({ rows, onOpen }: { rows: ActivityLogItem[]; onOpen: (item: ActivityLogItem) => void }) {
  const columns: ColumnDef<ActivityLogItem>[] = [
    { header: "Event", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.summary}</p><p className="text-xs text-slate-500">{row.original.eventType}</p></div> },
    { header: "Actor", cell: ({ row }) => <div><p>{row.original.actor?.name || "System"}</p><p className="text-xs text-slate-500">{row.original.actor?.email || row.original.source || "system"}</p></div> },
    { header: "Resource", cell: ({ row }) => <div><p>{row.original.resourceType || "n/a"}</p><p className="text-xs text-slate-500">{row.original.resourceId || "No resource id"}</p></div> },
    { header: "Severity", cell: ({ row }) => <SeverityBadge value={row.original.severity} /> },
    { header: "Timestamp", cell: ({ row }) => <span className="text-xs text-slate-400">{new Date(row.original.timestamp).toLocaleString()}</span> },
  ];
  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No activity events found" emptyDescription="No activity events matched the current filters." />;
}

export function AuditTrailTable({ rows, onOpen }: { rows: AuditTrailItem[]; onOpen: (item: AuditTrailItem) => void }) {
  const columns: ColumnDef<AuditTrailItem>[] = [
    { header: "Action", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.actionType}</p><p className="text-xs text-slate-500">{row.original.reason || "No reason provided"}</p></div> },
    { header: "Actor", cell: ({ row }) => <div><p>{row.original.actor?.name || "Admin"}</p><p className="text-xs text-slate-500">{row.original.actor?.email || "unknown"}</p></div> },
    { header: "Resource", cell: ({ row }) => <div><p>{row.original.resourceType || "n/a"}</p><p className="text-xs text-slate-500">{row.original.resourceId || "No resource id"}</p></div> },
    { header: "Target", cell: ({ row }) => <div><p>{row.original.targetAccount?.name || "n/a"}</p><p className="text-xs text-slate-500">{row.original.targetAccount?.email || "No target email"}</p></div> },
    { header: "Timestamp", cell: ({ row }) => <span className="text-xs text-slate-400">{new Date(row.original.timestamp).toLocaleString()}</span> },
  ];
  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No audit records found" emptyDescription="No audit records matched the current filters." />;
}

export function SecurityEventsTable({
  rows,
  onOpen,
  onAcknowledge,
  onResolve,
  onMarkReviewed,
}: {
  rows: SecurityEventItem[];
  onOpen: (item: SecurityEventItem) => void;
  onAcknowledge?: (item: SecurityEventItem) => void;
  onResolve?: (item: SecurityEventItem) => void;
  onMarkReviewed?: (item: SecurityEventItem) => void;
}) {
  const columns: ColumnDef<SecurityEventItem>[] = [
    { header: "Event", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.eventType}</p><p className="text-xs text-slate-500">{row.original.reason || row.original.category}</p></div> },
    { header: "User", cell: ({ row }) => <div><p>{row.original.user?.name || "System"}</p><p className="text-xs text-slate-500">{row.original.user?.email || row.original.ipAddress || "No user context"}</p></div> },
    { header: "Severity", cell: ({ row }) => <SeverityBadge value={row.original.severity} /> },
    { header: "Status", cell: ({ row }) => <StatusBadge value={row.original.resolvedAt ? "resolved" : row.original.reviewedAt ? "reviewed" : row.original.acknowledgedAt ? "acknowledged" : row.original.success === false ? "failed" : "open"} /> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
          {onAcknowledge ? <Button size="sm" variant="ghost" onClick={() => onAcknowledge(row.original)}>Acknowledge</Button> : null}
          {onResolve ? <Button size="sm" variant="ghost" onClick={() => onResolve(row.original)}>Resolve</Button> : null}
          {onMarkReviewed ? <Button size="sm" variant="ghost" onClick={() => onMarkReviewed(row.original)}>Review</Button> : null}
        </div>
      ),
    },
  ];
  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No security events found" emptyDescription="No security events matched the current filters." />;
}

export function SuspiciousActivityTable({ rows, onOpen }: { rows: SuspiciousActivityItem[]; onOpen: (item: SuspiciousActivityItem) => void }) {
  const columns: ColumnDef<SuspiciousActivityItem>[] = [
    { header: "Issue", cell: ({ row }) => <div><p className="font-medium text-slate-100">{"summary" in row.original ? row.original.summary : row.original.reason || row.original.eventType}</p><p className="text-xs text-slate-500">{("eventType" in row.original ? row.original.eventType : row.original.type).replace(/_/g, " ")}</p></div> },
    { header: "User", cell: ({ row }) => <div><p>{row.original.user?.name || "No user"}</p><p className="text-xs text-slate-500">{row.original.user?.email || "No email context"}</p></div> },
    { header: "Severity", cell: ({ row }) => <SeverityBadge value={row.original.severity} /> },
    { header: "Timestamp", cell: ({ row }) => <span className="text-xs text-slate-400">{new Date(row.original.timestamp).toLocaleString()}</span> },
  ];
  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No suspicious activity found" emptyDescription="No suspicious items matched the current filters." />;
}

export function SessionsTable({
  rows,
  onOpen,
  onRevoke,
}: {
  rows: SessionItem[];
  onOpen: (item: SessionItem) => void;
  onRevoke?: (item: SessionItem) => void;
}) {
  const columns: ColumnDef<SessionItem>[] = [
    { header: "Session", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.sessionId}</p><p className="text-xs text-slate-500">{row.original.user?.email || row.original.userAgent || "No device summary"}</p></div> },
    { header: "User", cell: ({ row }) => <div><p>{row.original.user?.name || "Unknown user"}</p><p className="text-xs text-slate-500">{row.original.ipAddress || "No IP"}</p></div> },
    { header: "Status", cell: ({ row }) => <StatusBadge value={row.original.status} /> },
    { header: "Last seen", cell: ({ row }) => <span className="text-xs text-slate-400">{new Date(row.original.lastSeenAt || row.original.issuedAt || Date.now()).toLocaleString()}</span> },
    { header: "Actions", cell: ({ row }) => onRevoke ? <div onClick={(event) => event.stopPropagation()}><Button size="sm" variant="ghost" onClick={() => onRevoke(row.original)}>Revoke</Button></div> : null },
  ];
  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No sessions found" emptyDescription="No sessions matched the current filters." />;
}

export function UserSecurityReviewTable({ rows, onOpen, onRevokeAll }: { rows: UserSecuritySummary[]; onOpen: (item: UserSecuritySummary) => void; onRevokeAll?: (item: UserSecuritySummary) => void }) {
  const columns: ColumnDef<UserSecuritySummary>[] = [
    { header: "User", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.user.name || "Unknown user"}</p><p className="text-xs text-slate-500">{row.original.user.email || "No email"}</p></div> },
    { header: "Failures", cell: ({ row }) => row.original.repeatedFailedLoginCount },
    { header: "Sessions", cell: ({ row }) => <div><p>{row.original.activeSessionsCount} active</p><p className="text-xs text-slate-500">{row.original.revokedSessionsCount} revoked</p></div> },
    { header: "Review state", cell: ({ row }) => <StatusBadge value={row.original.reviewStatus} /> },
    { header: "Actions", cell: ({ row }) => onRevokeAll ? <div onClick={(event) => event.stopPropagation()}><Button size="sm" variant="ghost" onClick={() => onRevokeAll(row.original)}>Revoke all</Button></div> : null },
  ];
  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No user security reviews found" emptyDescription="No user security review items matched the current filters." />;
}

export function ResourceTimelineViewer({ rows, onOpen }: { rows: ResourceTimelineItem[]; onOpen?: (item: ResourceTimelineItem) => void }) {
  const columns: ColumnDef<ResourceTimelineItem>[] = [
    { header: "Event", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.summary}</p><p className="text-xs text-slate-500">{row.original.eventType}</p></div> },
    { header: "Category", cell: ({ row }) => <Badge tone="info">{row.original.category}</Badge> },
    { header: "Source", cell: ({ row }) => row.original.source || "system" },
    { header: "Timestamp", cell: ({ row }) => <span className="text-xs text-slate-400">{new Date(row.original.timestamp).toLocaleString()}</span> },
  ];
  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No timeline items found" emptyDescription="The selected resource did not return any timeline events." />;
}
