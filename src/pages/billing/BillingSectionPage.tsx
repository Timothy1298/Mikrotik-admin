import { useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart3, Clock3, CreditCard, Receipt, ShieldAlert, Wallet } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableLoader } from "@/components/feedback/TableLoader";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataToolbar } from "@/components/shared/DataToolbar";
import { MetricCard } from "@/components/shared/MetricCard";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { billingTabs } from "@/config/module-tabs";
import {
  BillingActionDialog,
  BillingActivityTable,
  BillingDetailsModal,
  BillingFilters,
  BillingReportsSection,
  CreateInvoiceDialog,
  InvoicesTable,
  InvoiceDetailsModal,
  IssueRefundDialog,
  PaymentsTable,
  PaymentDetailsModal,
  RecordPaymentDialog,
  SubscriptionsTable,
  TrialAccountsTable,
} from "@/features/billing/components";
import {
  useAccountBillingOverview,
  useAddBillingFlag,
  useAddBillingNote,
  useApplyGracePeriod,
  useBillingActivity,
  useBillingRisk,
  useCreateInvoice,
  useDownloadInvoicePdf,
  useExtendTrial,
  useInvoices,
  useIssueRefund,
  useMarkBillingReviewed,
  usePayments,
  useReactivateBillingAccount,
  useRecordPayment,
  useRemoveBillingFlag,
  useRemoveGracePeriod,
  useResendInvoice,
  useSubscriptions,
  useSuspendBillingAccount,
  useTrials,
} from "@/features/billing/hooks/useBilling";
import type { BillingActivityItem, BillingFilterState, BillingSection, BillingSubscriptionRow, BillingTransaction, BillingTrialRow } from "@/features/billing/types/billing.types";
import { billingSections } from "@/features/billing/utils/billing-sections";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { formatCurrency } from "@/lib/formatters/currency";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";

const sectionIcons: Record<BillingSection, typeof CreditCard> = {
  subscriptions: CreditCard,
  trials: Clock3,
  "active-paid": Wallet,
  "overdue-risk": AlertTriangle,
  invoices: Receipt,
  payments: Wallet,
  entitlements: ShieldAlert,
  reports: BarChart3,
  activity: Activity,
  "notes-flags": ShieldAlert,
};

