import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { Dropdown } from "@/components/ui/Dropdown";
import { HealthStatusBadge } from "@/features/monitoring/components/HealthStatusBadge";
import { IncidentSeverityBadge } from "@/features/monitoring/components/IncidentSeverityBadge";
import type { MonitoringIncident } from "@/features/monitoring/types/monitoring.types";
import { formatDateTime } from "@/lib/formatters/date";

export function IncidentsTable({
  rows,
  onOpen,
  onAcknowledge,
  onResolve,
  onMarkReviewed,
  onAddNote,
}: {
  rows: MonitoringIncident[];
  onOpen: (row: MonitoringIncident) => void;
  onAcknowledge: (row: MonitoringIncident) => void;
  onResolve: (row: MonitoringIncident) => void;
  onMarkReviewed: (row: MonitoringIncident) => void;
  onAddNote: (row: MonitoringIncident) => void;
}) {
  const columns = useMemo<ColumnDef<MonitoringIncident>[]>(() => [
    { header: "Incident", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.title}</p><p className="font-mono text-xs text-slate-500">{row.original.incidentKey}</p></div> },
    { header: "Type", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.type.replace(/_/g, " ")}</span> },
    { header: "Severity", cell: ({ row }) => <IncidentSeverityBadge severity={row.original.severity} /> },
    { header: "Status", cell: ({ row }) => <HealthStatusBadge status={row.original.status} /> },
    { header: "Impact", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.impact.affectedRouters} routers / {row.original.impact.affectedUsers} users</span> },
    { header: "Last seen", cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{formatDateTime(row.original.lastSeenAt)}</span> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown items={[
          { label: "Open details", onClick: () => onOpen(row.original) },
          { label: "Acknowledge", onClick: () => onAcknowledge(row.original) },
          { label: "Resolve", onClick: () => onResolve(row.original) },
          { label: "Mark reviewed", onClick: () => onMarkReviewed(row.original) },
          { label: "Add note", onClick: () => onAddNote(row.original) },
        ]} />
      ),
    },
  ], [onAcknowledge, onAddNote, onMarkReviewed, onOpen, onResolve]);

  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No incidents found" emptyDescription="No incidents matched the current filters." />;
}
