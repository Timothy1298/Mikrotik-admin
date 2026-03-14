import { useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { useTicket } from "@/features/support/hooks/useSupport";
import { TicketCategoryBadge, TicketEscalationBadge, TicketPriorityBadge, TicketStatusBadge } from "@/features/support/components";

export function TicketDetailsPage() {
  const { id = "" } = useParams();
  const ticketQuery = useTicket(id);

  if (ticketQuery.isPending) return <SectionLoader />;
  if (ticketQuery.isError || !ticketQuery.data) return <ErrorState title="Unable to load ticket details" description="Retry after confirming the support ticket endpoint is available." onAction={() => void ticketQuery.refetch()} />;

  const detail = ticketQuery.data;

  return (
    <section className="space-y-6">
      <PageHeader title={detail.ticket.subject} description="Route-driven support ticket detail view for direct deep links and investigation." meta={detail.ticket.ticketReference} />
      <Card>
        <div className="flex flex-wrap gap-2">
          <TicketStatusBadge status={detail.ticket.status} />
          <TicketPriorityBadge priority={detail.ticket.priority} />
          <TicketCategoryBadge category={detail.ticket.category} />
          <TicketEscalationBadge escalated={detail.ticket.escalated} />
        </div>
        <p className="mt-4 text-sm text-slate-300">{detail.ticket.description}</p>
      </Card>
    </section>
  );
}
