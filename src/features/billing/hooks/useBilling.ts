import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  addBillingFlag,
  addBillingNote,
  applyGracePeriod,
  createInvoice,
  downloadInvoicePdf,
  extendTrial,
  getBillingOutstandingReport,
  getAccountBillingActivity,
  getAccountBillingOverview,
  getAccountBillableRouters,
  getAccountEntitlements,
  getBillingRevenueReport,
  getAccountInvoices,
  getAccountPayments,
  getBillingActivity,
  getBillingAnalytics,
  getBillingFlags,
  getBillingNotes,
  getBillingOverview,
  getBillingRisk,
  getInvoiceById,
  getInvoices,
  getPaymentById,
  getPayments,
  getSubscriptionById,
  getSubscriptions,
  getTrials,
  issueRefund,
  markBillingReviewed,
  reactivateBillingAccount,
  recordPayment,
  removeBillingFlag,
  removeGracePeriod,
  resendInvoice,
  suspendBillingAccount,
} from "@/features/billing/api/getBilling";
import type { BillingFilterState } from "@/features/billing/types/billing.types";

const billingBase = [...queryKeys.billing] as const;

export function useBillingOverview() {
  return useQuery({ queryKey: [...billingBase, "overview"], queryFn: getBillingOverview, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useBillingAnalytics(params?: BillingFilterState) {
  return useQuery({ queryKey: [...billingBase, "analytics", params], queryFn: () => getBillingAnalytics(params), staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useBillingActivity(params?: BillingFilterState & { accountId?: string }, enabled = true) {
  return useQuery({ queryKey: [...billingBase, "activity", params], queryFn: () => getBillingActivity(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
}

export function useBillingRisk() {
  return useQuery({ queryKey: [...billingBase, "risk"], queryFn: getBillingRisk, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useSubscriptions(params?: BillingFilterState & Record<string, unknown>, enabled = true) {
  return useQuery({ queryKey: [...billingBase, "subscriptions", params], queryFn: () => getSubscriptions(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
}

export function useSubscription(id: string) {
  return useQuery({ queryKey: [...billingBase, "subscription", id], queryFn: () => getSubscriptionById(id), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useAccountBillingOverview(accountId: string) {
  return useQuery({ queryKey: [...billingBase, "account", accountId], queryFn: () => getAccountBillingOverview(accountId), enabled: Boolean(accountId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useAccountEntitlements(accountId: string) {
  return useQuery({ queryKey: [...billingBase, "entitlements", accountId], queryFn: () => getAccountEntitlements(accountId), enabled: Boolean(accountId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useAccountBillableRouters(accountId: string) {
  return useQuery({ queryKey: [...billingBase, "billable-routers", accountId], queryFn: () => getAccountBillableRouters(accountId), enabled: Boolean(accountId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useAccountBillingActivity(accountId: string, params?: BillingFilterState) {
  return useQuery({ queryKey: [...billingBase, "account-activity", accountId, params], queryFn: () => getAccountBillingActivity(accountId, params), enabled: Boolean(accountId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useInvoices(params?: BillingFilterState, enabled = true) {
  return useQuery({ queryKey: [...billingBase, "invoices", params], queryFn: () => getInvoices(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
}

export function useInvoice(id: string) {
  return useQuery({ queryKey: [...billingBase, "invoice", id], queryFn: () => getInvoiceById(id), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useAccountInvoices(accountId: string, params?: BillingFilterState) {
  return useQuery({ queryKey: [...billingBase, "account-invoices", accountId, params], queryFn: () => getAccountInvoices(accountId, params), enabled: Boolean(accountId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function usePayments(params?: BillingFilterState, enabled = true) {
  return useQuery({ queryKey: [...billingBase, "payments", params], queryFn: () => getPayments(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
}

export function usePayment(id: string) {
  return useQuery({ queryKey: [...billingBase, "payment", id], queryFn: () => getPaymentById(id), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useAccountPayments(accountId: string, params?: BillingFilterState) {
  return useQuery({ queryKey: [...billingBase, "account-payments", accountId, params], queryFn: () => getAccountPayments(accountId, params), enabled: Boolean(accountId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useTrials(params?: BillingFilterState, enabled = true) {
  return useQuery({ queryKey: [...billingBase, "trials", params], queryFn: () => getTrials(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
}

export function useBillingRevenueReport(params?: { window?: string; groupBy?: string }) {
  return useQuery({ queryKey: [...billingBase, "revenue-report", params], queryFn: () => getBillingRevenueReport(params), staleTime: 60_000, refetchOnWindowFocus: false });
}

export function useBillingOutstandingReport() {
  return useQuery({ queryKey: [...billingBase, "outstanding-report"], queryFn: getBillingOutstandingReport, staleTime: 60_000, refetchOnWindowFocus: false });
}

export function useBillingNotes(accountId: string) {
  return useQuery({ queryKey: [...billingBase, "notes", accountId], queryFn: () => getBillingNotes(accountId), enabled: Boolean(accountId), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useBillingFlags(accountId: string) {
  return useQuery({ queryKey: [...billingBase, "flags", accountId], queryFn: () => getBillingFlags(accountId), enabled: Boolean(accountId), staleTime: 20_000, refetchOnWindowFocus: false });
}

function useBillingMutation<TArgs extends unknown[]>(mutationFn: (...args: TArgs) => Promise<{ message?: string }>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async (_, variables) => {
      const id = variables[0] ? String(variables[0]) : "";
      toast.success(successMessage);
      await queryClient.invalidateQueries({ queryKey: billingBase });
      if (id) {
        await queryClient.invalidateQueries({ queryKey: [...billingBase, "account", id] });
        await queryClient.invalidateQueries({ queryKey: [...billingBase, "notes", id] });
        await queryClient.invalidateQueries({ queryKey: [...billingBase, "flags", id] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Billing action failed");
    },
  });
}

export const useExtendTrial = () => useBillingMutation(extendTrial, "Trial extended successfully");
export const useMarkBillingReviewed = () => useBillingMutation(markBillingReviewed, "Billing marked as reviewed");
export const useSuspendBillingAccount = () => useBillingMutation(suspendBillingAccount, "Account suspended for billing");
export const useReactivateBillingAccount = () => useBillingMutation(reactivateBillingAccount, "Billing account reactivated");
export const useResendInvoice = () => useBillingMutation(resendInvoice, "Invoice reminder sent");
export const useApplyGracePeriod = () => useBillingMutation(applyGracePeriod, "Grace period applied successfully");
export const useRemoveGracePeriod = () => useBillingMutation(removeGracePeriod, "Grace period removed successfully");
export const useAddBillingNote = () => useBillingMutation(addBillingNote, "Billing note added successfully");
export const useAddBillingFlag = () => useBillingMutation(addBillingFlag, "Billing flag added successfully");
export const useRemoveBillingFlag = () => useBillingMutation(removeBillingFlag, "Billing flag removed successfully");

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: [import("@/features/billing/types/billing.types").RecordPaymentPayload]) => recordPayment(variables[0]),
    onSuccess: async () => {
      toast.success("Payment recorded successfully");
      await queryClient.invalidateQueries({ queryKey: billingBase });
    },
    onError: (error: Error) => toast.error(error.message || "Billing action failed"),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: [import("@/features/billing/types/billing.types").CreateInvoicePayload]) => createInvoice(variables[0]),
    onSuccess: async () => {
      toast.success("Invoice created successfully");
      await queryClient.invalidateQueries({ queryKey: billingBase });
    },
    onError: (error: Error) => toast.error(error.message || "Billing action failed"),
  });
}

export function useIssueRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: [import("@/features/billing/types/billing.types").IssueRefundPayload]) => issueRefund(variables[0]),
    onSuccess: async () => {
      toast.success("Refund recorded successfully");
      await queryClient.invalidateQueries({ queryKey: billingBase });
    },
    onError: (error: Error) => toast.error(error.message || "Billing action failed"),
  });
}

export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: (invoiceId: string) => downloadInvoicePdf(invoiceId),
    onSuccess: (data) => {
      if (data.invoiceData) {
        const win = window.open("", "_blank", "width=900,height=700");
        if (win) {
          win.document.write(`<html><head><title>Invoice</title></head><body><pre>${JSON.stringify(data.invoiceData, null, 2)}</pre></body></html>`);
          win.document.close();
          win.print();
        }
      }
      toast.success("Invoice downloaded");
    },
    onError: (error: Error) => toast.error(error.message || "Invoice download failed"),
  });
}