export function BillingSectionPage({ section }: { section: BillingSection }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser(true);
  const sectionMeta = billingSections[section];
  const [filters, setFilters] = useState<BillingFilterState>({ limit: 50, window: "30d" });
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");
  const [selectedFlag, setSelectedFlag] = useState<{ id?: string } | null>(null);

  const detailDisclosure = useDisclosure(false);
  const invoiceDisclosure = useDisclosure(false);
  const paymentDisclosure = useDisclosure(false);
  const extendDisclosure = useDisclosure(false);
  const reviewedDisclosure = useDisclosure(false);
  const suspendDisclosure = useDisclosure(false);
  const reactivateDisclosure = useDisclosure(false);
  const resendDisclosure = useDisclosure(false);
  const applyGraceDisclosure = useDisclosure(false);
  const removeGraceDisclosure = useDisclosure(false);
  const noteDisclosure = useDisclosure(false);
  const flagDisclosure = useDisclosure(false);
  const removeFlagDisclosure = useDisclosure(false);
  const recordPaymentDisclosure = useDisclosure(false);
  const createInvoiceDisclosure = useDisclosure(false);
  const issueRefundDisclosure = useDisclosure(false);

  const subscriptionsEnabled = ["subscriptions", "active-paid", "overdue-risk", "entitlements", "notes-flags"].includes(section);
  const subscriptionsQuery = useSubscriptions(filters as never, subscriptionsEnabled);
  const trialsQuery = useTrials(filters, section === "trials");
  const invoicesQuery = useInvoices(filters, section === "invoices");
  const paymentsQuery = usePayments(filters, section === "payments");
  const riskQuery = useBillingRisk();
  const activityQuery = useBillingActivity(filters, section === "activity");
  const detailQuery = useAccountBillingOverview(selectedAccountId);

  const extendMutation = useExtendTrial();
  const reviewedMutation = useMarkBillingReviewed();
  const suspendMutation = useSuspendBillingAccount();
  const reactivateMutation = useReactivateBillingAccount();
  const resendMutation = useResendInvoice();
  const applyGraceMutation = useApplyGracePeriod();
  const removeGraceMutation = useRemoveGracePeriod();
  const noteMutation = useAddBillingNote();
  const flagMutation = useAddBillingFlag();
  const removeFlagMutation = useRemoveBillingFlag();
  const recordPaymentMutation = useRecordPayment();
  const createInvoiceMutation = useCreateInvoice();
  const issueRefundMutation = useIssueRefund();
  const downloadInvoiceMutation = useDownloadInvoicePdf();

  const Icon = sectionIcons[section];
  const canRecordPayment = can(currentUser, permissions.billingRecordPayment);
  const canCreateInvoice = can(currentUser, permissions.billingCreateInvoice);
  const canIssueRefund = can(currentUser, permissions.billingIssueRefund);
  const canExport = can(currentUser, permissions.billingExport);

  const subscriptionRows = useMemo(() => {
    const items = subscriptionsQuery.data?.items || [];
    if (section === "active-paid") return items.filter((item) => item.subscriptionStatus === "active" && item.planName === "monthly");
    if (section === "overdue-risk") return items.filter((item) => item.overdue);
    if (section === "notes-flags") return items;
    return items;
  }, [section, subscriptionsQuery.data?.items]);

  const metrics = useMemo(() => {
    if (section === "subscriptions" || section === "active-paid" || section === "overdue-risk" || section === "entitlements" || section === "notes-flags") {
      return [
        { title: "Visible accounts", value: String(subscriptionRows.length), progress: Math.min(100, subscriptionRows.length) },
        { title: "Overdue", value: String(subscriptionRows.filter((item) => item.overdue).length), progress: Math.min(100, subscriptionRows.filter((item) => item.overdue).length * 8) },
        { title: "Open invoices", value: String(subscriptionRows.reduce((sum, item) => sum + item.openInvoiceCount, 0)), progress: Math.min(100, subscriptionRows.reduce((sum, item) => sum + item.openInvoiceCount, 0) * 6) },
        { title: "Recurring value", value: formatCurrency(subscriptionRows.reduce((sum, item) => sum + item.priceSummary, 0), "USD"), progress: 100 },
      ];
    }
    if (section === "trials") {
      const items = trialsQuery.data?.items || [];
      return [
        { title: "Trial accounts", value: String(items.length), progress: Math.min(100, items.length) },
        { title: "Ending soon", value: String(items.filter((item) => item.trialEndingSoon).length), progress: Math.min(100, items.filter((item) => item.trialEndingSoon).length * 12) },
        { title: "Trial subscriptions", value: String(items.reduce((sum, item) => sum + item.subscriptionsOnTrial, 0)), progress: Math.min(100, items.reduce((sum, item) => sum + item.subscriptionsOnTrial, 0) * 10) },
        { title: "Recurring risk", value: formatCurrency(items.reduce((sum, item) => sum + item.estimatedRecurringValue, 0), "USD"), progress: 100 },
      ];
    }
    if (section === "invoices") {
      const items = invoicesQuery.data?.items || [];
      return [
        { title: "Invoices", value: String(items.length), progress: Math.min(100, items.length) },
        { title: "Pending", value: String(items.filter((item) => item.status === "pending").length), progress: Math.min(100, items.filter((item) => item.status === "pending").length * 10) },
        { title: "Completed", value: String(items.filter((item) => item.status === "completed").length), progress: Math.min(100, items.filter((item) => item.status === "completed").length * 10) },
        { title: "Invoice value", value: formatCurrency(items.reduce((sum, item) => sum + item.amount, 0), "USD"), progress: 100 },
      ];
    }
    if (section === "payments") {
      const items = paymentsQuery.data?.items || [];
      return [
        { title: "Payments", value: String(items.length), progress: Math.min(100, items.length) },
        { title: "Completed", value: String(items.filter((item) => item.status === "completed").length), progress: Math.min(100, items.filter((item) => item.status === "completed").length * 10) },
        { title: "Failed", value: String(items.filter((item) => item.status === "failed").length), progress: Math.min(100, items.filter((item) => item.status === "failed").length * 10) },
        { title: "Payment volume", value: formatCurrency(items.reduce((sum, item) => sum + item.amount, 0), "USD"), progress: 100 },
      ];
    }
    if (section === "reports") {
      return [
        { title: "Revenue reports", value: "Live", progress: 100 },
        { title: "Outstanding balances", value: "Tracked", progress: 100 },
        { title: "CSV export", value: canExport ? "Enabled" : "Disabled", progress: 100 },
        { title: "Finance actions", value: can(currentUser, permissions.billingManage) ? "Enabled" : "View only", progress: 100 },
      ];
    }
    const items = activityQuery.data?.items || [];
    return [
      { title: "Billing events", value: String(items.length), progress: Math.min(100, items.length) },
      { title: "Admin actions", value: String(items.filter((item) => item.source === "admin").length), progress: Math.min(100, items.filter((item) => item.source === "admin").length * 10) },
      { title: "Payment failures", value: String(items.filter((item) => item.type === "payment_failed").length), progress: Math.min(100, items.filter((item) => item.type === "payment_failed").length * 10) },
      { title: "Overdue pressure", value: String(riskQuery.data?.overdueAccounts || 0), progress: Math.min(100, (riskQuery.data?.overdueAccounts || 0) * 8) },
    ];
  }, [activityQuery.data?.items, canExport, currentUser, invoicesQuery.data?.items, paymentsQuery.data?.items, riskQuery.data?.overdueAccounts, section, subscriptionRows, trialsQuery.data?.items]);

  const openAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    detailDisclosure.onOpen();
  };

  const selectedInvoice = (invoicesQuery.data?.items || []).find((item) => item.id === selectedInvoiceId) || null;
  const selectedPayment = (paymentsQuery.data?.items || []).find((item) => item.id === selectedPaymentId) || null;

  const onOpenSubscription = (row: BillingSubscriptionRow) => openAccount(row.account?.id || "");
  const onOpenTrial = (row: BillingTrialRow) => openAccount(row.accountId);
  const onOpenInvoice = (row: BillingTransaction) => {
    setSelectedInvoiceId(row.id);
    invoiceDisclosure.onOpen();
  };
  const onOpenPayment = (row: BillingTransaction) => {
    setSelectedPaymentId(row.id);
    paymentDisclosure.onOpen();
  };
  const onOpenActivity = (row: BillingActivityItem) => {
    const accountId = String((row.metadata as { account?: { id?: string }; targetUserId?: string } | undefined)?.account?.id || (row.metadata as { targetUserId?: string } | undefined)?.targetUserId || "");
    if (accountId) openAccount(accountId);
  };

  const renderContent = () => {
    if (section === "subscriptions" || section === "active-paid" || section === "overdue-risk" || section === "entitlements" || section === "notes-flags") {
      if (subscriptionsQuery.isPending) return <TableLoader />;
      if (subscriptionsQuery.isError) return <ErrorState title={`Unable to load ${sectionMeta.title.toLowerCase()}`} description="Retry after confirming the admin billing subscription endpoints are reachable." onAction={() => void subscriptionsQuery.refetch()} />;
      return (
        <SubscriptionsTable
          rows={subscriptionRows}
          onOpen={onOpenSubscription}
          onExtendTrial={(row) => { setSelectedAccountId(row.account?.id || ""); extendDisclosure.onOpen(); }}
          onMarkReviewed={(row) => { setSelectedAccountId(row.account?.id || ""); reviewedDisclosure.onOpen(); }}
          onSuspend={(row) => { setSelectedAccountId(row.account?.id || ""); suspendDisclosure.onOpen(); }}
          onReactivate={(row) => { setSelectedAccountId(row.account?.id || ""); reactivateDisclosure.onOpen(); }}
          onResendInvoice={(row) => { setSelectedAccountId(row.account?.id || ""); resendDisclosure.onOpen(); }}
          onApplyGrace={(row) => { setSelectedAccountId(row.account?.id || ""); applyGraceDisclosure.onOpen(); }}
          onRemoveGrace={(row) => { setSelectedAccountId(row.account?.id || ""); removeGraceDisclosure.onOpen(); }}
          onRecordPayment={canRecordPayment ? (row) => { setSelectedAccountId(row.account?.id || ""); recordPaymentDisclosure.onOpen(); } : undefined}
          onCreateInvoice={canCreateInvoice ? (row) => { setSelectedAccountId(row.account?.id || ""); createInvoiceDisclosure.onOpen(); } : undefined}
          onIssueRefund={canIssueRefund ? (row) => { setSelectedAccountId(row.account?.id || ""); issueRefundDisclosure.onOpen(); } : undefined}
          onAddNote={(row) => { setSelectedAccountId(row.account?.id || ""); noteDisclosure.onOpen(); }}
          onAddFlag={(row) => { setSelectedAccountId(row.account?.id || ""); flagDisclosure.onOpen(); }}
        />
      );
    }
    if (section === "trials") {
      if (trialsQuery.isPending) return <TableLoader />;
      if (trialsQuery.isError) return <ErrorState title="Unable to load trial accounts" description="Retry after confirming the trial listing endpoint is available." onAction={() => void trialsQuery.refetch()} />;
      return <TrialAccountsTable rows={trialsQuery.data?.items || []} onOpen={onOpenTrial} onExtendTrial={(row) => { setSelectedAccountId(row.accountId); extendDisclosure.onOpen(); }} />;
    }
    if (section === "invoices") {
      if (invoicesQuery.isPending) return <TableLoader />;
      if (invoicesQuery.isError) return <ErrorState title="Unable to load invoices" description="Retry after confirming the invoice listing endpoint is available." onAction={() => void invoicesQuery.refetch()} />;
      return <InvoicesTable rows={invoicesQuery.data?.items || []} onOpen={onOpenInvoice} onDownloadPdf={(row) => void downloadInvoiceMutation.mutateAsync(row.id)} />;
    }
    if (section === "payments") {
      if (paymentsQuery.isPending) return <TableLoader />;
      if (paymentsQuery.isError) return <ErrorState title="Unable to load payments" description="Retry after confirming the payment listing endpoint is available." onAction={() => void paymentsQuery.refetch()} />;
      return <PaymentsTable rows={paymentsQuery.data?.items || []} onOpen={onOpenPayment} />;
    }
    if (section === "reports") {
      return <BillingReportsSection />;
    }
    if (activityQuery.isPending) return <TableLoader />;
    if (activityQuery.isError) return <ErrorState title="Unable to load billing activity" description="Retry after confirming the billing activity endpoint is available." onAction={() => void activityQuery.refetch()} />;
    return <BillingActivityTable rows={activityQuery.data?.items || []} onOpen={onOpenActivity} />;
  };

  const onConfirmFlagRemoval = (reason?: string) => {
    if (!selectedAccountId || !selectedFlag?.id) return;
    removeFlagMutation.mutate([selectedAccountId, selectedFlag.id, reason] as never, { onSuccess: () => removeFlagDisclosure.onClose() });
  };

  return (
    <section className="space-y-6">
      <PageHeader title={sectionMeta.title} description={sectionMeta.description} meta="Billing operations" />
      <Tabs tabs={[...billingTabs]} value={location.pathname} onChange={navigate} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.title} title={metric.title} value={metric.value} progress={typeof metric.progress === "number" ? metric.progress : 100} />)}
      </div>
      {section !== "reports" ? <BillingFilters section={section} filters={filters} onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))} /> : null}
      <Card>
        <DataToolbar>
          <div className="flex items-center gap-3">
            <div className="icon-block-primary rounded-2xl p-2 text-slate-100"><Icon className="h-4 w-4" /></div>
            <div><p className="text-sm font-medium text-slate-100">{sectionMeta.title}</p><p className="font-mono text-xs text-slate-500">{sectionMeta.description}</p></div>
          </div>
          <RefreshButton
            loading={subscriptionsQuery.isFetching || trialsQuery.isFetching || invoicesQuery.isFetching || paymentsQuery.isFetching || activityQuery.isFetching || detailQuery.isFetching}
            onClick={() => {
              if (subscriptionsEnabled) void subscriptionsQuery.refetch();
              if (section === "trials") void trialsQuery.refetch();
              if (section === "invoices") void invoicesQuery.refetch();
              if (section === "payments") void paymentsQuery.refetch();
              if (section === "activity") void activityQuery.refetch();
              void detailQuery.refetch();
            }}
          />
        </DataToolbar>
        <div className="mt-4">{renderContent()}</div>
      </Card>

      <BillingDetailsModal
        open={detailDisclosure.open}
        detail={detailQuery.data || null}
        onClose={detailDisclosure.onClose}
        onExtendTrial={() => { detailDisclosure.onClose(); extendDisclosure.onOpen(); }}
        onSuspend={() => { detailDisclosure.onClose(); suspendDisclosure.onOpen(); }}
        onReactivate={() => { detailDisclosure.onClose(); reactivateDisclosure.onOpen(); }}
        onApplyGracePeriod={() => { detailDisclosure.onClose(); applyGraceDisclosure.onOpen(); }}
        onResendInvoice={() => { detailDisclosure.onClose(); resendDisclosure.onOpen(); }}
        onRecordPayment={canRecordPayment ? () => { detailDisclosure.onClose(); recordPaymentDisclosure.onOpen(); } : undefined}
        onCreateInvoice={canCreateInvoice ? () => { detailDisclosure.onClose(); createInvoiceDisclosure.onOpen(); } : undefined}
      />
      <InvoiceDetailsModal open={invoiceDisclosure.open} invoice={selectedInvoice} onClose={invoiceDisclosure.onClose} />
      <PaymentDetailsModal open={paymentDisclosure.open} payment={selectedPayment} onClose={paymentDisclosure.onClose} />

      <BillingActionDialog open={extendDisclosure.open} loading={extendMutation.isPending} daysInput title="Extend trial" description="Extend the trial period and capture billing context." confirmLabel="Extend trial" onClose={extendDisclosure.onClose} onConfirm={(payload) => selectedAccountId && extendMutation.mutate([selectedAccountId, payload.days || 7, payload.reason] as never, { onSuccess: () => extendDisclosure.onClose() })} />
      <BillingActionDialog open={reviewedDisclosure.open} loading={reviewedMutation.isPending} title="Mark billing reviewed" description="Record that this account billing state has been manually reviewed." confirmLabel="Mark reviewed" onClose={reviewedDisclosure.onClose} onConfirm={(payload) => selectedAccountId && reviewedMutation.mutate([selectedAccountId, payload.reason] as never, { onSuccess: () => reviewedDisclosure.onClose() })} />
      <BillingActionDialog open={suspendDisclosure.open} loading={suspendMutation.isPending} title="Suspend for billing" description="Restrict the account due to billing state and record a reason." confirmLabel="Suspend account" onClose={suspendDisclosure.onClose} onConfirm={(payload) => selectedAccountId && suspendMutation.mutate([selectedAccountId, payload.reason] as never, { onSuccess: () => suspendDisclosure.onClose() })} />
      <BillingActionDialog open={reactivateDisclosure.open} loading={reactivateMutation.isPending} title="Reactivate account" description="Restore account access after billing resolution." confirmLabel="Reactivate account" onClose={reactivateDisclosure.onClose} onConfirm={(payload) => selectedAccountId && reactivateMutation.mutate([selectedAccountId, payload.reason] as never, { onSuccess: () => reactivateDisclosure.onClose() })} />
      <BillingActionDialog open={resendDisclosure.open} loading={resendMutation.isPending} title="Resend invoice reminder" description="Send the latest billing reminder for this account." confirmLabel="Resend reminder" onClose={resendDisclosure.onClose} onConfirm={(payload) => selectedAccountId && resendMutation.mutate([selectedAccountId, payload.reason] as never, { onSuccess: () => resendDisclosure.onClose() })} />
      <BillingActionDialog open={applyGraceDisclosure.open} loading={applyGraceMutation.isPending} daysInput title="Apply grace period" description="Add a grace period to the selected account." confirmLabel="Apply grace period" onClose={applyGraceDisclosure.onClose} onConfirm={(payload) => selectedAccountId && applyGraceMutation.mutate([selectedAccountId, payload.days || 7, payload.reason] as never, { onSuccess: () => applyGraceDisclosure.onClose() })} />
      <BillingActionDialog open={removeGraceDisclosure.open} loading={removeGraceMutation.isPending} title="Remove grace period" description="Remove the grace period from the selected account." confirmLabel="Remove grace period" onClose={removeGraceDisclosure.onClose} onConfirm={(payload) => selectedAccountId && removeGraceMutation.mutate([selectedAccountId, payload.reason] as never, { onSuccess: () => removeGraceDisclosure.onClose() })} />
      <BillingActionDialog open={noteDisclosure.open} loading={noteMutation.isPending} noteBody title="Add billing note" description="Leave internal billing context for finance and support follow-up." confirmLabel="Add note" onClose={noteDisclosure.onClose} onConfirm={(payload) => selectedAccountId && noteMutation.mutate([selectedAccountId, { body: payload.body || "", category: payload.category || "billing", reason: payload.reason }] as never, { onSuccess: () => noteDisclosure.onClose() })} />
      <BillingActionDialog open={flagDisclosure.open} loading={flagMutation.isPending} flagInput title="Add billing flag" description="Apply a manual billing follow-up flag to this account." confirmLabel="Add flag" onClose={flagDisclosure.onClose} onConfirm={(payload) => selectedAccountId && flagMutation.mutate([selectedAccountId, { flag: payload.flag || "manual_review", severity: payload.severity || "medium", description: payload.description, reason: payload.reason }] as never, { onSuccess: () => flagDisclosure.onClose() })} />
      <BillingActionDialog open={removeFlagDisclosure.open} loading={removeFlagMutation.isPending} title="Remove billing flag" description="Remove the selected internal billing flag." confirmLabel="Remove flag" onClose={removeFlagDisclosure.onClose} onConfirm={(payload) => onConfirmFlagRemoval(payload.reason)} />
      <RecordPaymentDialog open={recordPaymentDisclosure.open} loading={recordPaymentMutation.isPending} accountId={selectedAccountId} accountName={detailQuery.data?.account.name || selectedAccountId} onClose={recordPaymentDisclosure.onClose} onConfirm={(payload) => recordPaymentMutation.mutate([payload] as never, { onSuccess: () => recordPaymentDisclosure.onClose() })} />
      <CreateInvoiceDialog open={createInvoiceDisclosure.open} loading={createInvoiceMutation.isPending} accountId={selectedAccountId} accountName={detailQuery.data?.account.name || selectedAccountId} onClose={createInvoiceDisclosure.onClose} onConfirm={(payload) => createInvoiceMutation.mutate([payload] as never, { onSuccess: () => createInvoiceDisclosure.onClose() })} />
      <IssueRefundDialog open={issueRefundDisclosure.open} loading={issueRefundMutation.isPending} accountId={selectedAccountId} accountName={detailQuery.data?.account.name || selectedAccountId} onClose={issueRefundDisclosure.onClose} onConfirm={(payload) => issueRefundMutation.mutate([payload] as never, { onSuccess: () => issueRefundDisclosure.onClose() })} />
    </section>
  );
}
