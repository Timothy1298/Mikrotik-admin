import { Badge } from "@/components/ui/Badge";

const tones: Record<string, "info" | "success" | "warning" | "danger" | "neutral"> = {
  healthy: "success",
  degraded: "warning",
  disabled: "neutral",
  maintenance: "warning",
  unknown: "neutral",
  active: "success",
};

export function VpnServerStatusBadge({ status }: { status: string }) {
  return <Badge tone={tones[status] || "info"}>{status.replace(/_/g, " ")}</Badge>;
}
