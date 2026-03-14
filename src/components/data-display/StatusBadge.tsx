import { StatusChip } from "@/components/shared/StatusChip";

export function StatusBadge({ status }: { status: "active" | "pending" | "inactive" | "offline" | "healthy" | "warning" | "critical" }) {
  return <StatusChip status={status} />;
}
