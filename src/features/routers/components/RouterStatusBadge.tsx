import { Badge } from "@/components/ui/Badge";

const tones: Record<string, "info" | "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  online: "success",
  pending: "warning",
  offline: "danger",
  inactive: "neutral",
  disabled: "neutral",
};

export function RouterStatusBadge({ status }: { status: string }) {
  return <Badge tone={tones[status] || "info"}>{status.replace(/_/g, " ")}</Badge>;
}
