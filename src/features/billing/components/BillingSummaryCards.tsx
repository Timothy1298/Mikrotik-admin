import { BillingStatsRow } from "@/features/billing/components/BillingStatsRow";
import type { BillingOverview } from "@/features/billing/types/billing.types";

export function BillingSummaryCards({ overview }: { overview: BillingOverview }) {
  return <BillingStatsRow overview={overview} />;
}
