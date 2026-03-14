import { useMemo, useState } from "react";
import { Clock3, LifeBuoy, Link2, MessageSquare, ShieldAlert, UserCog } from "lucide-react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableLoader } from "@/components/feedback/TableLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataToolbar } from "@/components/shared/DataToolbar";
import { MetricCard } from "@/components/shared/MetricCard";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { SupportActionDialog, SupportFilters, TicketDetailsModal, TicketsTable } from "@/features/support/components";
import {
  useAddTicketFlag,
  useAddTicketNote,
  useAssignTicket,
  useAssigneeWorkload,
  useChangeTicketCategory,
  useChangeTicketPriority,
  useChangeTicketStatus,
  useCloseTicket,
  useDeEscalateTicket,
  useEscalateTicket,
  useEscalatedQueue,
  useMarkTicketReviewed,
  useReassignTicket,
  useRemoveTicketFlag,
  useReopenTicket,
  useReplyToTicket,
  useResolveTicket,
  useStaleQueue,
  useSupportAgents,
  useTicket,
  useTickets,
  useTicketsByAssignee,
  useUnassignTicket,
  useUnassignedQueue,
} from "@/features/support/hooks/useSupport";
import type { SupportFilterState, SupportSection, SupportTicketRow } from "@/features/support/types/support.types";
import { supportSections } from "@/features/support/utils/support-sections";
import { useDisclosure } from "@/hooks/ui/useDisclosure";

const sectionIcons: Record<SupportSection, typeof LifeBuoy> = {
  tickets: LifeBuoy,
  unassigned: UserCog,
  escalated: ShieldAlert,
  "high-priority": ShieldAlert,
  stale: Clock3,
  "by-assignee": UserCog,
  "linked-issues": Link2,
  conversations: MessageSquare,
  "notes-flags": LifeBuoy,
};

