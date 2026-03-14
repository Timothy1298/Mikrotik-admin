import { Badge } from "@/components/ui/Badge";

export function VpnServerHealthBadge({ status }: { status: string }) {
  if (status === "healthy") return <Badge tone="success">healthy</Badge>;
  if (status === "degraded") return <Badge tone="warning">degraded</Badge>;
  if (status === "disabled") return <Badge tone="neutral">disabled</Badge>;
  if (status === "maintenance") return <Badge tone="warning">maintenance</Badge>;
  return <Badge tone="info">{status.replace(/_/g, " ")}</Badge>;
}
