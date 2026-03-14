import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { RouterQuery } from "@/features/routers/types/router.types";

export function RouterFilters({
  filters,
  hiddenFields = [],
  onChange,
}: {
  filters: RouterQuery;
  hiddenFields?: Array<keyof RouterQuery>;
  onChange: (patch: Partial<RouterQuery>) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {!hiddenFields.includes("q") ? (
        <Input
          value={filters.q || ""}
          onChange={(event) => onChange({ q: event.target.value || undefined })}
          placeholder="Search name, customer, VPN IP, ports"
          leftIcon={<Search className="h-4 w-4" />}
        />
      ) : null}
      {!hiddenFields.includes("status") ? (
        <Select
          label="Router status"
          value={filters.status || ""}
          onChange={(event) => onChange({ status: event.target.value || undefined })}
          options={[
            { label: "All statuses", value: "" },
            { label: "Active", value: "active" },
            { label: "Pending", value: "pending" },
            { label: "Offline", value: "offline" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
      ) : null}
      {!hiddenFields.includes("setupStatus") ? (
        <Select
          label="Setup status"
          value={filters.setupStatus || ""}
          onChange={(event) => onChange({ setupStatus: event.target.value || undefined })}
          options={[
            { label: "All setup states", value: "" },
            { label: "Pending", value: "pending" },
            { label: "Awaiting connection", value: "awaiting_connection" },
            { label: "Connected", value: "connected" },
            { label: "Failed", value: "failed" },
            { label: "Disabled", value: "disabled" },
          ]}
        />
      ) : null}
      {!hiddenFields.includes("connectionStatus") ? (
        <Select
          label="Tunnel state"
          value={filters.connectionStatus || ""}
          onChange={(event) => onChange({ connectionStatus: event.target.value || undefined })}
          options={[
            { label: "All tunnel states", value: "" },
            { label: "Online", value: "online" },
            { label: "Offline", value: "offline" },
            { label: "Pending", value: "pending" },
            { label: "Peer disabled", value: "peer_disabled" },
            { label: "Disabled", value: "disabled" },
          ]}
        />
      ) : null}
      {!hiddenFields.includes("serverNode") ? (
        <Input label="Server node" value={filters.serverNode || ""} onChange={(event) => onChange({ serverNode: event.target.value || undefined })} placeholder="wireguard" />
      ) : null}
    </div>
  );
}
