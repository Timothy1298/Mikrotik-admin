import { Badge } from "@/components/ui/Badge";

export function VpnServerMaintenanceBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "warning" : "neutral"}>{active ? "maintenance" : "normal"}</Badge>;
}
