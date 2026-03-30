import { useEffect, useMemo, useState } from "react";
import { Clock3, LifeBuoy, Link2, MessageSquare, Plus, ShieldAlert, UserCog } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableLoader } from "@/components/feedback/TableLoader";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataToolbar } from "@/components/shared/DataToolbar";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { appRoutes } from "@/config/routes";
import { supportTabs } from "@/config/module-tabs";
import { cannedResponses } from "@/features/support/config/cannedResponses";
import { CreateTicketDialog, SupportActionDialog, SupportFilters, TicketsTable } from "@/features/support/components";
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
  useEscalatedQueue,
  useEscalateTicket,
  useMarkTicketReviewed,
  useReassignTicket,
  useRemoveTicketFlag,
  useReopenTicket,
  useReplyToTicket,
  useResolveTicket,
  useStaleQueue,
  useSupportAgents,
  useTickets,
  useTicketsByAssignee,
  useUnassignedQueue,
  useUnassignTicket,
} from "@/features/support/hooks/useSupport";
import type { SupportFilterState, SupportSection, SupportTicketRow } from "@/features/support/types/support.types";
import { supportSections } from "@/features/support/utils/support-sections";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";

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

const flagOptions = [
  { label: "VIP customer", value: "vip_customer" },
  { label: "Outage related", value: "outage_related" },
  { label: "Billing related", value: "billing_related" },
  { label: "Security related", value: "security_related" },
  { label: "Provisioning issue", value: "provisioning_issue" },
  { label: "Repeated issue", value: "repeated_issue" },
  { label: "Manual review", value: "manual_review" },
  { label: "Urgent follow up", value: "urgent_follow_up" },
] as const;

