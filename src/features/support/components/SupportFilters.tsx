import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { SupportFilterState } from "@/features/support/types/support.types";

export function SupportFilters({ filters, onChange }: { filters: SupportFilterState; onChange: (patch: Partial<SupportFilterState>) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <Input label="Search" value={filters.q || ""} onChange={(event) => onChange({ q: event.target.value, page: 1 })} placeholder="Search by ticket, subject, customer, assignee, or linked resource" leftIcon={<Search className="h-4 w-4" />} />
      <Select label="Status" value={filters.status || ""} onChange={(event) => onChange({ status: event.target.value || undefined, page: 1 })} options={[{ label: "All statuses", value: "" }, { label: "Open", value: "open" }, { label: "In progress", value: "in_progress" }, { label: "Resolved", value: "resolved" }, { label: "Closed", value: "closed" }]} />
      <Select label="Priority" value={filters.priority || ""} onChange={(event) => onChange({ priority: event.target.value || undefined, page: 1 })} options={[{ label: "All priorities", value: "" }, { label: "Low", value: "low" }, { label: "Medium", value: "medium" }, { label: "High", value: "high" }, { label: "Urgent", value: "urgent" }]} />
      <Select label="Category" value={filters.category || ""} onChange={(event) => onChange({ category: event.target.value || undefined, page: 1 })} options={[{ label: "All categories", value: "" }, { label: "Technical", value: "technical" }, { label: "Billing", value: "billing" }, { label: "General", value: "general" }, { label: "Feature request", value: "feature_request" }, { label: "Bug report", value: "bug_report" }]} />
      <Select label="Awaiting" value={filters.awaiting || ""} onChange={(event) => onChange({ awaiting: event.target.value || undefined, page: 1 })} options={[{ label: "All states", value: "" }, { label: "Awaiting admin", value: "admin" }, { label: "Awaiting customer", value: "customer" }]} />
    </div>
  );
}
