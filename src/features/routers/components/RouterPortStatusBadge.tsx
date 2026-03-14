import { Badge } from "@/components/ui/Badge";

export function RouterPortStatusBadge({ status }: { status: string }) {
  if (status === "assigned" || status === "listening") return <Badge tone="success">{status}</Badge>;
  if (status === "missing" || status === "stopped" || status === "not_listening") return <Badge tone="danger">{status.replace(/_/g, " ")}</Badge>;
  return <Badge tone="neutral">{status.replace(/_/g, " ")}</Badge>;
}
