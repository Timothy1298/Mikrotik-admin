import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ClientPingResult,
  CreateVpnClientPayload,
  UpdateVpnClientPayload,
  VpnClientDetail,
  VpnClientListResponse,
  VpnClientQuery,
} from "@/features/vpn-clients/types/vpn-client.types";

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function getVpnClients(params: VpnClientQuery = {}) {
  const { data } = await apiClient.get<{ success: boolean } & VpnClientListResponse>(endpoints.clients, { params });
  return {
    items: data.clients || [],
    pagination: data.pagination,
  };
}

export async function getVpnClientByName(name: string, includePrivateKey = true) {
  const { data } = await apiClient.get<{ success: boolean; data: VpnClientDetail }>(endpoints.clientDetail(name), {
    params: { includePrivateKey: includePrivateKey ? "true" : "false" },
  });
  return data.data;
}

export async function createVpnClient(payload: CreateVpnClientPayload) {
  const { data } = await apiClient.post<{ success: boolean; message: string; data: VpnClientDetail }>(endpoints.createClient, payload);
  return data;
}

export async function updateVpnClient(name: string, payload: UpdateVpnClientPayload) {
  const { data } = await apiClient.put<{ success: boolean; message: string }>(endpoints.updateClient(name), payload);
  return data;
}

export async function regenerateVpnClientKeys(name: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; data: { publicKey: string; privateKey: string } }>(endpoints.regenerateClientKeys(name));
  return data;
}

export async function enableVpnClient(name: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.enableClient(name));
  return data;
}

export async function disableVpnClient(name: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.disableClient(name));
  return data;
}

export async function deleteVpnClient(name: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.deleteClient(name));
  return data;
}

export async function bulkDeleteVpnClients(names: string[]) {
  const { data } = await apiClient.post<{ success: boolean; message: string; deleted: number }>(endpoints.bulkDeleteClients, { names });
  return data;
}

export async function pingVpnClient(name: string, target?: string) {
  const { data } = await apiClient.post<ClientPingResult>(endpoints.pingClient(name), { target });
  return data;
}

export async function downloadVpnClientConfig(name: string) {
  const { data } = await apiClient.get<string>(endpoints.clientConfig(name), { responseType: "text" as never });
  downloadText(`${name}.conf`, data);
}

export async function downloadVpnClientAutoconfig(name: string) {
  const { data } = await apiClient.get<string>(endpoints.clientAutoconfig(name), { responseType: "text" as never });
  downloadText(`${name}-autoconfig.rsc`, data);
}

export async function downloadVpnClientMikrotik(name: string) {
  const { data } = await apiClient.get<string>(endpoints.clientMikrotikScript(name), { responseType: "text" as never });
  downloadText(`${name}.rsc`, data);
}
