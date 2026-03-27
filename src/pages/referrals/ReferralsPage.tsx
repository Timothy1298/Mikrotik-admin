import { CheckCircle2, Clock3, Gift, HandCoins, ReceiptText, Search, ShieldAlert, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
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

  const overviewQuery = useReferralOverview();
  const listQuery = useReferrals({ page, limit: PAGE_SIZE, q: search, reviewStatus, payoutStatus, status: "all" });
  const approveMutation = useApproveReferral();
  const rejectMutation = useRejectReferral();
  const offerMutation = useOfferReferral();
  const markPaidMutation = useMarkReferralPaid();

  const isPending = overviewQuery.isPending || listQuery.isPending;
  const isError = overviewQuery.isError || listQuery.isError;

  const items = listQuery.data?.items || [];
  const selectedReferral = useMemo(() => items.find((item) => item.id === selectedId) || items[0] || null, [items, selectedId]);

  const syncSelectedReferral = (referral: ReferralRecord | null) => {
    if (!referral) return;
    setSelectedId(referral.id);
    setNote(referral.reviewNote || referral.payoutNote || "");
    setOfferTitle(referral.offerTitle || "Standard referral reward");
    setOfferDescription(referral.offerDescription || "Referral reward issued after admin review and payout approval.");
    setRewardAmount(String(referral.rewardAmount || 10));
    setPayoutMethod(referral.payoutMethod || "account_credit");
    setPayoutReference(referral.payoutReference || "");
  };

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

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Growth Ops"
        title="Referral Management"
        description="Approve referred signups, control payout offers, and keep client referral rewards moving without leaving the admin workspace."
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
        <StatCard title="Awaiting payout" value={String(overview.awaitingPayout)} description="Approved referrals with an active offer or queued payout." icon={Clock3} tone="info" />
        <StatCard title="Reward offered" value={formatCurrency(overview.totalRewardOffered)} description="Offer value currently exposed to the referral queue." icon={Gift} tone="neutral" />
        <StatCard title="Reward paid" value={formatCurrency(overview.totalRewardPaid)} description="Payout value already settled for completed referrals." icon={HandCoins} tone="success" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Queues and pipeline</CardTitle>
              <CardDescription>Watch the review backlog, payout queue, and the offer bundles currently driving the program.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Review queue</p>
              <p className="mt-3 text-3xl font-semibold text-text-primary">{overview.pendingReview}</p>
              <p className="mt-2 text-sm text-text-secondary">New referrals waiting for validation and payout policy review.</p>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Payout queue</p>
              <p className="mt-3 text-3xl font-semibold text-text-primary">{overview.awaitingPayout}</p>
              <p className="mt-2 text-sm text-text-secondary">Approved referrals ready for offer confirmation, queueing, or settlement.</p>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Rejected / withheld</p>
              <p className="mt-3 text-3xl font-semibold text-text-primary">{overview.rejected}</p>
              <p className="mt-2 text-sm text-text-secondary">Referrals stopped because they failed the program checks or need follow-up.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
              <p className="text-sm font-medium text-text-primary">Review queue snapshot</p>
              <div className="mt-3 space-y-3">
                {overview.reviewQueue.length ? overview.reviewQueue.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full rounded-xl border border-background-border bg-background-panel px-3 py-3 text-left transition-colors hover:border-primary/40"
                    onClick={() => syncSelectedReferral(item)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-text-primary">{item.referredUser?.name || "Referral record"}</p>
                        <p className="text-xs text-text-secondary">{item.referrer?.name || "Unknown referrer"} • {item.referralCode}</p>
                      </div>
                      <Badge tone="warning">{item.reviewStatus}</Badge>
                    </div>
                  </button>
                )) : <p className="text-sm text-text-muted">No referrals are waiting for review right now.</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
              <p className="text-sm font-medium text-text-primary">Top reward offers</p>
              <div className="mt-3 space-y-3">
                {overview.activeOffers.length ? overview.activeOffers.map((offer) => (
                  <div key={offer.title} className="rounded-xl border border-background-border bg-background-panel px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-text-primary">{offer.title}</p>
                      <Badge tone="info">{offer.referrals} referrals</Badge>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{formatCurrency(offer.totalReward)} allocated across active referral records.</p>
                  </div>
                )) : <p className="text-sm text-text-muted">No active payout offers have been defined yet.</p>}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Referral action desk</CardTitle>
              <CardDescription>Review the selected referral, approve it, tailor the payout offer, or mark it settled.</CardDescription>
            </div>
          </CardHeader>
          {selectedReferral ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-text-primary">{selectedReferral.referredUser?.name || "Referred account"}</p>
                    <p className="text-sm text-text-secondary">{selectedReferral.referredUser?.email || "No email"} • referred by {selectedReferral.referrer?.name || "Unknown referrer"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge tone={toneForReview(selectedReferral.reviewStatus) as "success" | "warning" | "danger" | "info"}>{selectedReferral.reviewStatus}</Badge>
                    <Badge tone={toneForPayout(selectedReferral.payoutStatus) as "success" | "warning" | "danger" | "info" | "neutral"}>{selectedReferral.payoutStatus}</Badge>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-background-border bg-background-panel px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Offer</p>
                    <p className="mt-2 font-medium text-text-primary">{selectedReferral.offerTitle}</p>
                    <p className="mt-1 text-sm text-text-secondary">{selectedReferral.offerDescription}</p>
                  </div>
                  <div className="rounded-xl border border-background-border bg-background-panel px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Payout</p>
                    <p className="mt-2 font-medium text-text-primary">{formatCurrency(selectedReferral.rewardAmount)}</p>
                    <p className="mt-1 text-sm text-text-secondary">{selectedReferral.payoutMethod} {selectedReferral.payoutReference ? `• ${selectedReferral.payoutReference}` : ""}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Offer title" value={offerTitle} onChange={(event) => setOfferTitle(event.target.value)} />
                <Input label="Reward amount" type="number" min="0" step="0.01" value={rewardAmount} onChange={(event) => setRewardAmount(event.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
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

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Button
                  isLoading={approveMutation.isPending}
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
                  Approve
                </Button>
                <Button
                  variant="outline"
                  isLoading={offerMutation.isPending}
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
                  Queue Payout
                </Button>
                <Button
                  variant="outline"
                  isLoading={markPaidMutation.isPending}
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
                  Mark Paid
                </Button>
                <Button
                  variant="ghost"
                  isLoading={rejectMutation.isPending}
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
          ) : (
            <EmptyState icon={Gift} title="No referral selected" description="Choose a referral record from the activity table to review or settle it." />
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Referral activity</CardTitle>
            <CardDescription>Search the full referral book, review queue state, and jump straight into approval or settlement work.</CardDescription>
          </div>
        </CardHeader>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr_0.8fr]">
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
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-background-border text-text-muted">
                  <th className="px-3 py-3 font-medium">Referral</th>
                  <th className="px-3 py-3 font-medium">Review</th>
                  <th className="px-3 py-3 font-medium">Payout</th>
                  <th className="px-3 py-3 font-medium">Offer</th>
                  <th className="px-3 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((referral) => (
                  <tr
                    key={referral.id}
                    className={`cursor-pointer border-b border-background-border/70 last:border-b-0 ${selectedReferral?.id === referral.id ? "bg-primary/5" : ""}`}
                    onClick={() => syncSelectedReferral(referral)}
                  >
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium text-text-primary">{referral.referredUser?.name || "Referral record"}</p>
                      <p className="text-xs text-text-secondary">{referral.referredUser?.email || "No email"} • via {referral.referrer?.name || "Unknown referrer"}</p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <Badge tone={toneForReview(referral.reviewStatus) as "success" | "warning" | "danger" | "info"}>{referral.reviewStatus}</Badge>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <Badge tone={toneForPayout(referral.payoutStatus) as "success" | "warning" | "danger" | "info" | "neutral"}>{referral.payoutStatus}</Badge>
                    </td>
                    <td className="px-3 py-3 align-top text-text-primary">
                      <p>{referral.offerTitle}</p>
                      <p className="text-xs text-text-secondary">{formatCurrency(referral.rewardAmount)}</p>
                    </td>
                    <td className="px-3 py-3 align-top text-text-secondary">
                      {formatDateTime(referral.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </section>
  );
}
