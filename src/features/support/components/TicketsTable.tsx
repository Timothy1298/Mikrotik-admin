import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/data-display/DataTable";
import { SLABadge, TicketAgeBadge, TicketCategoryBadge, TicketEscalationBadge, TicketPriorityBadge, TicketStatusBadge } from "@/features/support/components/SupportBadges";
import type { SupportTicketRow } from "@/features/support/types/support.types";

export function TicketsTable({
  rows,
  onOpen,
  onAssign,
  onReassign,
  onUnassign,
  onReply,
  onResolve,
  onEscalate,
}: {
  rows: SupportTicketRow[];
  onOpen: (row: SupportTicketRow) => void;
  onAssign?: (row: SupportTicketRow) => void;
  onReassign?: (row: SupportTicketRow) => void;
  onUnassign?: (row: SupportTicketRow) => void;
  onReply?: (row: SupportTicketRow) => void;
  onResolve?: (row: SupportTicketRow) => void;
  onEscalate?: (row: SupportTicketRow) => void;
}) {
  const columns: ColumnDef<SupportTicketRow>[] = [
    { header: "Ticket", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.subject}</p><p className="text-xs text-slate-500">{row.original.ticketReference}</p></div> },
    { header: "Customer", cell: ({ row }) => <div><p>{row.original.customer?.name || "Unknown customer"}</p><p className="text-xs text-slate-500">{row.original.customer?.email || "No email"}</p></div> },
    { header: "Status", cell: ({ row }) => <TicketStatusBadge status={row.original.status} /> },
    { header: "Priority", cell: ({ row }) => <TicketPriorityBadge priority={row.original.priority} /> },
    { header: "Category", cell: ({ row }) => <TicketCategoryBadge category={row.original.category} /> },
    { header: "Escalation", cell: ({ row }) => <TicketEscalationBadge escalated={row.original.escalated} /> },
    { header: "Assignee", cell: ({ row }) => <div><p>{row.original.assignee?.name || "Unassigned"}</p><p className="text-xs text-slate-500">{row.original.assignee?.supportTeam || row.original.assignedTeam}</p></div> },
    { header: "Awaiting", cell: ({ row }) => <span className="text-xs text-slate-400">{row.original.lastReplySummary.awaiting.replace(/_/g, " ")}</span> },
    {
      header: "Age",
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-2">
            <p>{row.original.age.ageHours}h</p>
            <TicketAgeBadge stale={row.original.age.stale} />
          </div>
          <p className="text-xs text-slate-500">{row.original.age.idleHours}h idle</p>
        </div>
      ),
    },
    { header: "SLA", cell: ({ row }) => <SLABadge breached={row.original.sla.breached} remaining={row.original.sla.resolutionRemainingHours} /> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
          {!row.original.assignee && onAssign ? <Button size="sm" variant="ghost" onClick={() => onAssign(row.original)}>Assign</Button> : null}
          {row.original.assignee && onReassign ? <Button size="sm" variant="ghost" onClick={() => onReassign(row.original)}>Reassign</Button> : null}
          {row.original.assignee && onUnassign ? <Button size="sm" variant="ghost" onClick={() => onUnassign(row.original)}>Unassign</Button> : null}
          {onReply ? <Button size="sm" variant="ghost" onClick={() => onReply(row.original)}>Reply</Button> : null}
          {onResolve ? <Button size="sm" variant="ghost" onClick={() => onResolve(row.original)}>Resolve</Button> : null}
          {onEscalate && !row.original.escalated ? <Button size="sm" variant="ghost" onClick={() => onEscalate(row.original)}>Escalate</Button> : null}
        </div>
      ),
    },
  ];

  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No tickets found" emptyDescription="No tickets matched the current filters." />;
}
