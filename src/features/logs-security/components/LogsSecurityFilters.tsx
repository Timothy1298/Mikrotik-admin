import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  const sourceOptions = [
    { label: "All sources", value: "" },
    { label: "Admin", value: "admin" },
    { label: "Auth", value: "auth" },
    { label: "Incident", value: "incident" },
    { label: "System", value: "system" },
    { label: "User", value: "user" },
  ];
  const eventTypeOptions = [
    { label: "All event types", value: "" },
    { label: "Login failed", value: "login_failed" },
    { label: "Login succeeded", value: "login_succeeded" },
    { label: "Password reset requested", value: "password_reset_requested" },
    { label: "Password reset completed", value: "password_reset_completed" },
    { label: "Session revoked", value: "session_revoked" },
    { label: "Email verified", value: "email_verified" },
    { label: "Verification email sent", value: "verification_email_sent" },
    { label: "Admin action", value: "admin_action" },
  ];

  const renderPrimaryRow = () => {
    if (section === "audit") {
      return (
        <div className="grid gap-4 xl:grid-cols-4">
          <Input label="Search" value={filters.q || ""} onChange={(event) => onChange({ q: event.target.value, page: 1 })} placeholder="Search audit actions, actors, targets, or reasons" leftIcon={<Search className="h-4 w-4" />} />
          <Input label="From date" type="date" value={filters.from || ""} onChange={(event) => onChange({ from: event.target.value || undefined, page: 1 })} />
          <Input label="To date" type="date" value={filters.to || ""} onChange={(event) => onChange({ to: event.target.value || undefined, page: 1 })} />
          <Input label="Admin email" value={filters.actorAdmin || ""} onChange={(event) => onChange({ actorAdmin: event.target.value || undefined, page: 1 })} placeholder="admin@example.com" />
        </div>
      );
    }

    if (section === "activity") {
      return (
        <div className="grid gap-4 xl:grid-cols-4">
          <Input label="Search" value={filters.q || ""} onChange={(event) => onChange({ q: event.target.value, page: 1 })} placeholder="Search events, actors, users, or resources" leftIcon={<Search className="h-4 w-4" />} />
          <Select label="Severity" value={filters.severity || ""} onChange={(event) => onChange({ severity: event.target.value || undefined, page: 1 })} options={severityOptions} />
          <Input label="From date" type="date" value={filters.from || ""} onChange={(event) => onChange({ from: event.target.value || undefined, page: 1 })} />
          <Input label="To date" type="date" value={filters.to || ""} onChange={(event) => onChange({ to: event.target.value || undefined, page: 1 })} />
        </div>
      );
    }

    if (["security-events", "suspicious-activity", "reviews-notes"].includes(section)) {
      return (
        <div className="grid gap-4 xl:grid-cols-4">
          <Input label="Search" value={filters.q || ""} onChange={(event) => onChange({ q: event.target.value, page: 1 })} placeholder={`Search ${section.replace(/-/g, " ")} by actor, user, resource, or reason`} leftIcon={<Search className="h-4 w-4" />} />
          <Select label="Severity" value={filters.severity || ""} onChange={(event) => onChange({ severity: event.target.value || undefined, page: 1 })} options={severityOptions} />
          <Select label="Event Type" value={filters.eventType || ""} onChange={(event) => onChange({ eventType: event.target.value || undefined, page: 1 })} options={eventTypeOptions} />
          <Input label="From date" type="date" value={filters.from || ""} onChange={(event) => onChange({ from: event.target.value || undefined, page: 1 })} />
        </div>
      );
    }

    if (section === "sessions") {
      return (
        <div className="grid gap-4 xl:grid-cols-4">
          <Input label="Search" value={filters.q || ""} onChange={(event) => onChange({ q: event.target.value, page: 1 })} placeholder="Search sessions, users, devices, or IPs" leftIcon={<Search className="h-4 w-4" />} />
          <Select label="Status" value={filters.status || ""} onChange={(event) => onChange({ status: event.target.value || undefined, page: 1 })} options={statusOptions} />
          <Input label="From date" type="date" value={filters.from || ""} onChange={(event) => onChange({ from: event.target.value || undefined, page: 1 })} />
          <Input label="To date" type="date" value={filters.to || ""} onChange={(event) => onChange({ to: event.target.value || undefined, page: 1 })} />
        </div>
      );
    }

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
        <Select label="Source" value={filters.source || ""} onChange={(event) => onChange({ source: event.target.value || undefined, page: 1 })} options={sourceOptions} />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderPrimaryRow()}
      {section !== "audit" ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <Input label="From date" type="date" value={filters.from || ""} onChange={(event) => onChange({ from: event.target.value || undefined, page: 1 })} />
          <Input label="To date" type="date" value={filters.to || ""} onChange={(event) => onChange({ to: event.target.value || undefined, page: 1 })} />
          <div className="flex items-end">
            <Button variant="outline" onClick={() => onChange({ from: undefined, to: undefined, page: 1 })}>
              Clear dates
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
