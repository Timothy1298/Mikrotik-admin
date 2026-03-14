import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { VpnServerQuery } from "@/features/vpn-servers/types/vpn-server.types";

export function VpnServersFilters({
  filters,
  hiddenFields = [],
  onChange,
}: {
  filters: VpnServerQuery;
  hiddenFields?: Array<keyof VpnServerQuery>;
  onChange: (patch: Partial<VpnServerQuery>) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {!hiddenFields.includes("q") ? (
        <Input value={filters.q || ""} onChange={(event) => onChange({ q: event.target.value || undefined })} placeholder="Search server name, node, region, hostname" leftIcon={<Search className="h-4 w-4" />} />
      ) : null}
      {!hiddenFields.includes("healthStatus") ? (
        <Select label="Health" value={filters.healthStatus || ""} onChange={(event) => onChange({ healthStatus: event.target.value || undefined })} options={[
          { label: "All health states", value: "" },
          { label: "Healthy", value: "healthy" },
          { label: "Degraded", value: "degraded" },
          { label: "Disabled", value: "disabled" },
          { label: "Maintenance", value: "maintenance" },
        ]} />
      ) : null}
      {!hiddenFields.includes("maintenanceMode") ? (
        <Select label="Maintenance" value={filters.maintenanceMode || ""} onChange={(event) => onChange({ maintenanceMode: event.target.value || undefined })} options={[
          { label: "All maintenance states", value: "" },
          { label: "In maintenance", value: "true" },
          { label: "Not in maintenance", value: "false" },
        ]} />
      ) : null}
      {!hiddenFields.includes("overloaded") ? (
        <Select label="Capacity" value={filters.overloaded || ""} onChange={(event) => onChange({ overloaded: event.target.value || undefined })} options={[
          { label: "All capacity states", value: "" },
          { label: "Overloaded", value: "true" },
        ]} />
      ) : null}
      {!hiddenFields.includes("region") ? (
        <Input label="Region" value={filters.region || ""} onChange={(event) => onChange({ region: event.target.value || undefined })} placeholder="eu-west" />
      ) : null}
    </div>
  );
}
