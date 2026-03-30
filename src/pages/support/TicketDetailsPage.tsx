import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LifeBuoy, MessageSquare } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { ActivityTimeline } from "@/components/data-display/ActivityTimeline";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { appRoutes } from "@/config/routes";
import { cannedResponses } from "@/features/support/config/cannedResponses";
import { SLABadge, TicketCategoryBadge, TicketEscalationBadge, TicketPriorityBadge, TicketStatusBadge } from "@/features/support/components";
import { SupportActionDialog } from "@/features/support/components/SupportActionDialog";
import {
  useAddTicketFlag,
  useAddTicketNote,
  useAssignTicket,
  useAssignTicketTeam,
  useChangeTicketCategory,
  useChangeTicketPriority,
  useChangeTicketStatus,
  useCloseTicket,
  useDeEscalateTicket,
  useEscalateTicket,
  useMarkTicketReviewed,
  useReassignTicket,
  useRemoveTicketFlag,
  useReopenTicket,
  useReplyToTicket,
  useResolveTicket,
  useSupportAgents,
  useTicket,
  useTicketActivity,
  useTicketFlags,
  useTicketMessages,
  useTicketNotes,
  useUnassignTicket,
} from "@/features/support/hooks/useSupport";
import type { SupportTeam } from "@/features/support/types/support.types";
import { supportTabs } from "@/config/module-tabs";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { formatDateTime } from "@/lib/formatters/date";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";

dayjs.extend(relativeTime);

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

