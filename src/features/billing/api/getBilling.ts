import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  BillingAccountDetail,
  BillingActivityItem,
  BillingAnalytics,
  BillingEntitlements,
  BillingFilterState,
  BillingFlag,
  BillingNote,
  BillingOutstandingReport,
  BillingOverview,
  BillingPaginationMeta,
  BillingRevenueReport,
  BillingRisk,
  BillingSubscriptionRow,
  BillingTransaction,
  BillingTrialRow,
  CreateInvoicePayload,
  IssueRefundPayload,
  RecordPaymentPayload,
} from "@/features/billing/types/billing.types";

export async function getBillingOverview() {
  const { data } = await apiClient.get<{ success: boolean; overview: BillingOverview }>(endpoints.admin.billingOverview);
  return data.overview;
}

export async function getBillingAnalytics(params?: BillingFilterState) {
  const { data } = await apiClient.get<{ success: boolean; analytics: BillingAnalytics }>(endpoints.admin.billingAnalytics, { params });
  return data.analytics;
}

export async function getBillingActivity(params?: BillingFilterState & { accountId?: string }) {
  const { data } = await apiClient.get<{ success: boolean; items: BillingActivityItem[]; pagination: BillingPaginationMeta }>(endpoints.admin.billingActivity, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getBillingRisk() {
  const { data } = await apiClient.get<{ success: boolean; risk: BillingRisk }>(endpoints.admin.billingRisk);
  return data.risk;
}

export async function getSubscriptions(params?: BillingFilterState & Record<string, unknown>) {
  const { data } = await apiClient.get<{ success: boolean; items: BillingSubscriptionRow[]; pagination: BillingPaginationMeta }>(endpoints.admin.billingSubscriptions, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getSubscriptionById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: BillingAccountDetail }>(endpoints.admin.billingSubscriptionDetail(id));
  return data.data;
}

export async function getAccountBillingOverview(accountId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: BillingAccountDetail }>(endpoints.admin.billingAccountOverview(accountId));
  return data.data;
}

export async function getAccountEntitlements(accountId: string) {
  const { data } = await apiClient.get<{ success: boolean; entitlements: BillingEntitlements }>(endpoints.admin.billingAccountEntitlements(accountId));
  return data.entitlements;
}

export async function getAccountBillableRouters(accountId: string) {
  const { data } = await apiClient.get<{ success: boolean; billableRouters: BillingAccountDetail["routers"] & { billableRouters?: number; freeOrTrialCoveredRouters?: number; excludedRouters?: number } }>(endpoints.admin.billingAccountBillableRouters(accountId));
  return data.billableRouters;
}

export async function getAccountBillingActivity(accountId: string, params?: BillingFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: BillingActivityItem[]; pagination: BillingPaginationMeta }>(endpoints.admin.billingAccountActivity(accountId), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getInvoices(params?: BillingFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: BillingTransaction[]; pagination: BillingPaginationMeta }>(endpoints.admin.billingInvoices, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getInvoiceById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; invoice: BillingTransaction }>(endpoints.admin.billingInvoiceDetail(id));
  return data.invoice;
}

export async function getAccountInvoices(accountId: string, params?: BillingFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: BillingTransaction[]; pagination: BillingPaginationMeta }>(endpoints.admin.billingAccountInvoices(accountId), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getPayments(params?: BillingFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: BillingTransaction[]; pagination: BillingPaginationMeta }>(endpoints.admin.billingPayments, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getPaymentById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; payment: BillingTransaction }>(endpoints.admin.billingPaymentDetail(id));
  return data.payment;
}

export async function getAccountPayments(accountId: string, params?: BillingFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: BillingTransaction[]; pagination: BillingPaginationMeta }>(endpoints.admin.billingAccountPayments(accountId), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getTrials(params?: BillingFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: BillingTrialRow[]; pagination: BillingPaginationMeta }>(endpoints.admin.billingTrials, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function recordPayment(payload: RecordPaymentPayload) {
  const { data } = await apiClient.post<{ success: boolean; message: string; transaction: { id: string; transactionId: string; amount: number; currency: string; status: string; createdAt: string } }>(endpoints.admin.recordPayment, payload);
  return data;
}

export async function createInvoice(payload: CreateInvoicePayload) {
  const { data } = await apiClient.post<{ success: boolean; message: string; invoice: { id: string; transactionId: string; amount: number; currency: string; status: string; dueDate: string | null; createdAt: string } }>(endpoints.admin.createInvoice, payload);
  return data;
}

export async function issueRefund(payload: IssueRefundPayload) {
  const { data } = await apiClient.post<{ success: boolean; message: string; refund: { id: string; transactionId: string; amount: number; currency: string; status: string; createdAt: string } }>(endpoints.admin.issueRefund, payload);
  return data;
}

export async function downloadInvoicePdf(invoiceId: string) {
  const { data } = await apiClient.get<{ success: boolean; invoiceData?: Record<string, unknown> }>(endpoints.admin.downloadInvoicePdf(invoiceId));
  return data;
}

export async function getBillingRevenueReport(params?: { window?: string; groupBy?: string }) {
  const { data } = await apiClient.get<{ success: boolean; report: BillingRevenueReport }>(endpoints.admin.billingRevenueReport, { params });
  return data.report;
}

export async function getBillingOutstandingReport() {
  const { data } = await apiClient.get<{ success: boolean; report: BillingOutstandingReport }>(endpoints.admin.billingOutstandingReport);
  return data.report;
}

export async function getBillingNotes(accountId: string) {
  const { data } = await apiClient.get<{ success: boolean; items: BillingNote[] }>(endpoints.admin.billingNotes(accountId));
  return data.items;
}

export async function getBillingFlags(accountId: string) {
  const { data } = await apiClient.get<{ success: boolean; items: BillingFlag[] }>(endpoints.admin.billingFlags(accountId));
  return data.items;
}

export async function extendTrial(accountId: string, days: number, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; trialEndsAt: string }>(endpoints.admin.billingExtendTrial(accountId), { days, reason });
  return data;
}

export async function markBillingReviewed(accountId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.billingMarkReviewed(accountId), { reason });
  return data;
}

export async function suspendBillingAccount(accountId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.billingSuspend(accountId), { reason });
  return data;
}

export async function reactivateBillingAccount(accountId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.billingReactivate(accountId), { reason });
  return data;
}

export async function resendInvoice(accountId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.billingResendInvoice(accountId), { reason });
  return data;
}

export async function applyGracePeriod(accountId: string, days: number, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; billingGracePeriodEndsAt: string }>(endpoints.admin.billingApplyGracePeriod(accountId), { days, reason });
  return data;
}

export async function removeGracePeriod(accountId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.billingRemoveGracePeriod(accountId), { reason });
  return data;
}

export async function addBillingNote(accountId: string, payload: { body: string; category: string; pinned?: boolean; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.billingNotes(accountId), payload);
  return data;
}

export async function addBillingFlag(accountId: string, payload: { flag: string; severity: string; description?: string; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.billingFlags(accountId), payload);
  return data;
}

export async function removeBillingFlag(accountId: string, flagId: string, reason?: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.admin.billingRemoveFlag(accountId, flagId), { data: { reason } });
  return data;
}
