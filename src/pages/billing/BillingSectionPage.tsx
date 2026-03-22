import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart3, Clock3, CreditCard, Receipt, ShieldAlert, Wallet } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableLoader } from "@/components/feedback/TableLoader";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataToolbar } from "@/components/shared/DataToolbar";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { billingTabs } from "@/config/module-tabs";
import { appRoutes } from "@/config/routes";
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
  MpesaPaymentWidget,
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
  useCreateInvoice,
  useDownloadInvoicePdf,
  useEnforceBillingSubscriptions,
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
  useSuspendSubscription,
  useSubscriptions,
  useSuspendBillingAccount,
  useTrials,
} from "@/features/billing/hooks/useBilling";
import type { BillingActivityItem, BillingFilterState, BillingSection, BillingSubscriptionRow, BillingTransaction, BillingTrialRow } from "@/features/billing/types/billing.types";
import { billingSections } from "@/features/billing/utils/billing-sections";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
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
  const [selectedFlag] = useState<{ id?: string } | null>(null);

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
  const mpesaDisclosure = useDisclosure(false);

  const subscriptionsEnabled = ["subscriptions", "active-paid", "overdue-risk", "entitlements", "notes-flags"].includes(section);
  const subscriptionsQuery = useSubscriptions(filters as never, subscriptionsEnabled);
  const trialsQuery = useTrials(filters, section === "trials");
  const invoicesQuery = useInvoices(filters, section === "invoices");
  const paymentsQuery = usePayments(filters, section === "payments");
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
  const enforceBillingMutation = useEnforceBillingSubscriptions();
  const suspendSubscriptionMutation = useSuspendSubscription();

  const Icon = sectionIcons[section];
  const canRecordPayment = can(currentUser, permissions.billingRecordPayment);
  const canCreateInvoice = can(currentUser, permissions.billingCreateInvoice);
  const canIssueRefund = can(currentUser, permissions.billingIssueRefund);
  useEffect(() => {
    setFilters({ limit: 50, window: "30d" });
  }, [section]);

  const subscriptionRows = useMemo(() => {
    const items = subscriptionsQuery.data?.items || [];
    if (section === "active-paid") return items.filter((item) => item.subscriptionStatus === "active" && item.planName === "monthly");
    if (section === "overdue-risk") return items.filter((item) => item.overdue);
    if (section === "notes-flags") return items;
    return items;
  }, [section, subscriptionsQuery.data?.items]);

  const openAccount = (accountId: string) => {
    if (!accountId) return;
    setSelectedAccountId(accountId);
    navigate(appRoutes.userDetail(accountId));
  };

  const selectedInvoice = (invoicesQuery.data?.items || []).find((item) => item.id === selectedInvoiceId) || null;
  const selectedPayment = (paymentsQuery.data?.items || []).find((item) => item.id === selectedPaymentId) || null;
  const selectedSubscriptionId = detailQuery.data?.subscription?.id
    || subscriptionRows.find((item) => item.account?.id === selectedAccountId)?.subscriptionId
    || "";
  const selectedSubscriptionAmount = detailQuery.data?.subscription?.pricePerMonth
    || subscriptionRows.find((item) => item.account?.id === selectedAccountId)?.priceSummary
    || 0;

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
      {section !== "reports" ? <BillingFilters section={section} filters={filters} onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))} /> : null}
      <Card>
        <DataToolbar>
          <div className="flex items-center gap-3">
            <div className="icon-block-primary rounded-2xl p-2 text-text-primary"><Icon className="h-4 w-4" /></div>
            <div><p className="text-sm font-medium text-text-primary">{sectionMeta.title}</p><p className="font-mono text-xs text-text-muted">{sectionMeta.description}</p></div>
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
        {(section === "subscriptions" || section === "overdue-risk" || section === "active-paid") ? (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-primary">
            <div className="min-w-0 flex-1">
              <p className="font-medium">Collections & enforcement</p>
              <p className="mt-1 text-xs text-text-muted">Run billing enforcement immediately and recover suspended subscriptions with M-Pesa from the account detail modal.</p>
            </div>
            <Button variant="outline" isLoading={enforceBillingMutation.isPending} onClick={() => enforceBillingMutation.mutate([undefined] as never)}>
              Run enforcement
            </Button>
          </div>
        ) : null}
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
        onPayNow={() => { detailDisclosure.onClose(); mpesaDisclosure.onOpen(); }}
        onRunEnforcement={() => enforceBillingMutation.mutate([undefined] as never)}
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
      <Modal open={mpesaDisclosure.open} title="Collect payment via M-Pesa" description={detailQuery.data?.account.email || "Subscription recovery"} onClose={mpesaDisclosure.onClose} maxWidthClass="max-w-[min(96vw,36rem)]">
        <MpesaPaymentWidget
          subscriptionId={selectedSubscriptionId}
          amount={selectedSubscriptionAmount}
          onCancel={mpesaDisclosure.onClose}
          onSuccess={() => {
            mpesaDisclosure.onClose();
            void subscriptionsQuery.refetch();
            void detailQuery.refetch();
            void paymentsQuery.refetch();
          }}
        />
        {selectedSubscriptionId ? (
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => suspendSubscriptionMutation.mutate([selectedSubscriptionId, "Manual collection hold"] as never)} isLoading={suspendSubscriptionMutation.isPending}>
              Suspend only
            </Button>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
