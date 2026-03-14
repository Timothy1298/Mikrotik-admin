import { FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataToolbar } from "@/components/shared/DataToolbar";
import { FilterBar } from "@/components/shared/FilterBar";
import { SearchInput } from "@/components/shared/SearchInput";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/feedback/EmptyState";

export function LogsPage() {
  return (
    <section className="space-y-6">
      <PageHeader title="Logs" description="A searchable activity and security log explorer should live here, with filters and export controls." />
      <FilterBar left={<SearchInput placeholder="Search logs by message, actor, or level" />} />
      <Card>
        <DataToolbar>
          <div>
            <p className="text-sm font-medium text-slate-100">Activity stream</p>
            <p className="font-mono text-xs text-slate-500">Use this shell for a compact but readable operational log table.</p>
          </div>
        </DataToolbar>
        <div className="mt-4">
          <EmptyState icon={FileText} title="Log explorer scaffolded" description="Connect backend log endpoints and filters to make this page operational." />
        </div>
      </Card>
    </section>
  );
}
