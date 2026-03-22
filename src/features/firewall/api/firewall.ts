import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  AddressListEntry,
  AddressListPayload,
  BlockSubscriberPayload,
  FilterRule,
  FilterRulePayload,
  NatRule,
  NatRulePayload,
} from "@/features/firewall/types/firewall.types";

export async function getFilterRules(routerId: string, chain = "") {
  const { data } = await apiClient.get<{ success: boolean; data: FilterRule[] }>(endpoints.admin.firewallFilter(routerId), {
    params: chain ? { chain } : undefined,
  });
  return data.data || [];
}

export async function addFilterRule(routerId: string, payload: FilterRulePayload) {
  const { data } = await apiClient.post<{ success: boolean; data: { message: string } }>(endpoints.admin.firewallFilter(routerId), payload);
  return data.data;
}

export async function updateFilterRule(routerId: string, ruleId: string, payload: Partial<FilterRulePayload>) {
  const { data } = await apiClient.put<{ success: boolean; data: { message: string } }>(endpoints.admin.firewallFilterRule(routerId, ruleId), payload);
  return data.data;
}

export async function deleteFilterRule(routerId: string, ruleId: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(endpoints.admin.firewallFilterRule(routerId, ruleId));
  return data.data;
}

export async function toggleFilterRule(routerId: string, ruleId: string, disabled: boolean) {
  const { data } = await apiClient.post<{ success: boolean; data: { message: string } }>(endpoints.admin.firewallFilterToggle(routerId, ruleId), { disabled });
  return data.data;
}

export async function getNatRules(routerId: string) {
  const { data } = await apiClient.get<{ success: boolean; data: NatRule[] }>(endpoints.admin.firewallNat(routerId));
  return data.data || [];
}

export async function addNatRule(routerId: string, payload: NatRulePayload) {
  const { data } = await apiClient.post<{ success: boolean; data: { message: string } }>(endpoints.admin.firewallNat(routerId), payload);
  return data.data;
}

export async function deleteNatRule(routerId: string, ruleId: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(endpoints.admin.firewallNatRule(routerId, ruleId));
  return data.data;
}

export async function getAddressLists(routerId: string, listName = "") {
  const { data } = await apiClient.get<{ success: boolean; data: AddressListEntry[] }>(endpoints.admin.firewallAddressList(routerId), {
    params: listName ? { list: listName } : undefined,
  });
  return data.data || [];
}

export async function addAddressListEntry(routerId: string, payload: AddressListPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: { message: string } }>(endpoints.admin.firewallAddressList(routerId), payload);
  return data.data;
}

export async function deleteAddressListEntry(routerId: string, entryId: string) {
  const { data } = await apiClient.delete<{ success: boolean; data: { message: string } }>(endpoints.admin.firewallAddressListEntry(routerId, entryId));
  return data.data;
}

export async function blockSubscriber(routerId: string, payload: BlockSubscriberPayload) {
  const { data } = await apiClient.post<{ success: boolean; data: { message: string } }>(endpoints.admin.firewallBlock(routerId), payload);
  return data.data;
}

export async function unblockSubscriber(routerId: string, ipAddress: string) {
  const { data } = await apiClient.post<{ success: boolean; data: { message: string; removed: number } }>(endpoints.admin.firewallUnblock(routerId), { ipAddress });
  return data.data;
}
