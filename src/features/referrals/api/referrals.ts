import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ApproveReferralPayload,
  MarkReferralPaidPayload,
  OfferReferralPayload,
  ReferralFilters,
  ReferralListResponse,
  ReferralOverview,
  RejectReferralPayload,
} from "@/features/referrals/types/referral.types";

export async function getReferralOverview() {
  const { data } = await apiClient.get<{ success: boolean; overview: ReferralOverview }>(endpoints.admin.referralsOverview);
  return data.overview;
}

export async function getReferrals(filters: ReferralFilters = {}) {
  const { data } = await apiClient.get<{ success: boolean } & ReferralListResponse>(endpoints.admin.referrals, {
    params: filters,
  });
  return {
    items: data.items || [],
    pagination: data.pagination,
  };
}

export async function approveReferral(id: string, payload: ApproveReferralPayload) {
  const { data } = await apiClient.post<{ success: boolean; message?: string }>(endpoints.admin.approveReferral(id), payload);
  return data;
}

export async function rejectReferral(id: string, payload: RejectReferralPayload) {
  const { data } = await apiClient.post<{ success: boolean; message?: string }>(endpoints.admin.rejectReferral(id), payload);
  return data;
}

export async function offerReferral(id: string, payload: OfferReferralPayload) {
  const { data } = await apiClient.post<{ success: boolean; message?: string }>(endpoints.admin.offerReferral(id), payload);
  return data;
}

export async function markReferralPaid(id: string, payload: MarkReferralPaidPayload) {
  const { data } = await apiClient.post<{ success: boolean; message?: string }>(endpoints.admin.markReferralPaid(id), payload);
  return data;
}
