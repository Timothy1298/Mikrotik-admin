import { AlertTriangle, ArrowRight, Clock3, CreditCard, PlusCircle, Receipt, ShieldAlert } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { TableLoader } from "@/components/feedback/TableLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { billingTabs } from "@/config/module-tabs";
import { appRoutes } from "@/config/routes";
import { BillingStatsRow } from "@/features/billing/components";
import { useBillingActivity, useBillingAnalytics, useBillingOverview, useBillingRisk, useSubscriptions } from "@/features/billing/hooks/useBilling";
import { formatCurrency } from "@/lib/formatters/currency";

export function BillingOverviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const overviewQuery = useBillingOverview();
  const analyticsQuery = useBillingAnalytics({ window: "30d" });
  const riskQuery = useBillingRisk();
  const activityQuery = useBillingActivity({ limit: 5 });
  const overdueQuery = useSubscriptions({ limit: 5, overdue: "true" } as never);

  if (overviewQuery.isPending) return <TableLoader />;
  if (overviewQuery.isError || !overviewQuery.data) return <ErrorState title="Unable to load billing overview" description="Retry after confirming the admin billing API is available." onAction={() => void overviewQuery.refetch()} />;

  const overview = overviewQuery.data;

  return (
    <section className="space-y-6">
      <PageHeader title="Billing & Subscriptions" description="Platform-wide command center for subscription health, invoice/payment state, trial pressure, grace-period operations, and revenue risk." meta={overview.lastBillingSyncAt ? `Last sync ${overview.lastBillingSyncAt}` : "Billing telemetry ready"} />
      <Tabs tabs={[...billingTabs]} value={location.pathname} onChange={navigate} />
      <div className="flex justify-end">
        <RefreshButton loading={overviewQuery.isFetching || analyticsQuery.isFetching || riskQuery.isFetching || activityQuery.isFetching || overdueQuery.isFetching} onClick={() => { void overviewQuery.refetch(); void analyticsQuery.refetch(); void riskQuery.refetch(); void activityQuery.refetch(); void overdueQuery.refetch(); }} />
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Primary actions</CardTitle>
            <CardDescription>Most-used billing workflows, promoted for quick operator access.</CardDescription>
          </div>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <Button leftIcon={<CreditCard className="h-4 w-4" />} onClick={() => navigate(appRoutes.billingPayments)}>Record or review payments</Button>
          <Button variant="outline" leftIcon={<Receipt className="h-4 w-4" />} onClick={() => navigate(appRoutes.billingInvoices)}>Open invoices</Button>
          <Button variant="outline" leftIcon={<AlertTriangle className="h-4 w-4" />} onClick={() => navigate(appRoutes.billingOverdueRisk)}>Overdue risk queue</Button>
          <Button variant="outline" leftIcon={<PlusCircle className="h-4 w-4" />} onClick={() => navigate(appRoutes.billingReports)}>Financial reports</Button>
        </div>
      </Card>
      <BillingStatsRow overview={overview} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Estimated MRR" value={formatCurrency(overview.estimatedMRR, "USD")} progress={100} />
        <MetricCard title="Failed payments" value={String(overview.failedPaymentCount)} progress={Math.min(100, overview.failedPaymentCount * 10)} />
        <MetricCard title="Trials ending soon" value={String(overview.trialsEndingSoon)} progress={Math.min(100, overview.trialsEndingSoon * 12)} />
        <MetricCard title="Grace period accounts" value={String(overview.accountsInGracePeriod)} progress={Math.min(100, overview.accountsInGracePeriod * 12)} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader><div><CardTitle>Risk summary</CardTitle><CardDescription>Highest-signal billing follow-up counts from the real backend risk model.</CardDescription></div></CardHeader>
          {riskQuery.isPending ? <SectionLoader /> : riskQuery.isError || !riskQuery.data ? <ErrorState title="Unable to load billing risk" description="Retry after confirming the risk endpoint is available." onAction={() => void riskQuery.refetch()} /> : (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Overdue accounts: {riskQuery.data.overdueAccounts}</div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Failed payments: {riskQuery.data.failedPayments}</div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Suspension risk: {riskQuery.data.accountsAtRiskOfSuspension}</div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">Repeated failures: {riskQuery.data.repeatedPaymentFailures}</div>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader><div><CardTitle>Quick jumps</CardTitle><CardDescription>Open the highest-signal billing queues directly from the overview.</CardDescription></div></CardHeader>
          <div className="grid gap-3">
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.billingOverdueRisk}>Overdue & Risk <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.billingTrials}>Trial Accounts <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.billingInvoices}>Invoices <ArrowRight className="h-4 w-4" /></Link>
            <Link className="inline-flex h-10 items-center justify-between rounded-2xl border border-background-border bg-background-panel px-4 text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary" to={appRoutes.billingPayments}>Payments <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><div><CardTitle>Recent billing activity</CardTitle><CardDescription>Latest billing events across subscriptions, invoices, payments, and admin actions.</CardDescription></div></CardHeader>
          <div className="space-y-3">
            {activityQuery.isPending ? <SectionLoader /> : activityQuery.isError ? <ErrorState title="Unable to load billing activity" description="Retry after confirming the activity endpoint is available." onAction={() => void activityQuery.refetch()} /> : (activityQuery.data?.items || []).length ? activityQuery.data?.items.map((item) => <div key={item.id} className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">{item.summary}</div>) : <EmptyState icon={Receipt} title="No billing activity" description="Recent billing events will appear here." />}
          </div>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>Top risk accounts</CardTitle><CardDescription>Accounts currently carrying overdue or failed-payment risk.</CardDescription></div></CardHeader>
          <div className="space-y-3">
            {overdueQuery.isPending ? <SectionLoader /> : overdueQuery.isError ? <ErrorState title="Unable to load overdue accounts" description="Retry after confirming the subscriptions endpoint is available." onAction={() => void overdueQuery.refetch()} /> : (overdueQuery.data?.items || []).length ? overdueQuery.data?.items.map((item) => <div key={item.id} className="rounded-2xl border border-background-border bg-background-panel p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-text-primary">{item.account?.name}</p><p className="text-sm text-text-secondary">{item.subscriptionStatus} • {item.openInvoiceCount} open invoices</p></div><AlertTriangle className="h-4 w-4 text-danger" /></div></div>) : <EmptyState icon={ShieldAlert} title="No overdue accounts" description="No accounts are currently in the overdue subscription queue." />}
          </div>
        </Card>
      </div>
    </section>
  );
}
