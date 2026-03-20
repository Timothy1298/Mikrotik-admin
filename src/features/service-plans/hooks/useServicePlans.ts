import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  createServicePlan,
  deactivateServicePlan,
  deleteServicePlan,
  exportVouchers,
  generateVouchers,
  getServicePlanById,
  getServicePlans,
  getVouchers,
  updateServicePlan,
} from "@/features/service-plans/api/getServicePlans";

const servicePlansBase = [...queryKeys.servicePlans] as const;

export function useServicePlans(params?: { q?: string; isActive?: string; planType?: string }) {
  return useQuery({
    queryKey: [...servicePlansBase, params],
    queryFn: () => getServicePlans(params),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useServicePlan(id: string) {
  return useQuery({
    queryKey: queryKeys.servicePlanDetail(id),
    queryFn: () => getServicePlanById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useVouchers(planId: string, params?: { status?: string; batchId?: string; page?: number }) {
  return useQuery({
    queryKey: [...queryKeys.vouchers(planId), params],
    queryFn: () => getVouchers(planId, params),
    enabled: Boolean(planId),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

function useServicePlanMutation<TArgs extends unknown[], TResult>(mutationFn: (...args: TArgs) => Promise<TResult>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async (_, variables) => {
      const planId = variables[0] && typeof variables[0] === "string" ? String(variables[0]) : "";
      toast.success(successMessage);
      await queryClient.invalidateQueries({ queryKey: servicePlansBase });
      if (planId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.servicePlanDetail(planId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.vouchers(planId) });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Service plan action failed");
    },
  });
}

export function useCreateServicePlan() {
  return useServicePlanMutation((payload: Parameters<typeof createServicePlan>[0]) => createServicePlan(payload), "Service plan created");
}

export function useUpdateServicePlan() {
  return useServicePlanMutation((id: string, payload: Parameters<typeof updateServicePlan>[1]) => updateServicePlan(id, payload), "Service plan updated");
}

export function useDeactivateServicePlan() {
  return useServicePlanMutation((id: string) => deactivateServicePlan(id), "Service plan deactivated");
}

export function useDeleteServicePlan() {
  return useServicePlanMutation((id: string) => deleteServicePlan(id), "Service plan archived");
}

export function useGenerateVouchers() {
  return useServicePlanMutation((planId: string, payload: Parameters<typeof generateVouchers>[1]) => generateVouchers(planId, payload), "Vouchers generated successfully");
}

export function useExportVouchers() {
  return useMutation({
    mutationFn: exportVouchers,
    onSuccess: () => {
      toast.success("Vouchers exported");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export vouchers");
    },
  });
}
