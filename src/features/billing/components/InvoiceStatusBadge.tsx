import { SubscriptionStatusBadge } from "@/features/billing/components/SubscriptionStatusBadge";

export function InvoiceStatusBadge({ status }: { status: string }) {
  return <SubscriptionStatusBadge status={status} />;
}
