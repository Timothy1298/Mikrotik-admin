import { useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { appRoutes } from "@/config/routes";
import { useBillingOutstandingReport, useBillingRevenueReport } from "@/features/billing/hooks/useBilling";
import { formatCurrency } from "@/lib/formatters/currency";
import { downloadTextFile } from "@/lib/utils/download";

dayjs.extend(relativeTime);

export function BillingReportsSection() {
  const [windowValue, setWindowValue] = useState("30d");
  const [groupBy, setGroupBy] = useState("day");
  const revenueQuery = useBillingRevenueReport({ window: windowValue, groupBy });
  const outstandingQuery = useBillingOutstandingReport();

  const exportCsv = () => {
    const rows = outstandingQuery.data?.accounts || [];
    const csv = ["Name,Email,Outstanding,Invoice Count,Oldest Invoice Date", ...rows.map((row) => `"${row.name}","${row.email}",${row.totalOutstanding},${row.invoiceCount},"${row.oldestInvoiceDate || ""}"`)].join("\n");
    downloadTextFile("outstanding-balances.csv", csv);
  };

  const revenueMetrics = useMemo(() => {
    const report = revenueQuery.data;
    if (!report) return [];
    return [
      { title: "Total Revenue", value: formatCurrency(report.totalRevenue, "KES"), progress: 100 },
      { title: "Total Invoiced", value: formatCurrency(report.totalInvoiced, "KES"), progress: 100 },
      { title: "Failed Payments", value: String(report.failedPayments), progress: Math.min(100, report.failedPayments * 10) },
      { title: "Refund Total", value: formatCurrency(report.refundTotal, "KES"), progress: 100 },
    ];
  }, [revenueQuery.data]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Revenue Report</CardTitle>
              <CardDescription>Revenue, invoices, failures, and refund trends across the selected time window.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "7 Days", value: "7d" },
                { label: "30 Days", value: "30d" },
                { label: "90 Days", value: "90d" },
                { label: "1 Year", value: "1y" },
              ].map((item) => (
                <Button key={item.value} variant={windowValue === item.value ? "primary" : "outline"} onClick={() => setWindowValue(item.value)}>
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <div className="space-y-5">
          <div className="max-w-xs">
            <Select label="Group by" value={groupBy} onChange={(event) => setGroupBy(event.target.value)} options={[{ label: "By Day", value: "day" }, { label: "By Week", value: "week" }, { label: "By Month", value: "month" }]} />
          </div>
          {revenueQuery.isPending ? <SectionLoader /> : revenueQuery.isError || !revenueQuery.data ? <ErrorState title="Unable to load revenue report" description="Retry after confirming the billing revenue report endpoint is available." onAction={() => void revenueQuery.refetch()} /> : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {revenueMetrics.map((metric) => <MetricCard key={metric.title} title={metric.title} value={metric.value} progress={metric.progress} />)}
              </div>
              <div className="h-80 rounded-[24px] border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueQuery.data.series}>
                    <defs>
                      <linearGradient id="billingRevenue" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "rgba(8,14,31,0.96)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 16 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#38bdf8" fill="url(#billingRevenue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="font-mono text-slate-500">
                    <tr><th className="pb-3">Account</th><th className="pb-3">Email</th><th className="pb-3">Revenue</th></tr>
                  </thead>
                  <tbody className="divide-y divide-brand-500/15">
                    {revenueQuery.data.topAccounts.map((account) => (
                      <tr key={account.accountId}>
                        <td className="py-3 text-slate-100">{account.name}</td>
                        <td className="py-3 text-slate-400">{account.email}</td>
                        <td className="py-3 text-slate-200">{formatCurrency(account.revenue, "KES")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Outstanding Balances</CardTitle>
              <CardDescription>Accounts with pending invoices and the oldest unpaid age.</CardDescription>
            </div>
            <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
          </div>
        </CardHeader>
        {outstandingQuery.isPending ? <SectionLoader /> : outstandingQuery.isError || !outstandingQuery.data ? <ErrorState title="Unable to load outstanding balances" description="Retry after confirming the outstanding report endpoint is available." onAction={() => void outstandingQuery.refetch()} /> : (
          <div className="space-y-5">
            <MetricCard title="Total Outstanding" value={formatCurrency(outstandingQuery.data.totalOutstanding, "KES")} progress={100} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="font-mono text-slate-500">
                  <tr><th className="pb-3">Account</th><th className="pb-3">Email</th><th className="pb-3">Outstanding</th><th className="pb-3">Invoices</th><th className="pb-3">Oldest Invoice</th></tr>
                </thead>
                <tbody className="divide-y divide-brand-500/15">
                  {outstandingQuery.data.accounts.map((account) => (
                    <tr key={account.accountId}>
                      <td className="py-3"><Link className="text-brand-100 hover:underline" to={appRoutes.userDetail(account.accountId)}>{account.name}</Link></td>
                      <td className="py-3 text-slate-400">{account.email}</td>
                      <td className="py-3 text-slate-200">{formatCurrency(account.totalOutstanding, "KES")}</td>
                      <td className="py-3 text-slate-200">{account.invoiceCount}</td>
                      <td className="py-3 text-slate-400">{account.oldestInvoiceDate ? dayjs(account.oldestInvoiceDate).fromNow() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
