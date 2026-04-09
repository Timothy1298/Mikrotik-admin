import { CheckCircle2, Clock3, Gift, HandCoins, ReceiptText, Search, ShieldAlert, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableLoader } from "@/components/feedback/TableLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  useApproveReferral,
  useMarkReferralPaid,
  useOfferReferral,
  useReferralOverview,
  useReferrals,
  useRejectReferral,
} from "@/features/referrals/hooks/useReferrals";
import type { ReferralRecord } from "@/features/referrals/types/referral.types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";

const PAGE_SIZE = 20;

function toneForReview(status: ReferralRecord["reviewStatus"]) {
  if (status === "paid") return "success";
  if (status === "approved") return "info";
  if (status === "rejected") return "danger";
  return "warning";
}

function toneForPayout(status: ReferralRecord["payoutStatus"]) {
  if (status === "paid") return "success";
  if (status === "withheld") return "danger";
  if (status === "queued") return "info";
  if (status === "offered") return "warning";
  return "neutral";
}

export function ReferralsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [reviewStatus, setReviewStatus] = useState("all");
  const [payoutStatus, setPayoutStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [offerTitle, setOfferTitle] = useState("Standard referral reward");
  const [offerDescription, setOfferDescription] = useState("Referral reward issued after admin review and payout approval.");
  const [rewardAmount, setRewardAmount] = useState("10");
  const [payoutMethod, setPayoutMethod] = useState<ReferralRecord["payoutMethod"]>("account_credit");
  const [payoutReference, setPayoutReference] = useState("");
  const actionDeskRef = useRef<HTMLDivElement | null>(null);

  const overviewQuery = useReferralOverview();
  const listQuery = useReferrals({ page, limit: PAGE_SIZE, q: search, reviewStatus, payoutStatus, status: "all" });
  const approveMutation = useApproveReferral();
  const rejectMutation = useRejectReferral();
  const offerMutation = useOfferReferral();
  const markPaidMutation = useMarkReferralPaid();
  const actionPending = approveMutation.isPending || rejectMutation.isPending || offerMutation.isPending || markPaidMutation.isPending;

  const isPending = overviewQuery.isPending || listQuery.isPending;
  const isError = overviewQuery.isError || listQuery.isError;

  const items = useMemo(() => listQuery.data?.items || [], [listQuery.data?.items]);
  const selectedReferral = useMemo(() => {
    if (!selectedId) return null;
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  const clearSelectedReferral = () => {
    setSelectedId(null);
  };

  const syncSelectedReferral = (referral: ReferralRecord | null, options?: { focusActionDesk?: boolean }) => {
    if (!referral) return;

    if (selectedId && selectedId === referral.id) {
      clearSelectedReferral();
      return;
    }

    setSelectedId(referral.id);
    setNote(referral.reviewNote || referral.payoutNote || "");
    setOfferTitle(referral.offerTitle || "Standard referral reward");
    setOfferDescription(referral.offerDescription || "Referral reward issued after admin review and payout approval.");
    setRewardAmount(String(referral.rewardAmount || 10));
    setPayoutMethod(referral.payoutMethod || "account_credit");
    setPayoutReference(referral.payoutReference || "");

    if (options?.focusActionDesk && typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        actionDeskRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  useEffect(() => {
    if (!items.length) {
      setSelectedId(null);
      return;
    }

    if (!selectedId) {
      return;
    }

    const nextSelected = items.find((item) => item.id === selectedId);
    if (!nextSelected) {
      setSelectedId(null);
      return;
    }

    setNote(nextSelected.reviewNote || nextSelected.payoutNote || "");
    setOfferTitle(nextSelected.offerTitle || "Standard referral reward");
    setOfferDescription(nextSelected.offerDescription || "Referral reward issued after admin review and payout approval.");
    setRewardAmount(String(nextSelected.rewardAmount || 10));
    setPayoutMethod(nextSelected.payoutMethod || "account_credit");
    setPayoutReference(nextSelected.payoutReference || "");
  }, [items, selectedId]);

  if (isPending) return <TableLoader />;

  if (isError || !overviewQuery.data || !listQuery.data) {
    return (
      <ErrorState
        title="Unable to load admin referrals"
        description="Retry after confirming the admin referral endpoints are available for the authenticated account."
        onAction={() => {
          void overviewQuery.refetch();
          void listQuery.refetch();
        }}
      />
    );
  }

  const overview = overviewQuery.data;
  const pagination = listQuery.data.pagination;
  const totalPages = Math.max(1, pagination.pages || 1);
  const canApprove = Boolean(selectedReferral && selectedReferral.reviewStatus === "pending_review");
  const canQueuePayout = Boolean(selectedReferral && ["approved", "paid"].includes(selectedReferral.reviewStatus) && selectedReferral.payoutStatus !== "paid");
  const canMarkPaid = Boolean(selectedReferral && ["approved", "paid"].includes(selectedReferral.reviewStatus) && ["offered", "queued"].includes(selectedReferral.payoutStatus));
  const canReject = Boolean(selectedReferral && selectedReferral.reviewStatus === "pending_review");

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Growth Ops"
        title="Referral Management"
        description="Review referred signups, prepare payout offers, and complete referral rewards from one admin workspace."
        meta={`${overview.pendingReview} pending review`}
      />

      <div className="flex justify-end">
        <RefreshButton
          loading={overviewQuery.isFetching || listQuery.isFetching}
          onClick={() => {
            void overviewQuery.refetch();
            void listQuery.refetch();
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Pending review" value={String(overview.pendingReview)} description="Signups waiting for admin approval." icon={ShieldAlert} tone="warning" />
        <StatCard title="Awaiting payout" value={String(overview.awaitingPayout)} description="Approved referrals waiting to be queued or paid out." icon={Clock3} tone="info" />
        <StatCard title="Reward offered" value={formatCurrency(overview.totalRewardOffered)} description="Offer value currently exposed to the referral queue." icon={Gift} tone="neutral" />
        <StatCard title="Reward paid" value={formatCurrency(overview.totalRewardPaid)} description="Payout value already settled for completed referrals." icon={HandCoins} tone="success" />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Queues and pipeline</CardTitle>
            <CardDescription>Keep the referral queues in a dedicated row so review work, payout flow, and blocked items are easy to scan at a glance.</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-background-border bg-background-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Review queue</p>
              <p className="mt-3 text-3xl font-semibold text-text-primary">{overview.pendingReview}</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">New referrals waiting for validation, policy checks, and approval.</p>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Payout queue</p>
              <p className="mt-3 text-3xl font-semibold text-text-primary">{overview.awaitingPayout}</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Approved referrals that still need queue assignment or final payout completion.</p>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Rejected or withheld</p>
              <p className="mt-3 text-3xl font-semibold text-text-primary">{overview.rejected}</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Referrals paused because they failed checks or need manual follow-up.</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-background-border bg-background-elevated p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Review queue snapshot</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-muted">Needs admin decision</p>
                </div>
                <Badge tone="warning">{overview.reviewQueue.length} open</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {overview.reviewQueue.length ? overview.reviewQueue.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full rounded-2xl border border-background-border bg-background-panel px-4 py-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
                    onClick={() => syncSelectedReferral(item, { focusActionDesk: true })}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-text-primary">{item.referredUser?.name || "Referral record"}</p>
                        <p className="mt-1 text-xs text-text-secondary">{item.referredUser?.email || "No email"}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-muted">Referred by {item.referrer?.name || "Unknown referrer"}</p>
                      </div>
                      <Badge tone="warning">{item.reviewStatus}</Badge>
                    </div>
                  </button>
                )) : <p className="text-sm text-text-muted">No referrals are waiting for review right now.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-background-border bg-background-elevated p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Payout queue snapshot</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-muted">Ready for settlement</p>
                </div>
                <Badge tone="info">{overview.payoutQueue.length} open</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {overview.payoutQueue.length ? overview.payoutQueue.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full rounded-2xl border border-background-border bg-background-panel px-4 py-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
                    onClick={() => syncSelectedReferral(item, { focusActionDesk: true })}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-text-primary">{item.referredUser?.name || "Referral record"}</p>
                        <p className="mt-1 text-xs text-text-secondary">{item.offerTitle || "Pending payout offer"}</p>
                        <p className="mt-2 text-sm text-text-primary">{formatCurrency(item.rewardAmount)}</p>
                      </div>
                      <Badge tone="info">{item.payoutStatus}</Badge>
                    </div>
                  </button>
                )) : <p className="text-sm text-text-muted">No referrals are waiting in the payout queue right now.</p>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-background-border bg-background-elevated p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">Program pipeline</p>
                <p className="mt-1 text-sm text-text-secondary">A compact map of how referral requests move from signup through approval to payout.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Top offer</p>
                  <p className="mt-2 font-medium text-text-primary">{overview.activeOffers[0]?.title || "No active offer yet"}</p>
                </div>
                <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Live offers</p>
                  <p className="mt-2 font-medium text-text-primary">{overview.activeOffers.length}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Stage 01</p>
                <p className="mt-2 font-medium text-text-primary">Incoming referral request</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">Every referred signup lands here first and waits for admin review.</p>
              </div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Stage 02</p>
                <p className="mt-2 font-medium text-text-primary">Offer and payout planning</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">Approved referrals get a reward amount, payout method, and an optional queue or transfer reference before settlement.</p>
              </div>
              <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Stage 03</p>
                <p className="mt-2 font-medium text-text-primary">Settlement or hold</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">The referral is either marked paid, kept queued, or rejected with a traceable note.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Referral requests</CardTitle>
              <CardDescription>All referral records live in their own full row here, with filters and a cleaner table for selecting the item you want to work on.</CardDescription>
            </div>
          </CardHeader>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_0.8fr_0.8fr]">
            <Input
              label="Search"
              placeholder="Search referrer, referred user, code, offer, or note"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Select
              label="Review status"
              value={reviewStatus}
              onChange={(event) => {
                setPage(1);
                setReviewStatus(event.target.value);
              }}
              options={[
                { label: "All reviews", value: "all" },
                { label: "Pending review", value: "pending_review" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
                { label: "Paid", value: "paid" },
              ]}
            />
            <Select
              label="Payout status"
              value={payoutStatus}
              onChange={(event) => {
                setPage(1);
                setPayoutStatus(event.target.value);
              }}
              options={[
                { label: "All payouts", value: "all" },
                { label: "Not ready", value: "not_ready" },
                { label: "Offered", value: "offered" },
                { label: "Queued", value: "queued" },
                { label: "Paid", value: "paid" },
                { label: "Withheld", value: "withheld" },
              ]}
            />
          </div>

          {items.length ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-background-border bg-background-elevated">
              <div className="hidden gap-3 border-b border-background-border bg-background-panel px-4 py-4 text-xs uppercase tracking-[0.18em] text-text-muted md:grid md:grid-cols-[minmax(0,1.7fr)_0.85fr_0.85fr_1fr_0.9fr]">
                <div>Referral request</div>
                <div>Review</div>
                <div>Payout</div>
                <div>Offer</div>
                <div>Created</div>
              </div>
              <div className="divide-y divide-background-border/70">
                {items.map((referral) => (
                  <button
                    key={referral.id}
                    type="button"
                    className={`grid w-full gap-4 px-4 py-4 text-left transition-colors hover:bg-primary/5 md:grid-cols-[minmax(0,1.7fr)_0.85fr_0.85fr_1fr_0.9fr] md:gap-3 ${selectedReferral?.id === referral.id ? "bg-primary/8" : "bg-transparent"}`}
                    onClick={() => syncSelectedReferral(referral, { focusActionDesk: true })}
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted md:hidden">Referral request</p>
                      <p className="font-medium text-text-primary">{referral.referredUser?.name || "Referral record"}</p>
                      <p className="mt-1 text-xs text-text-secondary">{referral.referredUser?.email || "No email"}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-muted">Via {referral.referrer?.name || "Unknown referrer"}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:block md:self-center">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted md:hidden">Review</p>
                      <Badge tone={toneForReview(referral.reviewStatus) as "success" | "warning" | "danger" | "info"}>{referral.reviewStatus}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:block md:self-center">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted md:hidden">Payout</p>
                      <Badge tone={toneForPayout(referral.payoutStatus) as "success" | "warning" | "danger" | "info" | "neutral"}>{referral.payoutStatus}</Badge>
                    </div>
                    <div className="md:self-center">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted md:hidden">Offer</p>
                      <p className="text-sm text-text-primary">{referral.offerTitle}</p>
                      <p className="mt-1 text-xs text-text-secondary">{formatCurrency(referral.rewardAmount)}</p>
                    </div>
                    <div className="md:self-center">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted md:hidden">Created</p>
                      <p className="text-sm text-text-secondary">{formatDateTime(referral.createdAt)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState icon={Gift} title="No referrals match these filters" description="Try widening the search or clearing the queue filters." />
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-background-border pt-4">
            <p className="text-sm text-text-secondary">
              Showing page {pagination.page} of {totalPages} with {pagination.total} total referral records.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                Previous
              </Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                Next
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Referral action desk</CardTitle>
              <CardDescription>Review the selected referral, tailor the reward, and complete the next action from a separate full-width workspace.</CardDescription>
            </div>
          </CardHeader>
          {selectedReferral ? (
            <div ref={actionDeskRef} className="space-y-5">
              <div className="rounded-2xl border border-background-border bg-background-elevated p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-text-primary">{selectedReferral.referredUser?.name || "Referred account"}</p>
                    <p className="mt-1 text-sm text-text-secondary">{selectedReferral.referredUser?.email || "No email"}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-text-muted">Referred by {selectedReferral.referrer?.name || "Unknown referrer"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={toneForReview(selectedReferral.reviewStatus) as "success" | "warning" | "danger" | "info"}>{selectedReferral.reviewStatus}</Badge>
                    <Badge tone={toneForPayout(selectedReferral.payoutStatus) as "success" | "warning" | "danger" | "info" | "neutral"}>{selectedReferral.payoutStatus}</Badge>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-background-border bg-background-panel px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Offer</p>
                    <p className="mt-2 font-medium text-text-primary">{selectedReferral.offerTitle}</p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{selectedReferral.offerDescription}</p>
                  </div>
                  <div className="rounded-xl border border-background-border bg-background-panel px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Payout</p>
                    <p className="mt-2 font-medium text-text-primary">{formatCurrency(selectedReferral.rewardAmount)}</p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{selectedReferral.payoutMethod} {selectedReferral.payoutReference ? `• ${selectedReferral.payoutReference}` : ""}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Input label="Offer title" value={offerTitle} onChange={(event) => setOfferTitle(event.target.value)} />
                <Input label="Reward amount" type="number" min="0" step="0.01" value={rewardAmount} onChange={(event) => setRewardAmount(event.target.value)} />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Select
                  label="Payout method"
                  value={payoutMethod}
                  onChange={(event) => setPayoutMethod(event.target.value as ReferralRecord["payoutMethod"])}
                  options={[
                    { label: "Account credit", value: "account_credit" },
                    { label: "M-Pesa", value: "mpesa" },
                    { label: "Bank transfer", value: "bank_transfer" },
                    { label: "Cash", value: "cash" },
                    { label: "Voucher", value: "voucher" },
                    { label: "Manual review", value: "manual_review" },
                  ]}
                />
                <Input label="Payout reference" value={payoutReference} onChange={(event) => setPayoutReference(event.target.value)} placeholder="Optional transaction or queue reference" />
              </div>
              <Textarea label="Offer / review note" value={offerDescription} onChange={(event) => setOfferDescription(event.target.value)} rows={4} />
              <Textarea label="Internal note" value={note} onChange={(event) => setNote(event.target.value)} rows={4} />

              <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Next actions</p>
                    <p className="mt-1 text-sm text-text-secondary">Follow the payout flow from left to right: approve, queue if needed, then pay out.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canApprove ? <Badge tone="warning">Ready to approve</Badge> : null}
                    {canQueuePayout ? <Badge tone="info">Ready to queue</Badge> : null}
                    {canMarkPaid ? <Badge tone="success">Ready to pay</Badge> : null}
                    {canReject ? <Badge tone="danger">Can reject</Badge> : null}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Button
                    size="lg"
                    className="justify-center"
                    isLoading={approveMutation.isPending}
                    disabled={!canApprove || actionPending}
                    onClick={() => {
                      void approveMutation.mutate({
                        id: selectedReferral.id,
                        payload: {
                          rewardAmount: Number(rewardAmount || 0),
                          offerTitle,
                          offerDescription,
                          payoutMethod,
                          note,
                        },
                      });
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve offer
                  </Button>
                  <Button
                    size="lg"
                    className="justify-center"
                    variant="secondary"
                    isLoading={offerMutation.isPending}
                    disabled={!canQueuePayout || actionPending}
                    onClick={() => {
                      void offerMutation.mutate({
                        id: selectedReferral.id,
                        payload: {
                          rewardAmount: Number(rewardAmount || 0),
                          offerTitle,
                          offerDescription,
                          payoutMethod,
                          note,
                          queueForPayment: true,
                        },
                      });
                    }}
                  >
                    <ReceiptText className="mr-2 h-4 w-4" />
                    Queue for payout
                  </Button>
                  <Button
                    size="lg"
                    className="justify-center"
                    variant="secondary"
                    isLoading={markPaidMutation.isPending}
                    disabled={!canMarkPaid || actionPending}
                    onClick={() => {
                      void markPaidMutation.mutate({
                        id: selectedReferral.id,
                        payload: {
                          payoutMethod,
                          payoutReference,
                          note,
                        },
                      });
                    }}
                  >
                    <HandCoins className="mr-2 h-4 w-4" />
                    Pay now
                  </Button>
                  <Button
                    size="lg"
                    className="justify-center"
                    variant="danger"
                    isLoading={rejectMutation.isPending}
                    disabled={!canReject || actionPending}
                    onClick={() => {
                      void rejectMutation.mutate({
                        id: selectedReferral.id,
                        payload: {
                          note,
                          payoutNote: note,
                        },
                      });
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-background-border bg-background-elevated p-4 text-xs leading-6 text-text-muted">
                {selectedReferral.reviewStatus === "pending_review" ? "Pending referrals can be approved or rejected from this desk." : null}
                {selectedReferral.reviewStatus === "approved" && selectedReferral.payoutStatus !== "paid" ? " Approved referrals can be queued for payout or paid immediately, depending on your workflow." : null}
                {selectedReferral.payoutStatus === "paid" ? " This referral has already been paid and is now read-only from the payout desk." : null}
              </div>
            </div>
          ) : (
            <EmptyState icon={Gift} title="No referral selected" description="Choose a referral record from the requests table to review or settle it." />
          )}
        </Card>
      </div>
    </section>
  );
}
