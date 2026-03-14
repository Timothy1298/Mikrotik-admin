import { Badge } from "@/components/ui/Badge";

const tones: Record<string, "info" | "success" | "warning" | "danger" | "neutral"> = {
  connected: "success",
  awaiting_connection: "warning",
  pending: "warning",
  failed: "danger",
  disabled: "neutral",
};

export function RouterSetupBadge({ status }: { status: string }) {
  return <Badge tone={tones[status] || "info"}>{status.replace(/_/g, " ")}</Badge>;
}
