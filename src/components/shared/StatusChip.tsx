import { Badge } from "@/components/ui/Badge";

const toneMap = {
  active: "success",
  healthy: "success",
  pending: "warning",
  warning: "warning",
  offline: "danger",
  inactive: "neutral",
  critical: "danger",
} as const;

export function StatusChip({ status }: { status: keyof typeof toneMap }) {
  return <Badge tone={toneMap[status]}>{status}</Badge>;
}
