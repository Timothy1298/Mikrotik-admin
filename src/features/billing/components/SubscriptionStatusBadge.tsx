import { Badge } from "@/components/ui/Badge";

export function SubscriptionStatusBadge({ status }: { status: string }) {
  if (["active", "paid", "current"].includes(status)) return <Badge tone="success">{status}</Badge>;
  if (["trial", "pending", "acknowledged"].includes(status)) return <Badge tone="info">{status}</Badge>;
  if (["past_due", "overdue", "grace"].includes(status)) return <Badge tone="warning">{status.replace(/_/g, " ")}</Badge>;
  if (["canceled", "expired", "failed", "suspended"].includes(status)) return <Badge tone="danger">{status.replace(/_/g, " ")}</Badge>;
  return <Badge tone="neutral">{status.replace(/_/g, " ")}</Badge>;
}
