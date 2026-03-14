import { SubscriptionStatusBadge } from "@/features/billing/components/SubscriptionStatusBadge";

export function PaymentStatusBadge({ status }: { status: string }) {
  return <SubscriptionStatusBadge status={status} />;
}
