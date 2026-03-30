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
  getProvisioningIssueRouters,
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

export function useMonitoringOverview(enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "overview"], queryFn: getMonitoringOverview, enabled, staleTime: 30_000, refetchInterval: 60_000, refetchOnWindowFocus: false });
}

export function useMonitoringTrends(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "trends", params], queryFn: () => getMonitoringTrends(params), enabled, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useMonitoringActivity(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "activity", params], queryFn: () => getMonitoringActivity(params), enabled, staleTime: 20_000, refetchInterval: 45_000, refetchOnWindowFocus: false });
}

export function useMonitoringDiagnostics(enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "diagnostics"], queryFn: getMonitoringDiagnostics, enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useRouterHealthSummary(enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "routers", "summary"], queryFn: getRouterHealthSummary, enabled, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useUnhealthyRouters(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "routers", "unhealthy", params], queryFn: () => getUnhealthyRouters(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useOfflineRouters(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "routers", "offline", params], queryFn: () => getOfflineRouters(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useProvisioningIssueRouters(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "routers", "provisioning", params], queryFn: () => getProvisioningIssueRouters(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useStaleRouters(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "routers", "stale", params], queryFn: () => getStaleRouters(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useVpnServerHealthSummary(enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "vpn-servers", "summary"], queryFn: getVpnServerHealthSummary, enabled, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useUnhealthyVpnServers(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "vpn-servers", "unhealthy", params], queryFn: () => getUnhealthyVpnServers(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useOverloadedVpnServers(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "vpn-servers", "overloaded", params], queryFn: () => getOverloadedVpnServers(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useStaleVpnServers(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "vpn-servers", "stale", params], queryFn: () => getStaleVpnServers(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function usePeerHealthSummary(enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "peers", "summary"], queryFn: getPeerHealthSummary, enabled, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useStalePeers(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "peers", "stale", params], queryFn: () => getStalePeers(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useUnhealthyPeers(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "peers", "unhealthy", params], queryFn: () => getUnhealthyPeers(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useTrafficSummary(enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "traffic", "summary"], queryFn: getTrafficSummary, enabled, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useTrafficTrends(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "traffic", "trends", params], queryFn: () => getTrafficTrends(params), enabled, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useTopTrafficRouters(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "traffic", "top-routers", params], queryFn: () => getTopTrafficRouters(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useTopTrafficServers(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "traffic", "top-servers", params], queryFn: () => getTopTrafficServers(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useCustomerImpact(enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "customers", "impact"], queryFn: getCustomerImpactSummary, enabled, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useAffectedCustomers(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "customers", "affected", params], queryFn: () => getAffectedCustomers(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useProvisioningSummary(enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "provisioning", "summary"], queryFn: getProvisioningSummary, enabled, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useProvisioningTrends(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "provisioning", "trends", params], queryFn: () => getProvisioningTrends(params), enabled, staleTime: 30_000, refetchOnWindowFocus: false });
}

export function useProvisioningFailures(params?: MonitoringFilterState, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "provisioning", "failures", params], queryFn: () => getProvisioningFailures(params), enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

export function useIncidents(params?: MonitoringFilterState, enabled = true) {
  const shouldPoll = !params?.status || String(params.status).includes("open");
  return useQuery({ queryKey: [...monitoringBase, "incidents", params], queryFn: () => getIncidents(params), enabled, staleTime: 20_000, refetchInterval: shouldPoll ? 30_000 : undefined, refetchOnWindowFocus: false });
}

export function useIncident(id: string, enabled = true) {
  return useQuery({ queryKey: [...monitoringBase, "incident", id], queryFn: () => getIncidentById(id), enabled: Boolean(id) && enabled, staleTime: 20_000, refetchOnWindowFocus: false });
}

function useMonitoringIncidentMutation<TArgs extends unknown[]>(mutationFn: (...args: TArgs) => Promise<{ message?: string }>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async (result, variables) => {
      const id = variables[0] ? String(variables[0]) : "";
      toast.success(result?.message || successMessage);
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
