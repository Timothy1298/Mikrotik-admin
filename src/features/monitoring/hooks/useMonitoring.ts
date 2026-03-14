import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  acknowledgeIncident,
  addIncidentNote,
  getAffectedCustomers,
  getCustomerImpactSummary,
  getIncidentById,
  getIncidents,
  getMonitoringActivity,
  getMonitoringDiagnostics,
  getMonitoringOverview,
  getMonitoringTrends,
  getOfflineRouters,
  getOverloadedVpnServers,
  getPeerHealthSummary,
  getProvisioningFailures,
  getProvisioningSummary,
  getProvisioningTrends,
  getRouterHealthSummary,
  getStalePeers,
  getStaleRouters,
  getStaleVpnServers,
  getTopTrafficRouters,
  getTopTrafficServers,
  getTrafficSummary,
  getTrafficTrends,
  getUnhealthyPeers,
  getUnhealthyRouters,
  getUnhealthyVpnServers,
  getVpnServerHealthSummary,
  markIncidentReviewed,
  resolveIncident,
} from "@/features/monitoring/api/getMonitoring";
import type { MonitoringFilterState } from "@/features/monitoring/types/monitoring.types";

const monitoringBase = [...queryKeys.monitoring] as const;

export function useMonitoringOverview() {
  return useQuery({ queryKey: [...monitoringBase, "overview"], queryFn: getMonitoringOverview, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useMonitoringTrends(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "trends", params], queryFn: () => getMonitoringTrends(params), staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useMonitoringActivity(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "activity", params], queryFn: () => getMonitoringActivity(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useMonitoringDiagnostics() {
  return useQuery({ queryKey: [...monitoringBase, "diagnostics"], queryFn: getMonitoringDiagnostics, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useRouterHealthSummary() {
  return useQuery({ queryKey: [...monitoringBase, "routers", "summary"], queryFn: getRouterHealthSummary, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useUnhealthyRouters(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "routers", "unhealthy", params], queryFn: () => getUnhealthyRouters(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useOfflineRouters(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "routers", "offline", params], queryFn: () => getOfflineRouters(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useProvisioningIssueRouters(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "routers", "provisioning", params], queryFn: () => getProvisioningFailures(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useStaleRouters(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "routers", "stale", params], queryFn: () => getStaleRouters(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useVpnServerHealthSummary() {
  return useQuery({ queryKey: [...monitoringBase, "vpn-servers", "summary"], queryFn: getVpnServerHealthSummary, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useUnhealthyVpnServers(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "vpn-servers", "unhealthy", params], queryFn: () => getUnhealthyVpnServers(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useOverloadedVpnServers(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "vpn-servers", "overloaded", params], queryFn: () => getOverloadedVpnServers(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useStaleVpnServers(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "vpn-servers", "stale", params], queryFn: () => getStaleVpnServers(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function usePeerHealthSummary() {
  return useQuery({ queryKey: [...monitoringBase, "peers", "summary"], queryFn: getPeerHealthSummary, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useStalePeers(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "peers", "stale", params], queryFn: () => getStalePeers(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useUnhealthyPeers(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "peers", "unhealthy", params], queryFn: () => getUnhealthyPeers(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useTrafficSummary() {
  return useQuery({ queryKey: [...monitoringBase, "traffic", "summary"], queryFn: getTrafficSummary, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useTrafficTrends(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "traffic", "trends", params], queryFn: () => getTrafficTrends(params), staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useTopTrafficRouters(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "traffic", "top-routers", params], queryFn: () => getTopTrafficRouters(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useTopTrafficServers(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "traffic", "top-servers", params], queryFn: () => getTopTrafficServers(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useCustomerImpact() {
  return useQuery({ queryKey: [...monitoringBase, "customers", "impact"], queryFn: getCustomerImpactSummary, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useAffectedCustomers(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "customers", "affected", params], queryFn: () => getAffectedCustomers(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useProvisioningSummary() {
  return useQuery({ queryKey: [...monitoringBase, "provisioning", "summary"], queryFn: getProvisioningSummary, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useProvisioningTrends(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "provisioning", "trends", params], queryFn: () => getProvisioningTrends(params), staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useProvisioningFailures(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "provisioning", "failures", params], queryFn: () => getProvisioningFailures(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useIncidents(params?: MonitoringFilterState) {
  return useQuery({ queryKey: [...monitoringBase, "incidents", params], queryFn: () => getIncidents(params), staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useIncident(id: string) {
  return useQuery({ queryKey: [...monitoringBase, "incident", id], queryFn: () => getIncidentById(id), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
}

function useMonitoringIncidentMutation<TArgs extends unknown[]>(mutationFn: (...args: TArgs) => Promise<{ message?: string }>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async (_, variables) => {
      const id = variables[0] ? String(variables[0]) : "";
      toast.success(successMessage);
      await queryClient.invalidateQueries({ queryKey: monitoringBase });
      if (id) {
        await queryClient.invalidateQueries({ queryKey: [...monitoringBase, "incident", id] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Monitoring action failed");
    },
  });
}

export function useAcknowledgeIncident() {
  return useMonitoringIncidentMutation(acknowledgeIncident, "Incident acknowledged successfully");
}

export function useResolveIncident() {
  return useMonitoringIncidentMutation(resolveIncident, "Incident resolved successfully");
}

export function useMarkIncidentReviewed() {
  return useMonitoringIncidentMutation(markIncidentReviewed, "Incident marked as reviewed");
}

export function useAddIncidentNote() {
  return useMonitoringIncidentMutation(addIncidentNote, "Incident note added successfully");
}
