import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { LogsSecurityFilterState, LogsSecuritySection } from "@/features/logs-security/types/logs-security.types";

export function LogsSecurityFilters({
  section,
  filters,
  onChange,
}: {
  section: LogsSecuritySection;
  filters: LogsSecurityFilterState;
  onChange: (patch: Partial<LogsSecurityFilterState>) => void;
}) {
  const statusOptions = [{ label: "All statuses", value: "" }, { label: "Active", value: "active" }, { label: "Revoked", value: "revoked" }, { label: "Pending", value: "pending" }, { label: "Reviewed", value: "reviewed" }];
  const severityOptions = [{ label: "All severities", value: "" }, { label: "Critical", value: "critical" }, { label: "High", value: "high" }, { label: "Medium", value: "medium" }, { label: "Low", value: "low" }];

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      <Input
        label="Search"
        value={filters.q || ""}
        onChange={(event) => onChange({ q: event.target.value, page: 1 })}
        placeholder={`Search ${section.replace(/-/g, " ")} by actor, user, resource, or reason`}
        leftIcon={<Search className="h-4 w-4" />}
      />
      <Select label="Severity" value={filters.severity || ""} onChange={(event) => onChange({ severity: event.target.value || undefined, page: 1 })} options={severityOptions} />
      <Select label="Status" value={filters.status || ""} onChange={(event) => onChange({ status: event.target.value || undefined, page: 1 })} options={statusOptions} />
      <Select
        label="Source"
        value={filters.source || ""}
        onChange={(event) => onChange({ source: event.target.value || undefined, page: 1 })}
        options={[
          { label: "All sources", value: "" },
          { label: "Admin", value: "admin" },
          { label: "Auth", value: "auth" },
          { label: "Incident", value: "incident" },
          { label: "System", value: "system" },
          { label: "User", value: "user" },
        ]}
      />
    </div>
  );
}
