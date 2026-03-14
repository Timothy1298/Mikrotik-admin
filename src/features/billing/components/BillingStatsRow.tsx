import { AlertTriangle, Clock3, CreditCard, Receipt, ShieldAlert, Wallet } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import type { BillingOverview } from "@/features/billing/types/billing.types";

export function BillingStatsRow({ overview }: { overview: BillingOverview }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <StatCard title="Subscribed accounts" value={String(overview.totalSubscribedAccounts)} description="Accounts currently participating in the billing system." icon={CreditCard} tone="neutral" />
      <StatCard title="Trial accounts" value={String(overview.trialAccounts)} description="Accounts currently covered by trial lifecycle rules." icon={Clock3} tone="info" />
      <StatCard title="Active paid" value={String(overview.activePaidAccounts)} description="Accounts with active monthly billing state." icon={Wallet} tone="success" />
      <StatCard title="Overdue" value={String(overview.overdueAccounts)} description="Accounts currently carrying overdue subscription pressure." icon={AlertTriangle} tone="warning" />
      <StatCard title="Open invoices" value={String(overview.openInvoiceCount)} description="Invoices still pending payment or settlement." icon={Receipt} tone="warning" />
      <StatCard title="Billing suspensions" value={String(overview.accountsSuspendedForBilling)} description="Accounts currently restricted for billing reasons." icon={ShieldAlert} tone="danger" />
    </div>
  );
}
