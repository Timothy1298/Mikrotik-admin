import { Badge } from "@/components/ui/Badge";

export function IncidentSeverityBadge({ severity }: { severity: string }) {
  if (severity === "critical") return <Badge tone="danger">critical</Badge>;
  if (severity === "high") return <Badge tone="warning">high</Badge>;
  if (severity === "medium") return <Badge tone="info">medium</Badge>;
  return <Badge tone="neutral">{severity}</Badge>;
}
