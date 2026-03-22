import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { DhcpLease, NetworkInterface, WirelessClient } from "@/features/network-config/types/network-config.types";

export async function getDhcpLeases(routerId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: DhcpLease[] }>(endpoints.admin.routerDhcpLeases(routerId));
  return data.data || [];
}

export async function makeStaticLease(routerId: string, leaseId: string) {
  const { data } = await apiClient.post<{ success: boolean; data: { message: string } }>(`${endpoints.admin.routerDhcpLease(routerId, leaseId)}/make-static`);
  return data.data;
}

export async function deleteLease(routerId: string, leaseId: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(endpoints.admin.routerDhcpLease(routerId, leaseId));
  return data.data;
}

export async function getWirelessClients(routerId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: WirelessClient[] }>(endpoints.admin.routerWirelessClients(routerId));
  return data.data || [];
}

export async function getNetworkInterfaces(routerId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: NetworkInterface[] }>(endpoints.admin.routerInterfaces(routerId));
  return data.data || [];
}

export async function setInterfaceEnabled(routerId: string, name: string, enabled: boolean) {
  const suffix = enabled ? "enable" : "disable";
  const { data } = await apiClient.post<{ success: boolean; data: { message: string } }>(`${endpoints.admin.routerInterfaces(routerId)}/${encodeURIComponent(name)}/${suffix}`);
  return data.data;
}
