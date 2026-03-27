export type ReferralActor = {
  id: string;
  name: string;
  email: string;
  referralCode?: string | null;
};

export type ReferralRecord = {
  id: string;
  referralCode: string;
  status: string;
  rewardGiven: boolean;
  rewardAmount: number;
  rewardCurrency: string;
  reviewStatus: "pending_review" | "approved" | "rejected" | "paid";
  reviewNote: string;
  reviewedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  offerTitle: string;
  offerDescription: string;
  payoutStatus: "not_ready" | "offered" | "queued" | "paid" | "withheld";
  payoutMethod: "account_credit" | "mpesa" | "bank_transfer" | "cash" | "voucher" | "manual_review";
  payoutReference: string;
  payoutNote: string;
  payoutOfferedAt?: string | null;
  payoutQueuedAt?: string | null;
  paidAt?: string | null;
  referrer?: ReferralActor | null;
  referredUser?: ReferralActor & { joinedAt?: string | null } | null;
  reviewedBy?: ReferralActor | null;
  paidBy?: ReferralActor | null;
};

export type ReferralOverview = {
  totalReferrals: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  paid: number;
  awaitingPayout: number;
  totalRewardOffered: number;
  totalRewardPaid: number;
  activeOffers: Array<{
    title: string;
    referrals: number;
    totalReward: number;
  }>;
  reviewQueue: ReferralRecord[];
  payoutQueue: ReferralRecord[];
};

export type ReferralListResponse = {
  items: ReferralRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type ReferralFilters = {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
  reviewStatus?: string;
  payoutStatus?: string;
};

export type ApproveReferralPayload = {
  rewardAmount?: number;
  rewardCurrency?: string;
  offerTitle?: string;
  offerDescription?: string;
  payoutMethod?: ReferralRecord["payoutMethod"];
  note?: string;
  reason?: string;
};

export type RejectReferralPayload = {
  note?: string;
  payoutNote?: string;
  reason?: string;
};

export type OfferReferralPayload = {
  rewardAmount?: number;
  rewardCurrency?: string;
  offerTitle?: string;
  offerDescription?: string;
  payoutMethod?: ReferralRecord["payoutMethod"];
  note?: string;
  reason?: string;
  queueForPayment?: boolean;
};

export type MarkReferralPaidPayload = {
  payoutReference?: string;
  payoutMethod?: ReferralRecord["payoutMethod"];
  note?: string;
  reason?: string;
};
