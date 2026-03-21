import { Badge } from "@/components/ui/Badge";

const tones: Record<string, "info" | "success" | "warning" | "danger" | "neutral"> = {
  healthy: "success",
  fresh: "success",
  management_only: "info",
  warning: "warning",
  stale: "warning",
  critical: "danger",
  offline: "danger",
  never: "neutral",
  none: "neutral",
  peer_disabled: "neutral",
};

export function RouterTunnelHealthBadge({ status }: { status: string }) {
  return <Badge tone={tones[status] || "info"}>{status.replace(/_/g, " ")}</Badge>;
}
