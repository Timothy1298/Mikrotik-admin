import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataToolbar } from "@/components/shared/DataToolbar";
import { FilterBar } from "@/components/shared/FilterBar";
import { SearchInput } from "@/components/shared/SearchInput";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/feedback/EmptyState";

export function SupportPage() {
  return (
    <section className="space-y-6">
      <PageHeader title="Support tickets" description="Centralize ticket triage, operator ownership, and escalation context using the same list-page pattern as other admin modules." />
      <FilterBar left={<SearchInput placeholder="Search tickets by subject or customer" />} />
      <Card>
        <DataToolbar>
          <div>
            <p className="text-sm font-medium text-slate-100">Ticket queue</p>
            <p className="font-mono text-xs text-slate-500">Ready for filters, ticket states, assignment, and pagination.</p>
          </div>
        </DataToolbar>
        <div className="mt-4">
          <EmptyState icon={LifeBuoy} title="No tickets loaded yet" description="This placeholder confirms the route, layout, and ticket workflow shell are wired correctly." />
        </div>
      </Card>
    </section>
  );
}
