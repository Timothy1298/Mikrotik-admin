import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  CreateRouterPayload,
  CreateRouterResponse,
  RouterCommandResult,
  RouterConnectivityDetail,
  RouterDiagnostics,
  RouterDownstreamDiscoveryRun,
  RouterApiConnectionTest,
  RouterDetail,
  RouterDirectoryResponse,
  RouterDirectoryStats,
  RouterInterface,
  RouterLiveHealth,
  RouterMonitoringDetail,
  RouterDiscoveryImportPayload,
  RouterDiscoveryImportResult,
  RouterDiscoveryScanPayload,
  RouterDiscoverySession,
  RouterDiscoveryVerifyPayload,
  RouterOnboardingClaim,
  RouterOnboardingClaimCreateResponse,
  RouterOnboardingClaimPayload,
  RouterPingResult,
  RouterPortsDetail,
  RouterProvisioningDetail,
  RouterQuery,
  RouterMetricPoint,
  RouterNotesDetail,
  RouterFlagsDetail,
  RouterManagementPolicyProfile,
  TrackRuntimePeerResult,
} from "@/features/routers/types/router.types";

export async function getRouters(params: RouterQuery) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterDirectoryResponse["items"]; pagination: RouterDirectoryResponse["pagination"] }>(endpoints.admin.routers, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getRouterStats() {
  const { data } = await apiClient.get<{ success: boolean; stats: RouterDirectoryStats }>(endpoints.admin.routerStats);
  return data.stats;
}

export async function getRouterById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: RouterDetail }>(endpoints.admin.routerDetail(id));
  return data.data;
}

export async function getRouterConnectivity(id: string) {
  const { data } = await apiClient.get<{ success: boolean; connectivity: RouterConnectivityDetail }>(endpoints.admin.routerConnectivity(id));
  return data.connectivity;
}

export async function getRouterActivity(id: string, params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterDetail["recentActivity"]; pagination: RouterDirectoryResponse["pagination"] }>(endpoints.admin.routerActivity(id), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function createRouterAdmin(payload: CreateRouterPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: CreateRouterResponse }>(endpoints.admin.createRouter, payload);
  return data.data;
}

export async function getRouterOnboardingClaims(params?: { status?: string }) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterOnboardingClaim[] }>(endpoints.admin.routerOnboardingClaims, { params });
  return data.items || [];
}

export async function createRouterOnboardingClaim(payload: RouterOnboardingClaimPayload) {
  const { data } = await apiClient.post<{ success: boolean } & RouterOnboardingClaimCreateResponse>(endpoints.admin.routerOnboardingClaims, payload);
  return {
    claim: data.claim,
    token: data.token,
    callbackUrl: data.callbackUrl,
    bootstrapScript: data.bootstrapScript,
  };
}

export async function startRouterDiscoveryScan(payload?: RouterDiscoveryScanPayload) {
  const { data } = await apiClient.post<{ success: boolean; session: RouterDiscoverySession }>(
    endpoints.admin.routerDiscoveryScan,
    payload || {},
    { timeout: 60_000 },
  );
  return data.session;
}

export async function getRouterDiscoveryResults(sessionId?: string) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterDiscoverySession[] }>(endpoints.admin.routerDiscoveryResults, { params: sessionId ? { sessionId } : undefined });
  return data.items || [];
}

export async function verifyDiscoveredRouter(payload: RouterDiscoveryVerifyPayload) {
  const { data } = await apiClient.post<{ success: boolean; session: RouterDiscoverySession; candidate: RouterDiscoverySession["candidates"][number] }>(endpoints.admin.routerDiscoveryVerify, payload);
  return data;
}

export async function importDiscoveredRouter(payload: RouterDiscoveryImportPayload) {
  const { data } = await apiClient.post<{ success: boolean } & RouterDiscoveryImportResult>(endpoints.admin.routerDiscoveryImport, payload);
  return data;
}

export async function adoptRouterOnboardingClaim(id: string, payload?: { name?: string; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string; router: CreateRouterResponse; claim: RouterOnboardingClaim }>(endpoints.admin.routerOnboardingClaimAdopt(id), payload || {});
  return data;
}

export async function cancelRouterOnboardingClaim(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; claim: RouterOnboardingClaim }>(endpoints.admin.routerOnboardingClaimCancel(id), { reason });
  return data;
}

export async function disableRouter(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.disableRouter(id), { reason });
  return data;
}

export async function reactivateRouter(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.reactivateRouter(id), { reason });
  return data;
}

export async function reprovisionRouter(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.reprovisionRouter(id), { reason });
  return data;
}

export async function regenerateRouterSetup(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; artifacts?: Record<string, unknown> }>(endpoints.admin.regenerateRouterSetup(id), { reason });
  return data;
}

export async function resetRouterPeer(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; artifacts?: Record<string, unknown> }>(endpoints.admin.resetRouterPeer(id), { reason });
  return data;
}

export async function reassignRouterPorts(id: string, payload: { ports?: { winbox: number; ssh: number; api: number } | null; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.reassignRouterPorts(id), payload);
  return data;
}

export async function moveRouterServer(id: string, payload: { targetServerNode: string; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message?: string }>(endpoints.admin.moveRouterServer(id), payload);
  return data;
}

