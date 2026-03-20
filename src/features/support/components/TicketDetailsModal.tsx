import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { LifeBuoy, MessageSquare, StickyNote } from "lucide-react";
import { TicketCategoryBadge, TicketEscalationBadge, TicketPriorityBadge, TicketStatusBadge } from "@/features/support/components/SupportBadges";
import { useTicket, useTicketActivity, useTicketFlags, useTicketMessages, useTicketNotes } from "@/features/support/hooks/useSupport";
import { formatDateTime } from "@/lib/formatters/date";

export function TicketDetailsModal({
  open,
  ticketId,
  onClose,
  onReply,
  onAssign,
  onReassign,
  onEscalate,
  onDeEscalate,
  onResolve,
  onCloseTicket,
  onReopen,
  onAddNote,
  onAddFlag,
}: {
  open: boolean;
  ticketId: string;
  onClose: () => void;
  onReply?: () => void;
  onAssign?: () => void;
  onReassign?: () => void;
  onEscalate?: () => void;
  onDeEscalate?: () => void;
  onResolve?: () => void;
  onCloseTicket?: () => void;
  onReopen?: () => void;
  onAddNote?: () => void;
  onAddFlag?: () => void;
}) {
  const detailQuery = useTicket(ticketId);
  const messagesQuery = useTicketMessages(ticketId, { limit: 100 });
  const activityQuery = useTicketActivity(ticketId, { limit: 50 });
  const notesQuery = useTicketNotes(ticketId);
  const flagsQuery = useTicketFlags(ticketId);

  const detail = detailQuery.data;

  return (
    <Modal
      open={open}
      title={detail?.ticket.subject || "Support ticket"}
      description="Support workspace with conversation, linked context, internal notes, flags, and activity."
      onClose={onClose}
      maxWidthClass="max-w-5xl"
    >
      {detailQuery.isPending ? <SectionLoader /> : !detail ? <EmptyState icon={LifeBuoy} title="Ticket not found" description="The selected support ticket could not be loaded." /> : (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <CardTitle>{detail.ticket.ticketReference}</CardTitle>
                <CardDescription className="break-words">{detail.ticket.customer?.email || "No customer email"} · {formatDateTime(detail.ticket.createdAt)}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <TicketStatusBadge status={detail.ticket.status} />
                <TicketPriorityBadge priority={detail.ticket.priority} />
                <TicketCategoryBadge category={detail.ticket.category} />
                <TicketEscalationBadge escalated={detail.ticket.escalated} />
              </div>
            </CardHeader>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Awaiting: {detail.ticket.awaitingState.replace(/_/g, " ")}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Assignee: {detail.ticket.assignee?.name || "Unassigned"}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Age: {detail.ticket.age.ageHours}h · Idle {detail.ticket.age.idleHours}h</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Linked resources: {[detail.context.router, detail.context.vpnServer, detail.context.incident, detail.context.subscription, detail.context.transaction].filter(Boolean).length}</div>
            </div>
          </Card>

          <div className="flex flex-wrap items-center gap-2 border-b border-brand-500/15 pb-3">
            {onReply ? <Button variant="ghost" size="sm" onClick={onReply}>Reply</Button> : null}
            {!detail.ticket.assignee && onAssign ? <Button variant="ghost" size="sm" onClick={onAssign}>Assign</Button> : null}
            {detail.ticket.assignee && onReassign ? <Button variant="ghost" size="sm" onClick={onReassign}>Reassign</Button> : null}
            {!detail.ticket.escalated && onEscalate ? <Button variant="ghost" size="sm" onClick={onEscalate}>Escalate</Button> : null}
            {detail.ticket.escalated && onDeEscalate ? <Button variant="ghost" size="sm" onClick={onDeEscalate}>De-escalate</Button> : null}
            {detail.ticket.status !== "resolved" && detail.ticket.status !== "closed" && onResolve ? <Button variant="ghost" size="sm" onClick={onResolve}>Resolve</Button> : null}
            {detail.ticket.status !== "closed" && onCloseTicket ? <Button variant="ghost" size="sm" onClick={onCloseTicket}>Close</Button> : null}
            {(detail.ticket.status === "resolved" || detail.ticket.status === "closed") && onReopen ? <Button variant="ghost" size="sm" onClick={onReopen}>Reopen</Button> : null}
            {onAddNote ? <Button variant="ghost" size="sm" onClick={onAddNote}>Add Note</Button> : null}
            {onAddFlag ? <Button variant="ghost" size="sm" onClick={onAddFlag}>Add Flag</Button> : null}
          </div>

          <Card>
            <CardHeader className="flex-col"><div><CardTitle>Customer & context</CardTitle><CardDescription>Customer summary and related operational context for this ticket.</CardDescription></div></CardHeader>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Customer: {detail.context.customer?.name || "Unknown"} · {detail.context.customer?.supportTier || "standard"}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Router: {detail.context.router?.name || "None linked"}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">VPN server: {detail.context.vpnServer?.name || "None linked"}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Incident: {detail.context.incident?.title || "None linked"}</div>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex-col"><div><CardTitle>Conversation thread</CardTitle><CardDescription>Customer, admin, and system-visible ticket messages.</CardDescription></div></CardHeader>
            <div className="space-y-3">
              {messagesQuery.isPending ? <SectionLoader /> : (messagesQuery.data?.items || []).length ? messagesQuery.data?.items.map((message) => (
                <div key={message.id} className={`rounded-2xl border p-4 ${message.direction === "admin" ? "border-brand-500/35 bg-[rgba(37,99,235,0.08)]" : "border-brand-500/15 bg-[rgba(8,14,31,0.9)]"}`}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <p className="break-words text-sm font-medium text-slate-100">{message.author?.email || message.source}</p>
                    <p className="shrink-0 text-xs text-slate-500">{formatDateTime(message.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{message.body}</p>
                  {message.attachments.length ? <div className="mt-3 flex flex-wrap gap-2">{message.attachments.map((attachment) => <span key={attachment.url} className="rounded-full border border-brand-500/15 px-3 py-1 text-xs text-slate-400">{attachment.filename}</span>)}</div> : null}
                </div>
              )) : <EmptyState icon={MessageSquare} title="No conversation messages" description="No customer-visible messages are attached to this ticket yet." />}
            </div>
          </Card>

          <div className="grid gap-4 2xl:grid-cols-2">
            <Card>
              <CardHeader className="flex-col"><div><CardTitle>Internal notes</CardTitle><CardDescription>Private operator notes for support workflows.</CardDescription></div></CardHeader>
              <div className="space-y-3">
                {notesQuery.isPending ? <SectionLoader /> : (notesQuery.data || []).length ? notesQuery.data?.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                    <p className="text-sm text-slate-100">{note.body}</p>
                    <p className="mt-2 text-xs text-slate-500">{note.category} · {note.author} · {formatDateTime(note.createdAt)}</p>
                  </div>
                )) : <EmptyState icon={StickyNote} title="No internal notes" description="No internal support notes have been added to this ticket yet." />}
              </div>
            </Card>

            <Card>
              <CardHeader className="flex-col"><div><CardTitle>Flags & activity</CardTitle><CardDescription>Internal review markers and support workflow events.</CardDescription></div></CardHeader>
              <div className="space-y-3">
                {(flagsQuery.data || []).length ? flagsQuery.data?.map((flag) => (
                  <div key={flag.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                    <p className="text-sm text-slate-100">{flag.flag}</p>
                    <p className="mt-2 text-xs text-slate-500">{flag.severity} · {flag.description || "No description"}</p>
                  </div>
                )) : <EmptyState icon={LifeBuoy} title="No flags" description="This ticket does not currently have any internal workflow flags." />}
                <div className="border-t border-brand-500/15 pt-3">
                  {(activityQuery.data?.items || []).slice(0, 6).map((item) => (
                  <div key={item.id} className="py-2">
                    <p className="text-sm text-slate-100">{item.summary}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(item.timestamp)}</p>
                  </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </Modal>
  );
}
