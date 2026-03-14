import { Badge } from "@/components/ui/Badge";

export function VpnServerLoadBadge({ overloaded, nearCapacity }: { overloaded: boolean; nearCapacity: boolean }) {
  if (overloaded) return <Badge tone="danger">overloaded</Badge>;
  if (nearCapacity) return <Badge tone="warning">near capacity</Badge>;
  return <Badge tone="success">healthy load</Badge>;
}
