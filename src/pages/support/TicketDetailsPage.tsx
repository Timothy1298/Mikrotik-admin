import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

export function TicketDetailsPage() {
  return (
    <section className="space-y-6">
      <PageHeader title="Ticket details" description="Customer conversation history, ownership, and escalation trail should be shown here." />
      <Card>Ticket detail placeholder</Card>
    </section>
  );
}