function formatAwaiting(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function TicketDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser(true);
  const [replyBody, setReplyBody] = useState("");
  const [assigneeValue, setAssigneeValue] = useState("");
  const [priorityValue, setPriorityValue] = useState("high");
  const [statusValue, setStatusValue] = useState("in_progress");
  const [categoryValue, setCategoryValue] = useState("technical");
  const [teamValue, setTeamValue] = useState<SupportTeam>("general");
  const [flagValue, setFlagValue] = useState("manual_review");
  const [selectedFlagId, setSelectedFlagId] = useState("");

  const assignDisclosure = useDisclosure(false);
  const reassignDisclosure = useDisclosure(false);
  const teamDisclosure = useDisclosure(false);
  const unassignDisclosure = useDisclosure(false);
  const escalateDisclosure = useDisclosure(false);
  const deEscalateDisclosure = useDisclosure(false);
  const resolveDisclosure = useDisclosure(false);
  const closeDisclosure = useDisclosure(false);
  const reopenDisclosure = useDisclosure(false);
  const reviewedDisclosure = useDisclosure(false);
  const noteDisclosure = useDisclosure(false);
  const flagDisclosure = useDisclosure(false);
  const removeFlagDisclosure = useDisclosure(false);
  const statusDisclosure = useDisclosure(false);
  const priorityDisclosure = useDisclosure(false);
  const categoryDisclosure = useDisclosure(false);

  const ticketQuery = useTicket(id);
  const messagesQuery = useTicketMessages(id, { limit: 100 });
  const notesQuery = useTicketNotes(id);
  const flagsQuery = useTicketFlags(id);
  const activityQuery = useTicketActivity(id, { limit: 50 });
  const agentsQuery = useSupportAgents();

  const assignMutation = useAssignTicket();
  const reassignMutation = useReassignTicket();
  const teamMutation = useAssignTicketTeam();
  const unassignMutation = useUnassignTicket();
  const escalateMutation = useEscalateTicket();
  const deEscalateMutation = useDeEscalateTicket();
  const resolveMutation = useResolveTicket();
  const closeMutation = useCloseTicket();
  const reopenMutation = useReopenTicket();
  const reviewedMutation = useMarkTicketReviewed();
  const noteMutation = useAddTicketNote();
  const flagMutation = useAddTicketFlag();
  const removeFlagMutation = useRemoveTicketFlag();
  const statusMutation = useChangeTicketStatus();
  const priorityMutation = useChangeTicketPriority();
  const categoryMutation = useChangeTicketCategory();
  const replyMutation = useReplyToTicket();

  const detail = ticketQuery.data;
  const showManageActions = can(currentUser, permissions.supportManage);
  const showReplyActions = can(currentUser, permissions.supportReply);

  const cannedOptions = useMemo(
    () => cannedResponses.filter((item) => item.category === detail?.ticket.category || item.category === "general"),
    [detail?.ticket.category],
  );

  useEffect(() => {
    if (!detail) return;
    setAssigneeValue(detail.ticket.assignee?.id || "");
    setPriorityValue(detail.ticket.priority);
    setStatusValue(detail.ticket.status);
    setCategoryValue(detail.ticket.category);
    setTeamValue((detail.ticket.assignedTeam as SupportTeam) || "general");
  }, [detail]);

  useEffect(() => {
    const firstFlag = flagsQuery.data?.[0];
    setFlagValue(firstFlag?.flag || "manual_review");
    setSelectedFlagId(firstFlag?.id || "");
  }, [flagsQuery.data]);

  const timelineItems = useMemo(
    () => (activityQuery.data?.items || []).map((item) => ({
      title: item.eventType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      time: dayjs(item.timestamp).fromNow(),
      description: `${item.summary}${item.actor?.email ? ` · ${item.actor.email}` : ""}`,
    })),
    [activityQuery.data?.items],
  );

  const refreshAll = () => {
    void ticketQuery.refetch();
    void messagesQuery.refetch();
    void notesQuery.refetch();
    void flagsQuery.refetch();
    void activityQuery.refetch();
  };

  if (ticketQuery.isPending) return <SectionLoader />;
  if (ticketQuery.isError || !detail) return <ErrorState title="Unable to load ticket details" description="Retry after confirming the support ticket endpoint is available." onAction={() => void ticketQuery.refetch()} />;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={detail.context.customer?.name || detail.ticket.customer?.name || detail.ticket.subject} description="User-classified support workspace for subscriber context, ticket handling, and operational follow-up." meta={detail.context.customer?.email || detail.ticket.ticketReference} />
        <RefreshButton loading={ticketQuery.isFetching || messagesQuery.isFetching || notesQuery.isFetching || flagsQuery.isFetching || activityQuery.isFetching} onClick={refreshAll} />
      </div>
      <Tabs tabs={[...supportTabs]} value={appRoutes.supportTickets} onChange={navigate} />

      <Card className="space-y-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-text-primary">{detail.context.customer?.name || detail.ticket.customer?.name || "Unknown subscriber"}</h2>
              <TicketStatusBadge status={detail.ticket.status} />
              <TicketPriorityBadge priority={detail.ticket.priority} />
              <TicketCategoryBadge category={detail.ticket.category} />
              <TicketEscalationBadge escalated={detail.ticket.escalated} />
              <SLABadge breached={detail.ticket.sla.breached} remaining={detail.ticket.sla.resolutionRemainingHours} />
            </div>
            <p className="text-sm text-text-secondary">{detail.ticket.customer?.email || "No customer email"} • {detail.ticket.ticketReference}</p>
            <p className="text-sm text-text-secondary">Focused ticket: {detail.ticket.subject}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Support tools</p>
            <div className="flex flex-wrap gap-2">
              {showReplyActions ? <Button variant="outline" onClick={() => document.getElementById("ticket-inline-reply")?.scrollIntoView({ behavior: "smooth", block: "center" })}>Reply</Button> : null}
              {showManageActions && !detail.ticket.assignee ? <Button variant="outline" onClick={assignDisclosure.onOpen}>Assign</Button> : null}
              {showManageActions && detail.ticket.assignee ? <Button variant="outline" onClick={reassignDisclosure.onOpen}>Reassign</Button> : null}
              {showManageActions ? <Button variant="outline" onClick={teamDisclosure.onOpen}>Assign team</Button> : null}
              {showManageActions && detail.ticket.assignee ? <Button variant="ghost" onClick={unassignDisclosure.onOpen}>Unassign</Button> : null}
              {showManageActions && !detail.ticket.escalated ? <Button variant="outline" onClick={escalateDisclosure.onOpen}>Escalate</Button> : null}
              {showManageActions && detail.ticket.escalated ? <Button variant="outline" onClick={deEscalateDisclosure.onOpen}>De-escalate</Button> : null}
              {showManageActions && detail.ticket.status !== "resolved" && detail.ticket.status !== "closed" ? <Button variant="outline" onClick={resolveDisclosure.onOpen}>Resolve</Button> : null}
              {showManageActions && detail.ticket.status !== "closed" ? <Button variant="ghost" onClick={closeDisclosure.onOpen}>Close</Button> : null}
              {showManageActions && (detail.ticket.status === "resolved" || detail.ticket.status === "closed") ? <Button variant="outline" onClick={reopenDisclosure.onOpen}>Reopen</Button> : null}
              {showReplyActions ? <Button variant="ghost" onClick={noteDisclosure.onOpen}>Add Note</Button> : null}
              {showManageActions ? <Button variant="ghost" onClick={flagDisclosure.onOpen}>Add Flag</Button> : null}
              {showManageActions ? <Button variant="ghost" onClick={reviewedDisclosure.onOpen}>Mark Reviewed</Button> : null}
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Assignee: {detail.ticket.assignee?.name || "Unassigned"}</div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Team: {detail.ticket.assignedTeam}</div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Awaiting: {formatAwaiting(detail.ticket.awaitingState)}</div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Age: {detail.ticket.age.ageHours}h old · {detail.ticket.age.idleHours}h idle</div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className={`rounded-2xl border p-3 text-sm ${detail.ticket.sla.responseBreached ? "border-danger/30 bg-danger/10 text-danger" : "border-background-border bg-background-panel text-text-primary"}`}>
            Response due: {formatDateTime(detail.ticket.sla.firstResponseDueAt)}
          </div>
          <div className={`rounded-2xl border p-3 text-sm ${detail.ticket.sla.resolutionBreached ? "border-danger/30 bg-danger/10 text-danger" : "border-background-border bg-background-panel text-text-primary"}`}>
            Resolution due: {formatDateTime(detail.ticket.sla.resolutionDueAt)}
          </div>
          <div className={`rounded-2xl border p-3 text-sm ${detail.ticket.sla.breached ? "border-danger/30 bg-danger/10 text-danger" : "border-background-border bg-background-panel text-text-primary"}`}>
            SLA status: {detail.ticket.sla.breached ? "Breached" : "Within target"}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-4">
        <div className="rounded-3xl border border-background-border bg-background-surface p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Open tickets</p>
          <p className="mt-3 text-3xl font-semibold text-text-primary">{detail.context.customer?.openTickets ?? 1}</p>
          <p className="mt-2 text-sm text-text-secondary">Current customer support load.</p>
        </div>
        <div className="rounded-3xl border border-background-border bg-background-surface p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Routers</p>
          <p className="mt-3 text-3xl font-semibold text-text-primary">{detail.context.customer?.routerCount ?? (detail.context.router ? 1 : 0)}</p>
          <p className="mt-2 text-sm text-text-secondary">Infrastructure tied to this subscriber.</p>
        </div>
        <div className="rounded-3xl border border-background-border bg-background-surface p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Support tier</p>
          <p className="mt-3 text-3xl font-semibold text-text-primary">{detail.context.customer?.supportTier || "standard"}</p>
          <p className="mt-2 text-sm text-text-secondary">Customer support classification.</p>
        </div>
        <div className="rounded-3xl border border-background-border bg-background-surface p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Account state</p>
          <p className="mt-3 text-3xl font-semibold text-text-primary">{detail.context.customer?.accountStatus || "unknown"}</p>
          <p className="mt-2 text-sm text-text-secondary">Subscriber operational state.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Customer & Context</CardTitle>
            <CardDescription>Subscriber-first context and linked operational resources.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">
            Customer: {detail.context.customer?.name || "Unknown"} · {detail.context.customer?.email || "No email"}
            {detail.context.customer?.vip ? <span className="ml-2 text-primary">VIP</span> : null}
          </div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Support tier: {detail.context.customer?.supportTier || "standard"}</div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">
            Router: {detail.context.router ? <Link className="text-primary hover:underline" to={appRoutes.routerDetail(detail.context.router.id)}>{detail.context.router.name}</Link> : "None linked"}
          </div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">
            VPN server: {detail.context.vpnServer ? <Link className="text-primary hover:underline" to={appRoutes.vpnServerDetail(detail.context.vpnServer.id)}>{detail.context.vpnServer.name}</Link> : "None linked"}
          </div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">
            Incident: {detail.context.incident ? <Link className="text-primary hover:underline" to={appRoutes.monitoringIncidentsAlerts}>{detail.context.incident.title}</Link> : "None linked"}
          </div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">
            Subscription: {detail.context.subscription ? `${detail.context.subscription.status} · next billing ${formatDateTime(detail.context.subscription.nextBillingDate)}` : "No subscription context"}
          </div>
          <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">
            Transaction: {detail.context.transaction ? `${detail.context.transaction.transactionId} · ${detail.context.transaction.amount} · ${detail.context.transaction.status}` : "No transaction context"}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Conversation Thread</CardTitle>
            <CardDescription>Customer, admin, and system-visible messages for this ticket.</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {messagesQuery.isPending ? <SectionLoader /> : (messagesQuery.data?.items || []).length ? messagesQuery.data?.items.map((message) => (
            <div key={message.id} className={`rounded-2xl border p-4 ${message.direction === "admin" ? "border-primary/40 bg-primary/10" : "border-background-border bg-background-panel"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-text-primary">
                  {message.author?.email || message.source} · {message.direction === "admin" ? "Admin" : message.direction === "customer" ? "Customer" : "System"}
                </p>
                <p className="text-xs text-text-muted">{formatDateTime(message.createdAt)}</p>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{message.body}</p>
              {message.attachments.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.attachments.map((attachment) => (
                    <a key={attachment.url} href={attachment.url} target="_blank" rel="noreferrer" className="rounded-full border border-background-border px-3 py-1 text-xs text-primary hover:border-primary/40">
                      {attachment.filename}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          )) : <EmptyState icon={MessageSquare} title="No conversation messages" description="No messages have been added to this ticket yet." />}
        </div>
        {showReplyActions ? (
          <div id="ticket-inline-reply" className="mt-5 rounded-2xl border border-background-border bg-background-panel p-4">
            <label className="grid gap-2 text-sm text-text-primary">
              <span className="font-medium text-text-secondary">Canned Responses</span>
              <div className="relative">
                <select
                  className="h-12 w-full appearance-none rounded-2xl border border-background-border bg-background-panel px-4 text-text-primary outline-none transition focus:border-primary/40"
                  defaultValue=""
                  onChange={(event) => {
                    const selected = cannedOptions.find((item) => item.id === event.target.value);
                    if (selected) setReplyBody(selected.body);
                    event.currentTarget.value = "";
                  }}
                >
                  <option value="">Choose a template</option>
                  {[...new Set(cannedOptions.map((item) => item.category))].map((category) => (
                    <optgroup key={category} label={category.replace(/_/g, " ")}>
                      {cannedOptions.filter((item) => item.category === category).map((item) => (
                        <option key={item.id} value={item.id}>{item.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </label>
            <div className="mt-4">
              <Textarea placeholder="Type a reply to send to the subscriber..." value={replyBody} onChange={(event) => setReplyBody(event.target.value)} />
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                isLoading={replyMutation.isPending}
                disabled={!replyBody.trim()}
                onClick={() => {
                  replyMutation.mutate([id, { message: replyBody.trim() }] as never, {
                    onSuccess: () => {
                      setReplyBody("");
                      void messagesQuery.refetch();
                      void ticketQuery.refetch();
                    },
                  });
                }}
              >
                Send Reply
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Internal Notes</CardTitle>
              <CardDescription>Private notes for support coordination and follow-up.</CardDescription>
            </div>
            {showReplyActions ? <Button variant="ghost" size="sm" onClick={noteDisclosure.onOpen}>Add note</Button> : null}
          </CardHeader>
          <div className="space-y-3">
            {notesQuery.isPending ? <SectionLoader /> : (notesQuery.data || []).length ? notesQuery.data?.map((note) => (
              <div key={note.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-sm text-text-primary">{note.body}</p>
                <p className="mt-2 text-xs text-text-muted">{note.category} · {note.author} · {formatDateTime(note.createdAt)}</p>
              </div>
            )) : <EmptyState icon={MessageSquare} title="No internal notes" description="No support notes have been added yet." />}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Flags</CardTitle>
              <CardDescription>Internal workflow flags and review markers.</CardDescription>
            </div>
            {showManageActions ? <Button variant="ghost" size="sm" onClick={flagDisclosure.onOpen}>Add flag</Button> : null}
          </CardHeader>
          <div className="space-y-3">
            {flagsQuery.isPending ? <SectionLoader /> : (flagsQuery.data || []).length ? flagsQuery.data?.map((flag) => (
              <div key={flag.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-text-primary">{flag.flag}</p>
                    <p className="mt-1 text-xs text-text-muted">{flag.severity} · {flag.createdBy} · {formatDateTime(flag.createdAt)}</p>
                  </div>
                  {showManageActions ? <Button variant="ghost" size="sm" onClick={() => { setSelectedFlagId(flag.id); removeFlagDisclosure.onOpen(); }}>Remove</Button> : null}
                </div>
                {flag.description ? <p className="mt-2 text-sm text-text-secondary">{flag.description}</p> : null}
              </div>
            )) : <EmptyState icon={LifeBuoy} title="No flags" description="This ticket does not currently have internal flags." />}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Ticket workflow history and admin interventions.</CardDescription>
          </div>
        </CardHeader>
        {activityQuery.isPending ? <SectionLoader /> : timelineItems.length ? <ActivityTimeline items={timelineItems} /> : <EmptyState icon={LifeBuoy} title="No activity yet" description="No workflow events have been recorded for this ticket yet." />}
      </Card>

      <SupportActionDialog open={assignDisclosure.open} title="Assign ticket" description="Assign the selected ticket to a support agent." confirmLabel="Assign ticket" loading={assignMutation.isPending} select={{ label: "Assignee", value: assigneeValue, options: [{ label: "Choose an assignee", value: "" }, ...(agentsQuery.data || []).map((agent) => ({ label: `${agent.name} · ${agent.supportTeam}`, value: agent.id }))], onValueChange: setAssigneeValue }} onClose={assignDisclosure.onClose} onConfirm={({ reason }) => assigneeValue && assignMutation.mutate([id, assigneeValue, reason] as never, { onSuccess: () => { assignDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={reassignDisclosure.open} title="Reassign ticket" description="Move ticket ownership to another support agent." confirmLabel="Reassign ticket" loading={reassignMutation.isPending} select={{ label: "Assignee", value: assigneeValue, options: [{ label: "Choose an assignee", value: "" }, ...(agentsQuery.data || []).map((agent) => ({ label: `${agent.name} · ${agent.supportTeam}`, value: agent.id }))], onValueChange: setAssigneeValue }} onClose={reassignDisclosure.onClose} onConfirm={({ reason }) => assigneeValue && reassignMutation.mutate([id, assigneeValue, reason] as never, { onSuccess: () => { reassignDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={teamDisclosure.open} title="Assign support team" description="Route this ticket to the team that should own the next step." confirmLabel="Assign team" loading={teamMutation.isPending} select={{ label: "Team", value: teamValue, options: [{ label: "General", value: "general" }, { label: "Networking", value: "networking" }, { label: "Billing", value: "billing" }, { label: "Security", value: "security" }, { label: "VIP", value: "vip" }, { label: "Operations", value: "operations" }], onValueChange: (value) => setTeamValue(value as SupportTeam) }} onClose={teamDisclosure.onClose} onConfirm={({ reason }) => teamMutation.mutate([id, teamValue, reason] as never, { onSuccess: () => { teamDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={unassignDisclosure.open} title="Unassign ticket" description="Remove the current owner from this ticket." confirmLabel="Unassign ticket" loading={unassignMutation.isPending} onClose={unassignDisclosure.onClose} onConfirm={({ reason }) => unassignMutation.mutate([id, reason] as never, { onSuccess: () => { unassignDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={escalateDisclosure.open} title="Escalate ticket" description="Raise the ticket priority for urgent review." confirmLabel="Escalate ticket" loading={escalateMutation.isPending} onClose={escalateDisclosure.onClose} onConfirm={({ reason }) => escalateMutation.mutate([id, reason] as never, { onSuccess: () => { escalateDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={deEscalateDisclosure.open} title="De-escalate ticket" description="Clear the escalation state for this ticket." confirmLabel="De-escalate ticket" loading={deEscalateMutation.isPending} onClose={deEscalateDisclosure.onClose} onConfirm={({ reason }) => deEscalateMutation.mutate([id, reason] as never, { onSuccess: () => { deEscalateDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={resolveDisclosure.open} title="Resolve ticket" description="Mark this ticket as resolved." confirmLabel="Resolve ticket" loading={resolveMutation.isPending} onClose={resolveDisclosure.onClose} onConfirm={({ reason }) => resolveMutation.mutate([id, reason] as never, { onSuccess: () => { resolveDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={closeDisclosure.open} title="Close ticket" description="Close this ticket." confirmLabel="Close ticket" loading={closeMutation.isPending} onClose={closeDisclosure.onClose} onConfirm={({ reason }) => closeMutation.mutate([id, reason] as never, { onSuccess: () => { closeDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={reopenDisclosure.open} title="Reopen ticket" description="Return this ticket to the active queue." confirmLabel="Reopen ticket" loading={reopenMutation.isPending} onClose={reopenDisclosure.onClose} onConfirm={({ reason }) => reopenMutation.mutate([id, reason] as never, { onSuccess: () => { reopenDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={reviewedDisclosure.open} title="Mark reviewed" description="Record that this ticket has been reviewed." confirmLabel="Mark reviewed" loading={reviewedMutation.isPending} onClose={reviewedDisclosure.onClose} onConfirm={({ reason }) => reviewedMutation.mutate([id, reason] as never, { onSuccess: () => { reviewedDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={noteDisclosure.open} title="Add internal note" description="Add internal support context to this ticket." confirmLabel="Add note" loading={noteMutation.isPending} textarea reasonOnly={false} onClose={noteDisclosure.onClose} onConfirm={({ reason, body }) => noteMutation.mutate([id, { body: body || "", category: "support", reason }] as never, { onSuccess: () => { noteDisclosure.onClose(); void notesQuery.refetch(); } })} />
      <SupportActionDialog open={flagDisclosure.open} title="Add ticket flag" description="Add an internal workflow flag to this ticket." confirmLabel="Add flag" loading={flagMutation.isPending} select={{ label: "Flag", value: flagValue, options: [...flagOptions], onValueChange: setFlagValue }} onClose={flagDisclosure.onClose} onConfirm={({ reason }) => flagMutation.mutate([id, { flag: flagValue, severity: "medium", reason }] as never, { onSuccess: () => { flagDisclosure.onClose(); void flagsQuery.refetch(); } })} />
      <SupportActionDialog open={removeFlagDisclosure.open} title="Remove ticket flag" description="Remove the selected ticket flag." confirmLabel="Remove flag" loading={removeFlagMutation.isPending} onClose={removeFlagDisclosure.onClose} onConfirm={({ reason }) => selectedFlagId && removeFlagMutation.mutate([id, selectedFlagId, reason] as never, { onSuccess: () => { removeFlagDisclosure.onClose(); void flagsQuery.refetch(); } })} />
      <SupportActionDialog open={statusDisclosure.open} title="Change status" description="Update the ticket lifecycle state." confirmLabel="Update status" loading={statusMutation.isPending} select={{ label: "Status", value: statusValue, options: [{ label: "Open", value: "open" }, { label: "In progress", value: "in_progress" }, { label: "Resolved", value: "resolved" }, { label: "Closed", value: "closed" }], onValueChange: setStatusValue }} onClose={statusDisclosure.onClose} onConfirm={({ reason }) => statusMutation.mutate([id, statusValue, reason] as never, { onSuccess: () => { statusDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={priorityDisclosure.open} title="Change priority" description="Update the ticket priority." confirmLabel="Update priority" loading={priorityMutation.isPending} select={{ label: "Priority", value: priorityValue, options: [{ label: "Low", value: "low" }, { label: "Medium", value: "medium" }, { label: "High", value: "high" }, { label: "Urgent", value: "urgent" }], onValueChange: setPriorityValue }} onClose={priorityDisclosure.onClose} onConfirm={({ reason }) => priorityMutation.mutate([id, priorityValue, reason] as never, { onSuccess: () => { priorityDisclosure.onClose(); void ticketQuery.refetch(); } })} />
      <SupportActionDialog open={categoryDisclosure.open} title="Change category" description="Update the ticket category." confirmLabel="Update category" loading={categoryMutation.isPending} select={{ label: "Category", value: categoryValue, options: [{ label: "Technical", value: "technical" }, { label: "Billing", value: "billing" }, { label: "General", value: "general" }, { label: "Feature request", value: "feature_request" }, { label: "Bug report", value: "bug_report" }], onValueChange: setCategoryValue }} onClose={categoryDisclosure.onClose} onConfirm={({ reason }) => categoryMutation.mutate([id, categoryValue, reason] as never, { onSuccess: () => { categoryDisclosure.onClose(); void ticketQuery.refetch(); } })} />
    </section>
  );
}
