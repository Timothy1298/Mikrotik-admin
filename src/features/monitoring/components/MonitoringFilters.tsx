import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { MonitoringFilterState, MonitoringSection } from "@/features/monitoring/types/monitoring.types";

export function MonitoringFilters({
  section,
  filters,
  onChange,
}: {
  section: MonitoringSection;
  filters: MonitoringFilterState;
  onChange: (patch: Partial<MonitoringFilterState>) => void;
}) {
  const statusOptions = (() => {
    switch (section) {
      case "router-health":
      case "provisioning-analytics":
        return [
          { label: "All statuses", value: "" },
          { label: "Online", value: "online" },
          { label: "Offline", value: "offline" },
          { label: "Disabled", value: "disabled" },
          { label: "Pending", value: "pending" },
        ];
      case "vpn-server-health":
        return [
          { label: "All statuses", value: "" },
          { label: "Healthy", value: "healthy" },
          { label: "Degraded", value: "degraded" },
          { label: "Disabled", value: "disabled" },
          { label: "Maintenance", value: "maintenance" },
        ];
      case "peer-health":
        return [
          { label: "All states", value: "" },
          { label: "Fresh", value: "fresh" },
          { label: "Stale", value: "stale" },
          { label: "Never", value: "never" },
          { label: "Disabled", value: "disabled" },
        ];
      default:
        return null;
    }
  })();
  const statusControl = (section === "incidents-alerts" || section === "diagnostics" || section === "activity-feed") ? (
    <Select
      value={filters.severity || ""}
      onChange={(event) => onChange({ severity: event.target.value || undefined, page: 1 })}
      options={[
        { label: "All severities", value: "" },
        { label: "Critical", value: "critical" },
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Info", value: "info" },
      ]}
    />
  ) : statusOptions ? (
    <Select
      value={filters.status || ""}
      onChange={(event) => onChange({ status: event.target.value || undefined, page: 1 })}
      options={statusOptions}
    />
  ) : <div />;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Input placeholder="Search incidents, resources, users, or summaries..." value={filters.q || ""} onChange={(event) => onChange({ q: event.target.value, page: 1 })} />
      <Select
        value={filters.window || "24h"}
        onChange={(event) => onChange({ window: event.target.value })}
        options={[
          { label: "Last 1 hour", value: "1h" },
          { label: "Last 24 hours", value: "24h" },
          { label: "Last 7 days", value: "7d" },
          { label: "Last 30 days", value: "30d" },
        ]}
      />
      {statusControl}
      <Select
        value={filters.type || filters.source || ""}
        onChange={(event) => onChange(section === "activity-feed" ? { source: event.target.value || undefined, page: 1 } : { type: event.target.value || undefined, page: 1 })}
        options={section === "activity-feed"
          ? [
              { label: "All sources", value: "" },
              { label: "Router", value: "router" },
              { label: "Incident", value: "incident" },
              { label: "Support", value: "support" },
              { label: "Admin", value: "admin" },
            ]
          : [
              { label: "All types", value: "" },
              { label: "Offline", value: "router_offline" },
              { label: "Provisioning", value: "provisioning_failure" },
              { label: "Router", value: "router" },
              { label: "Server", value: "vpn_server" },
            ]}
      />
    </div>
  );
}
