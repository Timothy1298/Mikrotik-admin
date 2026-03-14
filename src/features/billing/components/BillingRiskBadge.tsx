import { Badge } from "@/components/ui/Badge";

export function BillingRiskBadge({ overdue, failedPayments = 0, grace = false }: { overdue: boolean; failedPayments?: number; grace?: boolean }) {
  if (overdue || failedPayments > 0) return <Badge tone="danger">at risk</Badge>;
  if (grace) return <Badge tone="warning">grace period</Badge>;
  return <Badge tone="success">healthy</Badge>;
}
