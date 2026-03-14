import { CreditCard, Receipt, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataToolbar } from "@/components/shared/DataToolbar";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageSection } from "@/components/shared/PageSection";
import { SummaryGrid } from "@/components/data-display/SummaryGrid";

export function BillingPage() {
  return (
    <section className="space-y-6">
      <PageHeader title="Billing" description="Subscriptions, invoices, overdue balances, and payment operations should all follow a consistent operator workflow here." />
      <SummaryGrid>
        <MetricCard title="Monthly revenue" value="$0.00" progress={0} />
        <MetricCard title="Active subscriptions" value="0" progress={0} />
        <MetricCard title="Past due accounts" value="0" progress={0} />
      </SummaryGrid>
      <PageSection title="Billing workspace" description="This area is intentionally structured for future tabs, filters, and data tables.">
        <DataToolbar>
          <div className="flex items-center gap-3 text-slate-300"><CreditCard className="h-4 w-4 text-brand-100" />Transactions</div>
          <div className="flex items-center gap-3 text-slate-400"><Receipt className="h-4 w-4 text-brand-100" />Invoices <Wallet className="ml-2 h-4 w-4 text-brand-100" />Subscriptions</div>
        </DataToolbar>
        <div className="mt-4 rounded-3xl border border-dashed border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-8 text-center text-sm text-slate-500">Billing tables and tabs will mount here.</div>
      </PageSection>
    </section>
  );
}
