import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  approveReferral,
  getReferralOverview,
  getReferrals,
  markReferralPaid,
  offerReferral,
  rejectReferral,
} from "@/features/referrals/api/referrals";
import type {
  ApproveReferralPayload,
  MarkReferralPaidPayload,
  OfferReferralPayload,
  ReferralFilters,
  RejectReferralPayload,
} from "@/features/referrals/types/referral.types";

const referralBase = [...queryKeys.adminReferrals] as const;

export function useReferralOverview() {
  return useQuery({
    queryKey: [...referralBase, "overview"],
    queryFn: getReferralOverview,
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useReferrals(filtersOrPage: ReferralFilters | number = {}, legacyLimit?: number) {
  const filters = typeof filtersOrPage === "number"
    ? { page: filtersOrPage, limit: legacyLimit || 20 }
    : filtersOrPage;

  return useQuery({
    queryKey: [...referralBase, "list", filters],
    queryFn: async () => {
      const data = await getReferrals(filters);
      return {
        ...data,
        referrals: data.items,
      };
    },
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useReferralCode() {
  return useQuery({
    queryKey: [...referralBase, "legacy-code"],
    queryFn: async () => ({
      referralCode: "ADMIN-REFERRALS",
      referralLink: "/referrals",
    }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useReferralStats() {
  const overviewQuery = useReferralOverview();
  return {
    ...overviewQuery,
    data: overviewQuery.data ? {
      totalReferrals: overviewQuery.data.totalReferrals,
      completedReferrals: overviewQuery.data.approved + overviewQuery.data.paid,
      pendingReferrals: overviewQuery.data.pendingReview,
      totalRewards: overviewQuery.data.totalRewardPaid,
    } : undefined,
  };
}

function useReferralMutation<TPayload>(mutationFn: (id: string, payload: TPayload) => Promise<{ message?: string }>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TPayload }) => mutationFn(id, payload),
    onSuccess: async (response) => {
      toast.success(response.message || successMessage);
      await queryClient.invalidateQueries({ queryKey: referralBase });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Referral action failed");
    },
  });
}

export function useApproveReferral() {
  return useReferralMutation<ApproveReferralPayload>(approveReferral, "Referral approved");
}

export function useRejectReferral() {
  return useReferralMutation<RejectReferralPayload>(rejectReferral, "Referral rejected");
}

export function useOfferReferral() {
  return useReferralMutation<OfferReferralPayload>(offerReferral, "Referral offer updated");
}

export function useMarkReferralPaid() {
  return useReferralMutation<MarkReferralPaidPayload>(markReferralPaid, "Referral marked as paid");
}
