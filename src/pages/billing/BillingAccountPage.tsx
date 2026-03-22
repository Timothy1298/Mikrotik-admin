import { ShieldAlert, Smartphone } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  BillingActionDialog,
  CreateInvoiceDialog,
  InvoiceStatusBadge,
  IssueRefundDialog,
  MpesaPaymentWidget,
  PaymentStatusBadge,
  RecordPaymentDialog,
  SubscriptionStatusBadge,
} from "@/features/billing/components";
import {
  useAccountBillingOverview,
  useAddBillingFlag,
  useAddBillingNote,
  useApplyGracePeriod,
  useCreateInvoice,
  useEnforceBillingSubscriptions,
  useExtendTrial,
  useIssueRefund,
  useMarkBillingReviewed,
  useRecordPayment,
  useReactivateBillingAccount,
  useRemoveBillingFlag,
  useRemoveGracePeriod,
  useResendInvoice,
  useSuspendBillingAccount,
  useSuspendSubscription,
} from "@/features/billing/hooks/useBilling";
import type { BillingFlag } from "@/features/billing/types/billing.types";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";
import { appRoutes } from "@/config/routes";

function SummaryMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <div className="space-y-3 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{label}</p>
        <p className="text-3xl font-semibold text-text-primary">{value}</p>
        <p className="text-sm text-text-secondary">{hint}</p>
      </div>
    </Card>
  );
}

