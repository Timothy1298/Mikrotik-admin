import { Badge } from "@/components/ui/Badge";

export function HealthStatusBadge({ status }: { status: string }) {
  if (["healthy", "active", "fresh", "connected"].includes(status)) return <Badge tone="success">{status.replace(/_/g, " ")}</Badge>;
  if (["degraded", "warning", "stale", "pending", "awaiting_connection", "acknowledged"].includes(status)) return <Badge tone="warning">{status.replace(/_/g, " ")}</Badge>;
  if (["critical", "failed", "offline", "resolved", "disabled"].includes(status)) return <Badge tone={status === "resolved" ? "info" : "danger"}>{status.replace(/_/g, " ")}</Badge>;
  return <Badge tone="info">{status.replace(/_/g, " ")}</Badge>;
}
