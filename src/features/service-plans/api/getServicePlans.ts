import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { CreatePlanPayload, GenerateVouchersPayload, ServicePlan, UpdatePlanPayload, Voucher } from "@/features/service-plans/types/service-plan.types";

function triggerCsvDownload(blobPart: BlobPart, filename: string) {
  const url = URL.createObjectURL(new Blob([blobPart], { type: "text/csv" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function getServicePlans(params?: { q?: string; isActive?: string; planType?: string }) {
  const { data } = await apiClient.get<{ success: boolean; items: ServicePlan[] }>(endpoints.admin.servicePlans, { params });
  return data.items;
}

export async function getServicePlanById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; plan: ServicePlan }>(endpoints.admin.servicePlanDetail(id));
  return data.plan;
}

export async function createServicePlan(payload: CreatePlanPayload) {
  const { data } = await apiClient.post<{ success: boolean; plan: ServicePlan }>(endpoints.admin.servicePlans, payload);
  return data.plan;
}

export async function updateServicePlan(id: string, payload: UpdatePlanPayload) {
  const { data } = await apiClient.put<{ success: boolean; plan: ServicePlan }>(endpoints.admin.servicePlanDetail(id), payload);
  return data.plan;
}

export async function deactivateServicePlan(id: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; plan: ServicePlan }>(endpoints.admin.deactivateServicePlan(id));
  return data.plan;
}

export async function deleteServicePlan(id: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.admin.servicePlanDetail(id));
  return data;
}

export async function generateVouchers(planId: string, payload: GenerateVouchersPayload) {
  const { data } = await apiClient.post<{ success: boolean; batchId: string; count: number }>(endpoints.admin.planVouchersGenerate(planId), payload);
  return data;
}

export async function getVouchers(planId: string, params?: { status?: string; batchId?: string; page?: number }) {
  const { data } = await apiClient.get<{ success: boolean; items: Voucher[]; pagination: { page: number; limit: number; total: number; pages: number } }>(endpoints.admin.planVouchers(planId), { params });
  return data;
}

export async function exportVouchers(params: { planId?: string; batchId?: string }) {
  const { data } = await apiClient.get<Blob>(endpoints.admin.exportVouchers, { params, responseType: "blob" });
  triggerCsvDownload(data, `vouchers-${Date.now()}.csv`);
}