function FlagList({ flags, onRemove }: { flags: BillingFlag[]; onRemove: (flag: BillingFlag) => void }) {
  if (!flags.length) {
    return <p className="text-sm text-text-muted">No active billing flags.</p>;
  }

  return (
    <div className="space-y-3">
      {flags.map((flag, index) => (
        <div key={`${flag.id || flag.flag}-${index}`} className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="warning">{flag.flag}</Badge>
                <Badge tone="neutral">{flag.severity}</Badge>
              </div>
              <p className="text-sm text-text-primary">{flag.description || "No flag description provided."}</p>
              <p className="text-xs text-text-muted">{flag.createdBy} • {formatDateTime(flag.createdAt)}</p>
            </div>
            {flag.id ? <Button variant="ghost" onClick={() => onRemove(flag)}>Remove</Button> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BillingAccountPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [selectedFlag, setSelectedFlag] = useState<BillingFlag | null>(null);

  const reviewedDisclosure = useDisclosure(false);
  const suspendDisclosure = useDisclosure(false);
  const reactivateDisclosure = useDisclosure(false);
  const extendDisclosure = useDisclosure(false);
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

  const accountQuery = useAccountBillingOverview(id);
  const reviewedMutation = useMarkBillingReviewed();
  const suspendMutation = useSuspendBillingAccount();
  const reactivateMutation = useReactivateBillingAccount();
  const extendMutation = useExtendTrial();
  const resendMutation = useResendInvoice();
  const applyGraceMutation = useApplyGracePeriod();
  const removeGraceMutation = useRemoveGracePeriod();
  const noteMutation = useAddBillingNote();
  const flagMutation = useAddBillingFlag();
  const removeFlagMutation = useRemoveBillingFlag();
  const recordPaymentMutation = useRecordPayment();
  const createInvoiceMutation = useCreateInvoice();
  const issueRefundMutation = useIssueRefund();
  const enforceBillingMutation = useEnforceBillingSubscriptions();
  const suspendSubscriptionMutation = useSuspendSubscription();

  if (accountQuery.isPending) return <PageLoader />;
  if (accountQuery.isError || !accountQuery.data) {
    return <ErrorState title="Unable to load billing workspace" description="The billing account workspace could not be loaded. Retry after confirming the billing account API is available." onAction={() => void accountQuery.refetch()} />;
  }

  const detail = accountQuery.data;
  const paymentActionVisible = ["past_due", "expired", "suspended"].includes(detail.overview.subscriptionStatus) || detail.overview.openInvoices > 0;

  const selectedSubscriptionId = detail.subscription?.id || "";
  const selectedSubscriptionAmount = detail.subscription?.pricePerMonth || detail.overview.estimatedRecurringValue || 0;

  return (
    <section className="space-y-6">
      <PageHeader title={detail.account.name} description="Route-driven billing workspace for collections, subscriptions, entitlements, invoices, and follow-up actions." meta={detail.account.email} />

      <Card className="space-y-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-text-primary">{detail.account.name}</h2>
              <SubscriptionStatusBadge status={detail.overview.subscriptionStatus} />
              <Badge tone={detail.account.accountStatus === "suspended" ? "danger" : "success"}>{detail.account.accountStatus}</Badge>
              <Badge tone="info">{detail.entitlements.supportTier}</Badge>
            </div>
            <p className="text-sm text-text-secondary">{detail.account.email} • {detail.account.currency} account • Billable routers {detail.entitlements.billableRouters}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Billing tools</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={reviewedDisclosure.onOpen}>Mark reviewed</Button>
              {detail.account.accountStatus !== "suspended" ? <Button variant="danger" onClick={suspendDisclosure.onOpen}>Suspend account</Button> : null}
              {detail.account.accountStatus === "suspended" ? <Button variant="outline" onClick={reactivateDisclosure.onOpen}>Reactivate</Button> : null}
              {!detail.overview.gracePeriodActive ? <Button variant="outline" onClick={applyGraceDisclosure.onOpen}>Apply grace</Button> : null}
              {detail.overview.gracePeriodActive ? <Button variant="outline" onClick={removeGraceDisclosure.onOpen}>Remove grace</Button> : null}
              {detail.overview.subscriptionStatus === "trial" ? <Button variant="outline" onClick={extendDisclosure.onOpen}>Extend trial</Button> : null}
              {detail.overview.openInvoices > 0 ? <Button variant="outline" onClick={resendDisclosure.onOpen}>Resend invoice</Button> : null}
              {paymentActionVisible ? <Button leftIcon={<Smartphone className="h-4 w-4" />} onClick={mpesaDisclosure.onOpen}>Pay now</Button> : null}
              <Button variant="outline" leftIcon={<ShieldAlert className="h-4 w-4" />} onClick={() => enforceBillingMutation.mutate([undefined] as never)} isLoading={enforceBillingMutation.isPending}>Run enforcement</Button>
              <Button variant="outline" onClick={recordPaymentDisclosure.onOpen}>Record payment</Button>
              <Button variant="outline" onClick={createInvoiceDisclosure.onOpen}>Create invoice</Button>
              <Button variant="outline" onClick={issueRefundDisclosure.onOpen}>Issue refund</Button>
              <Button onClick={noteDisclosure.onOpen}>Add note</Button>
              <Button variant="outline" onClick={flagDisclosure.onOpen}>Add flag</Button>
              <Button variant="ghost" onClick={() => navigate(appRoutes.billingSubscriptions)}>Back to workspace</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-4">
        <SummaryMetric label="Recurring value" value={formatCurrency(detail.overview.estimatedRecurringValue, detail.account.currency || "USD")} hint={`Plan ${detail.overview.currentPlan}`} />
        <SummaryMetric label="Open invoices" value={String(detail.overview.openInvoices)} hint={`Failed payments ${detail.overview.failedPayments}`} />
        <SummaryMetric label="Billable routers" value={String(detail.routers.total)} hint={`Entitled ${detail.entitlements.billableRouters}`} />
        <SummaryMetric label="Next billing" value={detail.overview.nextBillingDate ? formatDateTime(detail.overview.nextBillingDate) : "Not scheduled"} hint={detail.overview.gracePeriodActive ? "Grace period active" : "No grace period"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="space-y-4 p-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Billing summary</h3>
              <p className="text-sm text-text-secondary">Current plan, cycle, risk, and review state.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Plan</p><p className="mt-2 text-sm text-text-primary">{detail.overview.currentPlan}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Billing cycle</p><p className="mt-2 text-sm text-text-primary">{detail.overview.billingCycle}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Trial end</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(detail.overview.trialEnd)}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Last payment</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(detail.subscription?.lastPaymentDate)}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Suspended at</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(detail.account.billingSuspendedAt)}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Reviewed at</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(detail.account.billingReviewedAt)}</p></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4 p-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Entitlements</h3>
              <p className="text-sm text-text-secondary">Service access derived from billing state.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Router management</p><p className="mt-2 text-sm text-text-primary">{detail.entitlements.routerManagementEnabled ? "Enabled" : "Disabled"}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Monitoring</p><p className="mt-2 text-sm text-text-primary">{detail.entitlements.monitoringEnabled ? "Enabled" : "Disabled"}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Analytics access</p><p className="mt-2 text-sm text-text-primary">{detail.entitlements.analyticsAccessEnabled ? "Enabled" : "Disabled"}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Billing hold</p><p className="mt-2 text-sm text-text-primary">{detail.entitlements.billingHold ? "Yes" : "No"}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Grace ends</p><p className="mt-2 text-sm text-text-primary">{formatDateTime(detail.entitlements.gracePeriodEndsAt)}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Operational state</p><p className="mt-2 text-sm text-text-primary">{detail.entitlements.accountOperationalState}</p></div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Collections & automation</h3>
              <p className="text-sm text-text-secondary">Recover overdue subscriptions and track the current enforcement posture.</p>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-3 text-text-secondary">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-background-border bg-background-panel p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-text-primary">Subscription state</span>
                <SubscriptionStatusBadge status={detail.overview.subscriptionStatus} />
              </div>
              <p className="mt-3 text-sm text-text-secondary">Suspended for billing: {detail.entitlements.suspendedForBilling ? "Yes" : "No"}</p>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-text-primary">Automation</span>
                <span className="text-sm text-text-primary">{detail.entitlements.suspendedForBilling ? "Restricted" : "Watching"}</span>
              </div>
              <p className="mt-3 text-sm text-text-secondary">Use manual enforcement when you need an immediate collections pass.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4 p-5">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Billable routers</h3>
            <p className="text-sm text-text-secondary">Routers counted in this account billing state.</p>
          </div>
          <div className="space-y-3">
            {detail.routers.items.length ? detail.routers.items.map((item) => (
              <div key={item.router.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-text-primary">{item.router.name}</p>
                    <p className="text-sm text-text-secondary">{item.reason} • {item.router.status}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={item.countedTowardBilling ? "success" : "neutral"}>{item.countedTowardBilling ? "Billable" : "Excluded"}</Badge>
                    {item.subscription ? <Badge tone="info">{item.subscription.planType}</Badge> : null}
                  </div>
                </div>
              </div>
            )) : <p className="text-sm text-text-muted">No routers are linked to this billing account.</p>}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="space-y-4 p-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Recent invoices</h3>
              <p className="text-sm text-text-secondary">Latest invoice records tied to this account.</p>
            </div>
            <div className="space-y-3">
              {detail.invoices.length ? detail.invoices.map((invoice) => (
                <div key={invoice.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-text-secondary">{invoice.transactionId}</span>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm text-text-primary">{formatCurrency(invoice.amount, invoice.currency || detail.account.currency || "USD")}</span>
                    <span className="text-xs text-text-muted">{formatDateTime(invoice.createdAt)}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-text-muted">No invoices recorded.</p>}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4 p-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Recent payments</h3>
              <p className="text-sm text-text-secondary">Settled and failed payment records for this account.</p>
            </div>
            <div className="space-y-3">
              {detail.payments.length ? detail.payments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-text-secondary">{payment.transactionId}</span>
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm text-text-primary">{formatCurrency(payment.amount, payment.currency || detail.account.currency || "USD")}</span>
                    <span className="text-xs text-text-muted">{formatDateTime(payment.createdAt)}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-text-muted">No payments recorded.</p>}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="space-y-4 p-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Recent billing activity</h3>
              <p className="text-sm text-text-secondary">Operational timeline for this account.</p>
            </div>
            <div className="space-y-3">
              {detail.recentEvents.length ? detail.recentEvents.map((event) => (
                <div key={event.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-text-primary">{event.summary}</p>
                    <span className="font-mono text-xs text-text-muted">{formatDateTime(event.timestamp)}</span>
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">{event.type} • {event.source}{event.reason ? ` • ${event.reason}` : ""}</p>
                </div>
              )) : <p className="text-sm text-text-muted">No recent billing events.</p>}
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="space-y-4 p-5">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Notes</h3>
                <p className="text-sm text-text-secondary">Internal billing follow-up context.</p>
              </div>
              <div className="space-y-3">
                {detail.notes.length ? detail.notes.map((note, index) => (
                  <div key={`${note.id || note.createdAt}-${index}`} className="rounded-2xl border border-background-border bg-background-panel p-4">
                    <p className="text-sm text-text-primary">{note.body}</p>
                    <p className="mt-2 text-xs text-text-muted">{note.author} • {note.category} • {formatDateTime(note.createdAt)}</p>
                  </div>
                )) : <p className="text-sm text-text-muted">No billing notes recorded.</p>}
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4 p-5">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Flags</h3>
                <p className="text-sm text-text-secondary">Manual billing review markers and follow-up controls.</p>
              </div>
              <FlagList flags={detail.flags} onRemove={(flag) => { setSelectedFlag(flag); removeFlagDisclosure.onOpen(); }} />
            </div>
          </Card>
        </div>
      </div>

      <BillingActionDialog open={reviewedDisclosure.open} loading={reviewedMutation.isPending} title="Mark billing reviewed" description="Record that this account billing state has been manually reviewed." confirmLabel="Mark reviewed" onClose={reviewedDisclosure.onClose} onConfirm={(payload) => reviewedMutation.mutate([detail.account.id, payload.reason] as never, { onSuccess: () => reviewedDisclosure.onClose() })} />
      <BillingActionDialog open={suspendDisclosure.open} loading={suspendMutation.isPending} title="Suspend for billing" description="Restrict the account due to billing state and record a reason." confirmLabel="Suspend account" onClose={suspendDisclosure.onClose} onConfirm={(payload) => suspendMutation.mutate([detail.account.id, payload.reason] as never, { onSuccess: () => suspendDisclosure.onClose() })} />
      <BillingActionDialog open={reactivateDisclosure.open} loading={reactivateMutation.isPending} title="Reactivate account" description="Restore account access after billing resolution." confirmLabel="Reactivate account" onClose={reactivateDisclosure.onClose} onConfirm={(payload) => reactivateMutation.mutate([detail.account.id, payload.reason] as never, { onSuccess: () => reactivateDisclosure.onClose() })} />
      <BillingActionDialog open={extendDisclosure.open} loading={extendMutation.isPending} daysInput title="Extend trial" description="Extend the trial period and capture billing context." confirmLabel="Extend trial" onClose={extendDisclosure.onClose} onConfirm={(payload) => extendMutation.mutate([detail.account.id, payload.days || 7, payload.reason] as never, { onSuccess: () => extendDisclosure.onClose() })} />
      <BillingActionDialog open={resendDisclosure.open} loading={resendMutation.isPending} title="Resend invoice reminder" description="Send the latest billing reminder for this account." confirmLabel="Resend reminder" onClose={resendDisclosure.onClose} onConfirm={(payload) => resendMutation.mutate([detail.account.id, payload.reason] as never, { onSuccess: () => resendDisclosure.onClose() })} />
      <BillingActionDialog open={applyGraceDisclosure.open} loading={applyGraceMutation.isPending} daysInput title="Apply grace period" description="Add a grace period to the selected account." confirmLabel="Apply grace period" onClose={applyGraceDisclosure.onClose} onConfirm={(payload) => applyGraceMutation.mutate([detail.account.id, payload.days || 7, payload.reason] as never, { onSuccess: () => applyGraceDisclosure.onClose() })} />
      <BillingActionDialog open={removeGraceDisclosure.open} loading={removeGraceMutation.isPending} title="Remove grace period" description="Remove the grace period from the selected account." confirmLabel="Remove grace period" onClose={removeGraceDisclosure.onClose} onConfirm={(payload) => removeGraceMutation.mutate([detail.account.id, payload.reason] as never, { onSuccess: () => removeGraceDisclosure.onClose() })} />
      <BillingActionDialog open={noteDisclosure.open} loading={noteMutation.isPending} noteBody title="Add billing note" description="Leave internal billing context for finance and support follow-up." confirmLabel="Add note" onClose={noteDisclosure.onClose} onConfirm={(payload) => noteMutation.mutate([detail.account.id, { body: payload.body || "", category: payload.category || "billing", reason: payload.reason }] as never, { onSuccess: () => noteDisclosure.onClose() })} />
      <BillingActionDialog open={flagDisclosure.open} loading={flagMutation.isPending} flagInput title="Add billing flag" description="Apply a manual billing follow-up flag to this account." confirmLabel="Add flag" onClose={flagDisclosure.onClose} onConfirm={(payload) => flagMutation.mutate([detail.account.id, { flag: payload.flag || "manual_review", severity: payload.severity || "medium", description: payload.description, reason: payload.reason }] as never, { onSuccess: () => flagDisclosure.onClose() })} />
      <BillingActionDialog open={removeFlagDisclosure.open} loading={removeFlagMutation.isPending} title="Remove billing flag" description="Remove the selected internal billing flag." confirmLabel="Remove flag" onClose={removeFlagDisclosure.onClose} onConfirm={(payload) => {
        if (!selectedFlag?.id) return;
        removeFlagMutation.mutate([detail.account.id, selectedFlag.id, payload.reason] as never, { onSuccess: () => removeFlagDisclosure.onClose() });
      }} />
      <RecordPaymentDialog open={recordPaymentDisclosure.open} loading={recordPaymentMutation.isPending} accountId={detail.account.id} accountName={detail.account.name} onClose={recordPaymentDisclosure.onClose} onConfirm={(payload) => recordPaymentMutation.mutate([payload] as never, { onSuccess: () => recordPaymentDisclosure.onClose() })} />
      <CreateInvoiceDialog open={createInvoiceDisclosure.open} loading={createInvoiceMutation.isPending} accountId={detail.account.id} accountName={detail.account.name} onClose={createInvoiceDisclosure.onClose} onConfirm={(payload) => createInvoiceMutation.mutate([payload] as never, { onSuccess: () => createInvoiceDisclosure.onClose() })} />
      <IssueRefundDialog open={issueRefundDisclosure.open} loading={issueRefundMutation.isPending} accountId={detail.account.id} accountName={detail.account.name} onClose={issueRefundDisclosure.onClose} onConfirm={(payload) => issueRefundMutation.mutate([payload] as never, { onSuccess: () => issueRefundDisclosure.onClose() })} />
      <Modal open={mpesaDisclosure.open} title="Collect payment via M-Pesa" description={detail.account.email || "Subscription recovery"} onClose={mpesaDisclosure.onClose} maxWidthClass="max-w-[min(96vw,36rem)]">
        <MpesaPaymentWidget
          subscriptionId={selectedSubscriptionId}
          amount={selectedSubscriptionAmount}
          onCancel={mpesaDisclosure.onClose}
          onSuccess={() => {
            mpesaDisclosure.onClose();
            void accountQuery.refetch();
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