export async function markRouterReviewed(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.markRouterReviewed(id), { reason });
  return data;
}

export async function rebootRouter(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.rebootRouter(id), { reason });
  return data;
}

export async function pingRouter(id: string, payload?: { address?: string; count?: number }) {
  const { data } = await apiClient.post<{ success: boolean; result?: RouterPingResult; reachable?: boolean; error?: string }>(endpoints.admin.pingRouter(id), payload || {});
  if (!data.success) {
    return { reachable: Boolean(data.reachable), error: data.error || "Ping failed" } satisfies RouterPingResult;
  }
  return data.result || { reachable: false, error: "No ping result returned" };
}

export async function runRouterCommand(id: string, payload: { command: string; reason: string }) {
  const { data } = await apiClient.post<RouterCommandResult>(endpoints.admin.runRouterCommand(id), payload);
  return data;
}

export async function getRouterInterfaces(id: string) {
  const { data } = await apiClient.get<{ success: boolean; interfaces: RouterInterface[] }>(endpoints.admin.routerInterfaces(id));
  return { interfaces: data.interfaces || [] };
}

export async function getRouterPorts(id: string) {
  const { data } = await apiClient.get<{ success: boolean; ports: RouterPortsDetail }>(endpoints.admin.routerPorts(id));
  return data.ports;
}

export async function getRouterMonitoring(id: string) {
  const { data } = await apiClient.get<{ success: boolean; monitoring: RouterMonitoringDetail }>(endpoints.admin.routerMonitoring(id));
  return data.monitoring;
}

export async function getRouterProvisioning(id: string) {
  const { data } = await apiClient.get<{ success: boolean; provisioning: RouterProvisioningDetail }>(endpoints.admin.routerProvisioning(id));
  return data.provisioning;
}

export async function getRouterDiagnostics(id: string) {
  const { data } = await apiClient.get<{ success: boolean; diagnostics: RouterDiagnostics }>(endpoints.admin.routerDiagnostics(id));
  return data.diagnostics;
}

export async function getRouterNotes(id: string) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterNotesDetail }>(endpoints.admin.routerNotes(id));
  return data.items || [];
}

export async function getRouterFlags(id: string) {
  const { data } = await apiClient.get<{ success: boolean; items: RouterFlagsDetail }>(endpoints.admin.routerFlags(id));
  return data.items || [];
}

export async function getRouterLiveHealth(id: string) {
  const { data } = await apiClient.get<{ success: boolean; health: RouterLiveHealth }>(endpoints.admin.routerLiveHealth(id));
  return data.health;
}

export async function getRouterMetrics(id: string, hours = 24) {
  const { data } = await apiClient.get<{ success: boolean; metrics: RouterMetricPoint[]; routerId: string }>(endpoints.admin.routerMetrics(id), { params: { hours } });
  return data.metrics || [];
}

export async function setRouterCredentials(id: string, payload: { apiUsername: string; apiPassword?: string; apiPort: number; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string; data: { apiUsername: string; apiPort: number; hasPassword: boolean } }>(endpoints.admin.routerSetCredentials(id), payload);
  return data;
}

export async function testRouterConnection(id: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; data: RouterApiConnectionTest }>(endpoints.admin.routerTestConnection(id), { reason });
  return data.data;
}

export async function updateRouterManagementPolicy(id: string, payload: { policyProfile: Exclude<RouterManagementPolicyProfile, "custom">; reason?: string }) {
  const { data } = await apiClient.post<{
    success: boolean;
    message: string;
    data: {
      routerId: string;
      policy: RouterDetail["policy"];
    };
  }>(endpoints.admin.routerManagementPolicy(id), payload);
  return data;
}

export async function addRouterNote(id: string, payload: { body: string; category: string; pinned?: boolean; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.routerNotes(id), payload);
  return data;
}

export async function addRouterFlag(id: string, payload: { flag: string; severity: string; description?: string; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.routerFlags(id), payload);
  return data;
}

export async function removeRouterFlag(id: string, flagId: string, reason?: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.admin.removeRouterFlag(id, flagId), { data: { reason } });
  return data;
}

export async function deleteRouter(id: string, reason?: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.admin.deleteRouter(id), { data: { reason } });
  return data;
}

export async function trackRouterRuntimePeer(id: string, peerId: string, payload: { name: string; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string; data: TrackRuntimePeerResult }>(endpoints.admin.routerTrackRuntimePeer(id, peerId), payload);
  return data.data;
}

export async function discoverRouterDownstreamMikrotiks(
  id: string,
  payload?: {
    reason?: string;
    dryRun?: boolean;
    maxProbeTargets?: number;
    timeoutMs?: number;
    enableNeighborDiscovery?: boolean;
    enableRouteInspection?: boolean;
    enableSubnetProbe?: boolean;
    allowedSubnetCidrs?: string[];
    excludeCidrs?: string[];
  },
) {
  const { data } = await apiClient.post<{ success: boolean; data: RouterDownstreamDiscoveryRun }>(endpoints.admin.routerDiscoverDownstreamMikrotiks(id), payload || {});
  return data.data;
}

export async function getRouterDownstreamMikrotiks(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: RouterDownstreamDiscoveryRun }>(endpoints.admin.routerDownstreamMikrotiks(id));
  return data.data;
}