export function SupportSectionPage({ section }: { section: SupportSection }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser(true);
  const sectionMeta = supportSections[section];
  const Icon = sectionIcons[section];
  const [filters, setFilters] = useState<SupportFilterState>({ limit: 50, sortBy: "updatedAt", sortOrder: "desc" });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRow | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [selectedFlagId, setSelectedFlagId] = useState("");
  const [priorityValue, setPriorityValue] = useState("high");
  const [statusValue, setStatusValue] = useState("in_progress");
  const [categoryValue, setCategoryValue] = useState("technical");
  const [flagValue, setFlagValue] = useState("manual_review");
  const [assigneeValue, setAssigneeValue] = useState("");
  const [teamValue, setTeamValue] = useState("general");

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
  const addDisclosure = useDisclosure(false);

  const ticketsEnabled = !["unassigned", "escalated", "stale", "by-assignee"].includes(section);
  const unassignedEnabled = section === "unassigned";
  const escalatedEnabled = section === "escalated";
  const staleEnabled = section === "stale";
  const byAssigneeEnabled = section === "by-assignee";

  const ticketsQuery = useTickets(filters, ticketsEnabled);
  const unassignedQuery = useUnassignedQueue(filters, unassignedEnabled);
  const escalatedQuery = useEscalatedQueue(filters, escalatedEnabled);
  const staleQuery = useStaleQueue(filters, staleEnabled);
  const workloadQuery = useAssigneeWorkload(byAssigneeEnabled);
  const agentsQuery = useSupportAgents();
  const assigneeTicketsQuery = useTicketsByAssignee(selectedAssigneeId, filters, byAssigneeEnabled && Boolean(selectedAssigneeId));
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

  const showManageActions = can(currentUser, permissions.supportManage);
  const showReplyActions = can(currentUser, permissions.supportReply);

  useEffect(() => {
    setFilters({ limit: 50, sortBy: "updatedAt", sortOrder: "desc" });
  }, [section]);

  const rows = useMemo(() => {
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

  const isPending =
    (ticketsEnabled && ticketsQuery.isPending)
    || (unassignedEnabled && unassignedQuery.isPending)
    || (escalatedEnabled && escalatedQuery.isPending)
    || (staleEnabled && staleQuery.isPending)
    || (byAssigneeEnabled && selectedAssigneeId !== "" && assigneeTicketsQuery.isPending);

  const isError =
    (ticketsEnabled && ticketsQuery.isError)
    || (unassignedEnabled && unassignedQuery.isError)
    || (escalatedEnabled && escalatedQuery.isError)
    || (staleEnabled && staleQuery.isError)
    || (byAssigneeEnabled && selectedAssigneeId !== "" && assigneeTicketsQuery.isError);

  const filteredCannedResponses = cannedResponses.filter((item) => item.category === selectedTicket?.category || item.category === "general");

  const openTicket = (ticket: SupportTicketRow) => {
    setSelectedTicket(ticket);
    setAssigneeValue(ticket.assignee?.id || "");
    setPriorityValue(ticket.priority);
    setStatusValue(ticket.status);
    setCategoryValue(ticket.category);
    setFlagValue(ticket.flags[0]?.flag || "manual_review");
    setTeamValue(ticket.assignedTeam || "general");
    setSelectedFlagId(ticket.flags[0]?.id || "");
    navigate(appRoutes.supportTicket(ticket.id));
  };

  const refreshCurrentSection = () => {
    if (ticketsEnabled) void ticketsQuery.refetch();
    if (unassignedEnabled) void unassignedQuery.refetch();
    if (escalatedEnabled) void escalatedQuery.refetch();
    if (staleEnabled) void staleQuery.refetch();
    if (byAssigneeEnabled) void workloadQuery.refetch();
    void agentsQuery.refetch();
    if (byAssigneeEnabled && selectedAssigneeId) void assigneeTicketsQuery.refetch();
  };

  return (
    <section className="space-y-6">
      <PageHeader title={sectionMeta.title} description={sectionMeta.description} meta="Support operations" />
      <Tabs tabs={[...supportTabs]} value={location.pathname} onChange={navigate} />
      {section !== "by-assignee" ? <SupportFilters filters={filters} onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))} /> : null}

      {section === "by-assignee" ? (
        <Card>
          <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
            <div className="space-y-3">
              {(workloadQuery.data || []).map((item) => (
                <button
                  key={item.assignee?.id || "unassigned"}
                  type="button"
                  onClick={() => setSelectedAssigneeId(item.assignee?.id || "")}
                  className={`w-full rounded-2xl border p-4 text-left transition ${selectedAssigneeId === (item.assignee?.id || "") ? "border-primary/40 bg-primary/10" : "border-background-border bg-background-panel hover:border-primary/40 hover:bg-primary/10"}`}
                >
                  <p className="font-medium text-text-primary">{item.assignee?.name || "Unassigned"}</p>
                  <p className="mt-1 text-sm text-text-secondary">{item.openTickets} open · {item.escalatedTickets} escalated · {item.staleTickets} stale</p>
                </button>
              ))}
            </div>
            <div>
              {!selectedAssigneeId ? <ErrorState title="Choose an assignee" description="Select a support agent to load their ticket queue." /> : null}
              {selectedAssigneeId ? (
                isPending ? <TableLoader /> : isError ? (
                  <ErrorState title="Unable to load assignee tickets" description="Retry after confirming the assignee ticket endpoint is available." onAction={() => void assigneeTicketsQuery.refetch()} />
                ) : (
                  <TicketsTable
                    rows={rows}
                    onOpen={openTicket}
                    onReassign={showManageActions ? (row) => { setSelectedTicket(row); setAssigneeValue(row.assignee?.id || ""); reassignDisclosure.onOpen(); } : undefined}
                    onUnassign={showManageActions ? (row) => { setSelectedTicket(row); unassignDisclosure.onOpen(); } : undefined}
                    onReply={showReplyActions ? (row) => { setSelectedTicket(row); replyDisclosure.onOpen(); } : undefined}
                    onResolve={showManageActions ? (row) => { setSelectedTicket(row); resolveDisclosure.onOpen(); } : undefined}
                    onEscalate={showManageActions ? (row) => { setSelectedTicket(row); escalateDisclosure.onOpen(); } : undefined}
                  />
                )
              ) : null}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <DataToolbar>
            <div className="flex items-center gap-3">
              <div className="icon-block-primary rounded-2xl p-2 text-text-primary"><Icon className="h-4 w-4" /></div>
              <div>
                <p className="text-sm font-medium text-text-primary">{sectionMeta.title}</p>
                <p className="font-mono text-xs text-text-muted">{sectionMeta.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {section === "tickets" && showManageActions ? (
                <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={addDisclosure.onOpen}>
                  New Ticket
                </Button>
              ) : null}
              {selectedTicket ? (
                <div className="flex flex-wrap items-center gap-2">
                  {showReplyActions ? <Button variant="ghost" size="sm" onClick={replyDisclosure.onOpen}>Reply</Button> : null}
                  {showManageActions ? <Button variant="ghost" size="sm" onClick={statusDisclosure.onOpen}>Status</Button> : null}
                  {showManageActions ? <Button variant="ghost" size="sm" onClick={priorityDisclosure.onOpen}>Priority</Button> : null}
                  {showManageActions ? <Button variant="ghost" size="sm" onClick={categoryDisclosure.onOpen}>Category</Button> : null}
                  {showManageActions ? <Button variant="ghost" size="sm" onClick={reviewedDisclosure.onOpen}>Review</Button> : null}
                  {showReplyActions ? <Button variant="ghost" size="sm" onClick={noteDisclosure.onOpen}>Note</Button> : null}
                  {showManageActions ? <Button variant="ghost" size="sm" onClick={flagDisclosure.onOpen}>Flag</Button> : null}
                  {selectedTicket.escalated && showManageActions ? <Button variant="ghost" size="sm" onClick={deEscalateDisclosure.onOpen}>De-escalate</Button> : null}
                  {(selectedTicket.status === "resolved" || selectedTicket.status === "closed") && showManageActions ? <Button variant="ghost" size="sm" onClick={reopenDisclosure.onOpen}>Reopen</Button> : null}
                  {selectedTicket.status !== "closed" && showManageActions ? <Button variant="ghost" size="sm" onClick={closeDisclosure.onOpen}>Close</Button> : null}
                  {selectedTicket.flags.length && showManageActions ? <Button variant="ghost" size="sm" onClick={() => { setSelectedFlagId(selectedTicket.flags[0]?.id || ""); removeFlagDisclosure.onOpen(); }}>Unflag</Button> : null}
                </div>
              ) : (
                <p className="text-xs text-text-muted">Select a ticket to take action</p>
              )}
              <RefreshButton loading={ticketsQuery.isFetching || unassignedQuery.isFetching || escalatedQuery.isFetching || staleQuery.isFetching || workloadQuery.isFetching || agentsQuery.isFetching} onClick={refreshCurrentSection} />
            </div>
          </DataToolbar>
          <div className="mt-4">
            {isPending ? (
              <TableLoader />
            ) : isError ? (
              <ErrorState title={`Unable to load ${sectionMeta.title.toLowerCase()}`} description="Retry after confirming the support endpoints are reachable." onAction={refreshCurrentSection} />
            ) : (
              <TicketsTable
                rows={rows}
                onOpen={openTicket}
                onAssign={showManageActions ? (row) => { setSelectedTicket(row); assignDisclosure.onOpen(); } : undefined}
                onReassign={showManageActions ? (row) => { setSelectedTicket(row); setAssigneeValue(row.assignee?.id || ""); reassignDisclosure.onOpen(); } : undefined}
                onUnassign={showManageActions ? (row) => { setSelectedTicket(row); unassignDisclosure.onOpen(); } : undefined}
                onReply={showReplyActions ? (row) => { setSelectedTicket(row); replyDisclosure.onOpen(); } : undefined}
                onResolve={showManageActions ? (row) => { setSelectedTicket(row); resolveDisclosure.onOpen(); } : undefined}
                onEscalate={showManageActions ? (row) => { setSelectedTicket(row); escalateDisclosure.onOpen(); } : undefined}
              />
            )}
          </div>
        </Card>
      )}

      <CreateTicketDialog open={addDisclosure.open} onClose={addDisclosure.onClose} />

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
      <SupportActionDialog open={replyDisclosure.open} title="Reply to ticket" description="Send an admin reply into the customer-visible support conversation." confirmLabel="Send reply" loading={replyMutation.isPending} textarea reasonOnly={false} cannedResponses={filteredCannedResponses} onClose={replyDisclosure.onClose} onConfirm={({ reason, body }) => selectedTicket && replyMutation.mutate([selectedTicket.id, { message: body || "", reason }] as never, { onSuccess: () => replyDisclosure.onClose() })} />
      <SupportActionDialog open={reviewedDisclosure.open} title="Mark reviewed" description="Record that the current ticket has been reviewed by support staff." confirmLabel="Mark reviewed" loading={reviewedMutation.isPending} onClose={reviewedDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && reviewedMutation.mutate([selectedTicket.id, reason] as never, { onSuccess: () => reviewedDisclosure.onClose() })} />
      <SupportActionDialog open={noteDisclosure.open} title="Add internal note" description="Add admin-only support context for follow-up and coordination." confirmLabel="Add note" loading={noteMutation.isPending} textarea reasonOnly={false} onClose={noteDisclosure.onClose} onConfirm={({ reason, body }) => selectedTicket && noteMutation.mutate([selectedTicket.id, { body: body || "", category: "support", reason }] as never, { onSuccess: () => noteDisclosure.onClose() })} />
      <SupportActionDialog open={flagDisclosure.open} title="Add ticket flag" description="Add a workflow flag such as VIP, billing-related, outage-related, or manual review." confirmLabel="Add flag" loading={flagMutation.isPending} select={{ label: "Flag", value: flagValue, options: [...flagOptions], onValueChange: setFlagValue }} onClose={flagDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && flagMutation.mutate([selectedTicket.id, { flag: flagValue, severity: "medium", reason }] as never, { onSuccess: () => flagDisclosure.onClose() })} />
      <SupportActionDialog open={removeFlagDisclosure.open} title="Remove ticket flag" description="Remove the currently selected internal support flag." confirmLabel="Remove flag" loading={removeFlagMutation.isPending} onClose={removeFlagDisclosure.onClose} onConfirm={({ reason }) => selectedTicket && selectedFlagId && removeFlagMutation.mutate([selectedTicket.id, selectedFlagId, reason] as never, { onSuccess: () => removeFlagDisclosure.onClose() })} />
    </section>
  );
}