export function SupportSectionPage({ section }: { section: SupportSection }) {
  const sectionMeta = supportSections[section];
  const Icon = sectionIcons[section];
  const [filters, setFilters] = useState<SupportFilterState>({ limit: 50, sortBy: "updatedAt", sortOrder: "desc" });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRow | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [selectedFlagId, setSelectedFlagId] = useState("");
  const [priorityValue, setPriorityValue] = useState("high");
  const [statusValue, setStatusValue] = useState("in_progress");
  const [categoryValue, setCategoryValue] = useState("technical");
  const [assigneeValue, setAssigneeValue] = useState("");

  const detailDisclosure = useDisclosure(false);
  const assignDisclosure = useDisclosure(false);
  const reassignDisclosure = useDisclosure(false);
  const unassignDisclosure = useDisclosure(false);
  const statusDisclosure = useDisclosure(false);
  const priorityDisclosure = useDisclosure(false);
  const categoryDisclosure = useDisclosure(false);
  const escalateDisclosure = useDisclosure(false);
  const deEscalateDisclosure = useDisclosure(false);
  const resolveDisclosure = useDisclosure(false);
  const closeDisclosure = useDisclosure(false);
  const reopenDisclosure = useDisclosure(false);
  const replyDisclosure = useDisclosure(false);
  const reviewedDisclosure = useDisclosure(false);
  const noteDisclosure = useDisclosure(false);
  const flagDisclosure = useDisclosure(false);
  const removeFlagDisclosure = useDisclosure(false);

  const ticketsQuery = useTickets(filters);
  const unassignedQuery = useUnassignedQueue(filters);
  const escalatedQuery = useEscalatedQueue(filters);
  const staleQuery = useStaleQueue(filters);
  const workloadQuery = useAssigneeWorkload();
  const agentsQuery = useSupportAgents();
  const assigneeTicketsQuery = useTicketsByAssignee(selectedAssigneeId, filters);
  const selectedTicketDetailQuery = useTicket(selectedTicket?.id || "");

  const assignMutation = useAssignTicket();
  const reassignMutation = useReassignTicket();
  const unassignMutation = useUnassignTicket();
  const statusMutation = useChangeTicketStatus();
  const priorityMutation = useChangeTicketPriority();
  const categoryMutation = useChangeTicketCategory();
  const escalateMutation = useEscalateTicket();
  const deEscalateMutation = useDeEscalateTicket();
  const resolveMutation = useResolveTicket();
  const closeMutation = useCloseTicket();
  const reopenMutation = useReopenTicket();
  const replyMutation = useReplyToTicket();
  const reviewedMutation = useMarkTicketReviewed();
  const noteMutation = useAddTicketNote();
  const flagMutation = useAddTicketFlag();
  const removeFlagMutation = useRemoveTicketFlag();

  const baseRows = useMemo(() => {
    if (section === "unassigned") return unassignedQuery.data?.items || [];
    if (section === "escalated") return escalatedQuery.data?.items || [];
    if (section === "stale") return staleQuery.data?.items || [];
    if (section === "high-priority") return (ticketsQuery.data?.items || []).filter((item) => ["high", "urgent"].includes(item.priority));
    if (section === "linked-issues") return (ticketsQuery.data?.items || []).filter((item) => Object.values(item.relatedResourceSummary).some(Boolean));
    if (section === "conversations") return (ticketsQuery.data?.items || []).filter((item) => Boolean(item.lastReplySummary.at));
    if (section === "notes-flags") return (ticketsQuery.data?.items || []).filter((item) => item.flags.length > 0);
    if (section === "by-assignee") return assigneeTicketsQuery.data?.items || [];
    return ticketsQuery.data?.items || [];
  }, [section, unassignedQuery.data?.items, escalatedQuery.data?.items, staleQuery.data?.items, ticketsQuery.data?.items, assigneeTicketsQuery.data?.items]);

  const rows = baseRows;

  const metrics = useMemo(() => {
    if (section === "by-assignee") {
      return [
        { title: "Assignees", value: String((workloadQuery.data || []).length), progress: Math.min(100, (workloadQuery.data || []).length * 8) },
        { title: "Selected queue", value: String(rows.length), progress: Math.min(100, rows.length) },
        { title: "Open tickets", value: String(rows.filter((item) => ["open", "in_progress"].includes(item.status)).length), progress: Math.min(100, rows.filter((item) => ["open", "in_progress"].includes(item.status)).length * 6) },
        { title: "Escalated", value: String(rows.filter((item) => item.escalated).length), progress: Math.min(100, rows.filter((item) => item.escalated).length * 10) },
      ];
    }
    return [
      { title: "Visible tickets", value: String(rows.length), progress: Math.min(100, rows.length) },
      { title: "Awaiting admin", value: String(rows.filter((item) => item.lastReplySummary.awaiting === "awaiting_admin").length), progress: Math.min(100, rows.filter((item) => item.lastReplySummary.awaiting === "awaiting_admin").length * 8) },
      { title: "Escalated", value: String(rows.filter((item) => item.escalated).length), progress: Math.min(100, rows.filter((item) => item.escalated).length * 10) },
      { title: "VIP", value: String(rows.filter((item) => item.vip).length), progress: Math.min(100, rows.filter((item) => item.vip).length * 12) },
    ];
  }, [rows, section, workloadQuery.data]);

  const isPending = ticketsQuery.isPending || (section === "unassigned" && unassignedQuery.isPending) || (section === "escalated" && escalatedQuery.isPending) || (section === "stale" && staleQuery.isPending) || (section === "by-assignee" && selectedAssigneeId && assigneeTicketsQuery.isPending);
  const isError = ticketsQuery.isError || (section === "unassigned" && unassignedQuery.isError) || (section === "escalated" && escalatedQuery.isError) || (section === "stale" && staleQuery.isError) || (section === "by-assignee" && selectedAssigneeId && assigneeTicketsQuery.isError);

  const openTicket = (ticket: SupportTicketRow) => {
    setSelectedTicket(ticket);
    setAssigneeValue(ticket.assignee?.id || "");
    setPriorityValue(ticket.priority);
    setStatusValue(ticket.status);
    setCategoryValue(ticket.category);
    setSelectedFlagId(ticket.flags[0]?.id || "");
    detailDisclosure.onOpen();
  };

  return (
    <section className="space-y-6">
      <PageHeader title={sectionMeta.title} description={sectionMeta.description} meta="Support operations" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.title} title={metric.title} value={metric.value} progress={metric.progress} />)}
      </div>

      {section !== "by-assignee" ? <SupportFilters filters={filters} onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))} /> : null}

      {section === "by-assignee" ? (
        <Card>
          <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
            <div className="space-y-3">
              {(workloadQuery.data || []).map((item) => (
                <button key={item.assignee?.id || "unassigned"} type="button" onClick={() => setSelectedAssigneeId(item.assignee?.id || "")} className={`w-full rounded-2xl border p-4 text-left transition ${selectedAssigneeId === (item.assignee?.id || "") ? "border-brand-500/35 bg-[rgba(37,99,235,0.08)]" : "border-brand-500/15 bg-[rgba(8,14,31,0.9)] hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)]"}`}>
                  <p className="font-medium text-slate-100">{item.assignee?.name || "Unassigned"}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.openTickets} open · {item.escalatedTickets} escalated · {item.staleTickets} stale</p>
                </button>
              ))}
            </div>
            <div>
              {!selectedAssigneeId ? <ErrorState title="Choose an assignee" description="Select a support agent to load their ticket queue." /> : null}
              {selectedAssigneeId ? (isPending ? <TableLoader /> : isError ? <ErrorState title="Unable to load assignee tickets" description="Retry after confirming the assignee ticket endpoint is available." onAction={() => void assigneeTicketsQuery.refetch()} /> : <TicketsTable rows={rows} onOpen={openTicket} onReassign={(row) => { setSelectedTicket(row); setAssigneeValue(row.assignee?.id || ""); reassignDisclosure.onOpen(); }} onUnassign={(row) => { setSelectedTicket(row); unassignDisclosure.onOpen(); }} onReply={(row) => { setSelectedTicket(row); replyDisclosure.onOpen(); }} onResolve={(row) => { setSelectedTicket(row); resolveDisclosure.onOpen(); }} onEscalate={(row) => { setSelectedTicket(row); escalateDisclosure.onOpen(); }} />) : null}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <DataToolbar>
            <div className="flex items-center gap-3">
              <div className="icon-block-primary rounded-2xl p-2 text-slate-100"><Icon className="h-4 w-4" /></div>
              <div><p className="text-sm font-medium text-slate-100">{sectionMeta.title}</p><p className="font-mono text-xs text-slate-500">{sectionMeta.description}</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" onClick={statusDisclosure.onOpen} disabled={!selectedTicket}>Status</Button>
              <Button variant="ghost" onClick={priorityDisclosure.onOpen} disabled={!selectedTicket}>Priority</Button>
              <Button variant="ghost" onClick={categoryDisclosure.onOpen} disabled={!selectedTicket}>Category</Button>
              <Button variant="ghost" onClick={reviewedDisclosure.onOpen} disabled={!selectedTicket}>Review</Button>
              <Button variant="ghost" onClick={noteDisclosure.onOpen} disabled={!selectedTicket}>Note</Button>
              <Button variant="ghost" onClick={flagDisclosure.onOpen} disabled={!selectedTicket}>Flag</Button>
              {selectedTicket?.escalated ? <Button variant="ghost" onClick={deEscalateDisclosure.onOpen}>De-escalate</Button> : null}
              {selectedTicket?.status === "resolved" || selectedTicket?.status === "closed" ? <Button variant="ghost" onClick={reopenDisclosure.onOpen}>Reopen</Button> : null}
              {selectedTicket?.status !== "closed" ? <Button variant="ghost" onClick={closeDisclosure.onOpen} disabled={!selectedTicket}>Close</Button> : null}
              {selectedTicket?.flags?.length ? <Button variant="ghost" onClick={() => { setSelectedFlagId(selectedTicket.flags[0]?.id || ""); removeFlagDisclosure.onOpen(); }} disabled={!selectedTicket}>Unflag</Button> : null}
              <RefreshButton loading={ticketsQuery.isFetching || unassignedQuery.isFetching || escalatedQuery.isFetching || staleQuery.isFetching || workloadQuery.isFetching || agentsQuery.isFetching} onClick={() => { void ticketsQuery.refetch(); void unassignedQuery.refetch(); void escalatedQuery.refetch(); void staleQuery.refetch(); void workloadQuery.refetch(); void agentsQuery.refetch(); if (selectedAssigneeId) void assigneeTicketsQuery.refetch(); }} />
            </div>
          </DataToolbar>
          <div className="mt-4">
            {isPending ? <TableLoader /> : isError ? <ErrorState title={`Unable to load ${sectionMeta.title.toLowerCase()}`} description="Retry after confirming the support endpoints are reachable." onAction={() => void ticketsQuery.refetch()} /> : <TicketsTable rows={rows} onOpen={openTicket} onAssign={(row) => { setSelectedTicket(row); assignDisclosure.onOpen(); }} onReassign={(row) => { setSelectedTicket(row); setAssigneeValue(row.assignee?.id || ""); reassignDisclosure.onOpen(); }} onUnassign={(row) => { setSelectedTicket(row); unassignDisclosure.onOpen(); }} onReply={(row) => { setSelectedTicket(row); replyDisclosure.onOpen(); }} onResolve={(row) => { setSelectedTicket(row); resolveDisclosure.onOpen(); }} onEscalate={(row) => { setSelectedTicket(row); escalateDisclosure.onOpen(); }} />}
          </div>
        </Card>
      )}

      <TicketDetailsModal open={detailDisclosure.open} ticketId={selectedTicket?.id || ""} onClose={detailDisclosure.onClose} />

      <SupportActionDialog open={assignDisclosure.open} title="Assign ticket" description="Assign the selected ticket to a support agent." confirmLabel="Assign ticket" loading={assignMutation.isPending} select={{ label: "Assignee", value: assigneeValue, options: [{ label: "Choose an assignee", value: "" }, ...(agentsQuery.data || []).map((agent) => ({ label: `${agent.name} · ${agent.supportTeam}`, value: agent.id }))], onValueChange: setAssigneeValue }} onClose={assignDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && assigneeValue && assignMutation.mutate([selectedTicket.id, assigneeValue, reason] as never, { onSuccess: () => assignDisclosure.onClose() })} />
      <SupportActionDialog open={reassignDisclosure.open} title="Reassign ticket" description="Move ticket ownership to another support agent." confirmLabel="Reassign ticket" loading={reassignMutation.isPending} select={{ label: "Assignee", value: assigneeValue, options: [{ label: "Choose an assignee", value: "" }, ...(agentsQuery.data || []).map((agent) => ({ label: `${agent.name} · ${agent.supportTeam}`, value: agent.id }))], onValueChange: setAssigneeValue }} onClose={reassignDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && assigneeValue && reassignMutation.mutate([selectedTicket.id, assigneeValue, reason] as never, { onSuccess: () => reassignDisclosure.onClose() })} />
      <SupportActionDialog open={unassignDisclosure.open} title="Unassign ticket" description="Remove current ownership and return the ticket to the unassigned queue." confirmLabel="Unassign ticket" loading={unassignMutation.isPending} onClose={unassignDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && unassignMutation.mutate([selectedTicket.id, reason] as never, { onSuccess: () => unassignDisclosure.onClose() })} />
      <SupportActionDialog open={statusDisclosure.open} title="Change status" description="Update the support ticket lifecycle state." confirmLabel="Update status" loading={statusMutation.isPending} select={{ label: "Status", value: statusValue, options: [{ label: "Open", value: "open" }, { label: "In progress", value: "in_progress" }, { label: "Resolved", value: "resolved" }, { label: "Closed", value: "closed" }], onValueChange: setStatusValue }} onClose={statusDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && statusMutation.mutate([selectedTicket.id, statusValue, reason] as never, { onSuccess: () => statusDisclosure.onClose() })} />
      <SupportActionDialog open={priorityDisclosure.open} title="Change priority" description="Update ticket urgency and workload visibility." confirmLabel="Update priority" loading={priorityMutation.isPending} select={{ label: "Priority", value: priorityValue, options: [{ label: "Low", value: "low" }, { label: "Medium", value: "medium" }, { label: "High", value: "high" }, { label: "Urgent", value: "urgent" }], onValueChange: setPriorityValue }} onClose={priorityDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && priorityMutation.mutate([selectedTicket.id, priorityValue, reason] as never, { onSuccess: () => priorityDisclosure.onClose() })} />
      <SupportActionDialog open={categoryDisclosure.open} title="Change category" description="Update the ticket domain category and operational routing context." confirmLabel="Update category" loading={categoryMutation.isPending} select={{ label: "Category", value: categoryValue, options: [{ label: "Technical", value: "technical" }, { label: "Billing", value: "billing" }, { label: "General", value: "general" }, { label: "Feature request", value: "feature_request" }, { label: "Bug report", value: "bug_report" }], onValueChange: setCategoryValue }} onClose={categoryDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && categoryMutation.mutate([selectedTicket.id, categoryValue, reason] as never, { onSuccess: () => categoryDisclosure.onClose() })} />
      <SupportActionDialog open={escalateDisclosure.open} title="Escalate ticket" description="Raise support visibility and mark the ticket as escalated." confirmLabel="Escalate ticket" loading={escalateMutation.isPending} onClose={escalateDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && escalateMutation.mutate([selectedTicket.id, reason] as never, { onSuccess: () => escalateDisclosure.onClose() })} />
      <SupportActionDialog open={deEscalateDisclosure.open} title="De-escalate ticket" description="Clear the escalation state for the selected ticket." confirmLabel="De-escalate ticket" loading={deEscalateMutation.isPending} onClose={deEscalateDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && deEscalateMutation.mutate([selectedTicket.id, reason] as never, { onSuccess: () => deEscalateDisclosure.onClose() })} />
      <SupportActionDialog open={resolveDisclosure.open} title="Resolve ticket" description="Mark the ticket as resolved and notify the customer workflow." confirmLabel="Resolve ticket" loading={resolveMutation.isPending} onClose={resolveDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && resolveMutation.mutate([selectedTicket.id, reason] as never, { onSuccess: () => resolveDisclosure.onClose() })} />
      <SupportActionDialog open={closeDisclosure.open} title="Close ticket" description="Close the selected support ticket." confirmLabel="Close ticket" loading={closeMutation.isPending} onClose={closeDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && closeMutation.mutate([selectedTicket.id, reason] as never, { onSuccess: () => closeDisclosure.onClose() })} />
      <SupportActionDialog open={reopenDisclosure.open} title="Reopen ticket" description="Reopen the selected ticket and return it to active handling." confirmLabel="Reopen ticket" loading={reopenMutation.isPending} onClose={reopenDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && reopenMutation.mutate([selectedTicket.id, reason] as never, { onSuccess: () => reopenDisclosure.onClose() })} />
      <SupportActionDialog open={replyDisclosure.open} title="Reply to ticket" description="Send an admin reply into the customer-visible support conversation." confirmLabel="Send reply" loading={replyMutation.isPending} textarea reasonOnly={false} onClose={replyDisclosure.onClose} onConfirm={({ reason, body }) => selectedTicket && replyMutation.mutate([selectedTicket.id, { message: body || "", reason }] as never, { onSuccess: () => replyDisclosure.onClose() })} />
      <SupportActionDialog open={reviewedDisclosure.open} title="Mark reviewed" description="Record that the current ticket has been reviewed by support staff." confirmLabel="Mark reviewed" loading={reviewedMutation.isPending} onClose={reviewedDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && reviewedMutation.mutate([selectedTicket.id, reason] as never, { onSuccess: () => reviewedDisclosure.onClose() })} />
      <SupportActionDialog open={noteDisclosure.open} title="Add internal note" description="Add admin-only support context for follow-up and coordination." confirmLabel="Add note" loading={noteMutation.isPending} textarea reasonOnly={false} onClose={noteDisclosure.onClose} onConfirm={({ reason, body }) => selectedTicket && noteMutation.mutate([selectedTicket.id, { body: body || "", category: "support", reason }] as never, { onSuccess: () => noteDisclosure.onClose() })} />
      <SupportActionDialog open={flagDisclosure.open} title="Add ticket flag" description="Add a workflow flag such as VIP, billing-related, outage-related, or manual review." confirmLabel="Add flag" loading={flagMutation.isPending} select={{ label: "Flag", value: categoryValue, options: [{ label: "VIP customer", value: "vip_customer" }, { label: "Outage related", value: "outage_related" }, { label: "Billing related", value: "billing_related" }, { label: "Security related", value: "security_related" }, { label: "Provisioning issue", value: "provisioning_issue" }, { label: "Repeated issue", value: "repeated_issue" }, { label: "Manual review", value: "manual_review" }, { label: "Urgent follow up", value: "urgent_follow_up" }], onValueChange: setCategoryValue }} onClose={flagDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && flagMutation.mutate([selectedTicket.id, { flag: categoryValue, severity: "medium", reason }] as never, { onSuccess: () => flagDisclosure.onClose() })} />
      <SupportActionDialog open={removeFlagDisclosure.open} title="Remove ticket flag" description="Remove the currently selected internal support flag." confirmLabel="Remove flag" loading={removeFlagMutation.isPending} onClose={removeFlagDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && selectedFlagId && removeFlagMutation.mutate([selectedTicket.id, selectedFlagId, reason] as never, { onSuccess: () => removeFlagDisclosure.onClose() })} />
    </section>
  );
}
