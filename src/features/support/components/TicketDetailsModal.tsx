import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { LifeBuoy, MessageSquare, StickyNote } from "lucide-react";
import { TicketCategoryBadge, TicketEscalationBadge, TicketPriorityBadge, TicketStatusBadge } from "@/features/support/components/SupportBadges";
import { useTicket, useTicketActivity, useTicketFlags, useTicketMessages, useTicketNotes } from "@/features/support/hooks/useSupport";

export function TicketDetailsModal({
  open,
  ticketId,
  onClose,
}: {
  open: boolean;
  ticketId: string;
  onClose: () => void;
}) {
  const detailQuery = useTicket(ticketId);
  const messagesQuery = useTicketMessages(ticketId, { limit: 100 });
  const activityQuery = useTicketActivity(ticketId, { limit: 50 });
  const notesQuery = useTicketNotes(ticketId);
  const flagsQuery = useTicketFlags(ticketId);

  const detail = detailQuery.data;

  return (
    <Modal open={open} title={detail?.ticket.subject || "Support ticket"} description="Support workspace with conversation, linked context, internal notes, flags, and activity." onClose={onClose}>
      {detailQuery.isPending ? <SectionLoader /> : !detail ? <EmptyState icon={LifeBuoy} title="Ticket not found" description="The selected support ticket could not be loaded." /> : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{detail.ticket.ticketReference}</CardTitle>
                <CardDescription>{detail.ticket.customer?.email || "No customer email"} · {new Date(detail.ticket.createdAt).toLocaleString()}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <TicketStatusBadge status={detail.ticket.status} />
                <TicketPriorityBadge priority={detail.ticket.priority} />
                <TicketCategoryBadge category={detail.ticket.category} />
                <TicketEscalationBadge escalated={detail.ticket.escalated} />
              </div>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Awaiting: {detail.ticket.awaitingState.replace(/_/g, " ")}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Assignee: {detail.ticket.assignee?.name || "Unassigned"}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Age: {detail.ticket.age.ageHours}h · Idle {detail.ticket.age.idleHours}h</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Linked resources: {[detail.context.router, detail.context.vpnServer, detail.context.incident, detail.context.subscription, detail.context.transaction].filter(Boolean).length}</div>
            </div>
          </Card>

          <Card>
            <CardHeader><div><CardTitle>Customer & context</CardTitle><CardDescription>Customer summary and related operational context for this ticket.</CardDescription></div></CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Customer: {detail.context.customer?.name || "Unknown"} · {detail.context.customer?.supportTier || "standard"}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Router: {detail.context.router?.name || "None linked"}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">VPN server: {detail.context.vpnServer?.name || "None linked"}</div>
              <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-200">Incident: {detail.context.incident?.title || "None linked"}</div>
            </div>
          </Card>

          <Card>
            <CardHeader><div><CardTitle>Conversation thread</CardTitle><CardDescription>Customer, admin, and system-visible ticket messages.</CardDescription></div></CardHeader>
            <div className="space-y-3">
              {messagesQuery.isPending ? <SectionLoader /> : (messagesQuery.data?.items || []).length ? messagesQuery.data?.items.map((message) => (
                <div key={message.id} className={`rounded-2xl border p-4 ${message.direction === "admin" ? "border-brand-500/35 bg-[rgba(37,99,235,0.08)]" : "border-brand-500/15 bg-[rgba(8,14,31,0.9)]"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-100">{message.author?.email || message.source}</p>
                    <p className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{message.body}</p>
                  {message.attachments.length ? <div className="mt-3 flex flex-wrap gap-2">{message.attachments.map((attachment) => <span key={attachment.url} className="rounded-full border border-brand-500/15 px-3 py-1 text-xs text-slate-400">{attachment.filename}</span>)}</div> : null}
                </div>
              )) : <EmptyState icon={MessageSquare} title="No conversation messages" description="No customer-visible messages are attached to this ticket yet." />}
            </div>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader><div><CardTitle>Internal notes</CardTitle><CardDescription>Private operator notes for support workflows.</CardDescription></div></CardHeader>
              <div className="space-y-3">
                {notesQuery.isPending ? <SectionLoader /> : (notesQuery.data || []).length ? notesQuery.data?.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                    <p className="text-sm text-slate-100">{note.body}</p>
                    <p className="mt-2 text-xs text-slate-500">{note.category} · {note.author} · {new Date(note.createdAt).toLocaleString()}</p>
                  </div>
                )) : <EmptyState icon={StickyNote} title="No internal notes" description="No internal support notes have been added to this ticket yet." />}
              </div>
            </Card>

            <Card>
              <CardHeader><div><CardTitle>Flags & activity</CardTitle><CardDescription>Internal review markers and support workflow events.</CardDescription></div></CardHeader>
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
                      <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
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
