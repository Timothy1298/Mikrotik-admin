import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  addAddressListEntry,
  addFilterRule,
  addNatRule,
  blockSubscriber,
  deleteAddressListEntry,
  deleteFilterRule,
  deleteNatRule,
  getAddressLists,
  getFilterRules,
  getNatRules,
  toggleFilterRule,
  unblockSubscriber,
  updateFilterRule,
  updateNatRule,
} from "@/features/firewall/api/firewall";
import type {
  AddressListPayload,
  BlockSubscriberPayload,
  FilterRulePayload,
  NatRulePayload,
} from "@/features/firewall/types/firewall.types";

function invalidateFirewall(queryClient: ReturnType<typeof useQueryClient>, routerId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["routers", routerId, "firewall"] }),
    queryClient.invalidateQueries({ queryKey: queryKeys.routerDetail(routerId) }),
  ]);
}

export function useFilterRules(routerId: string, chain = "") {
  return useQuery({
    queryKey: queryKeys.firewallFilterRules(routerId, chain),
    queryFn: () => getFilterRules(routerId, chain),
    enabled: Boolean(routerId),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useNatRules(routerId: string) {
  return useQuery({
    queryKey: queryKeys.firewallNatRules(routerId),
    queryFn: () => getNatRules(routerId),
    enabled: Boolean(routerId),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useAddressLists(routerId: string, listName = "") {
  return useQuery({
    queryKey: queryKeys.firewallAddressLists(routerId, listName),
    queryFn: () => getAddressLists(routerId, listName),
    enabled: Boolean(routerId),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useAddFilterRule(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FilterRulePayload) => addFilterRule(routerId, payload),
    onSuccess: async () => {
      toast.success("Filter rule added");
      await invalidateFirewall(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to add filter rule"),
  });
}

export function useUpdateFilterRule(routerId: string, ruleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<FilterRulePayload>) => updateFilterRule(routerId, ruleId, payload),
    onSuccess: async () => {
      toast.success("Filter rule updated");
      await invalidateFirewall(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update filter rule"),
  });
}

export function useDeleteFilterRule(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => deleteFilterRule(routerId, ruleId),
    onSuccess: async () => {
      toast.success("Filter rule removed");
      await invalidateFirewall(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to remove filter rule"),
  });
}

export function useToggleFilterRule(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, disabled }: { ruleId: string; disabled: boolean }) => toggleFilterRule(routerId, ruleId, disabled),
    onSuccess: async (_, variables) => {
      toast.success(variables.disabled ? "Rule disabled" : "Rule enabled");
      await invalidateFirewall(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to toggle filter rule"),
  });
}

export function useAddNatRule(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NatRulePayload) => addNatRule(routerId, payload),
    onSuccess: async () => {
      toast.success("NAT rule added");
      await invalidateFirewall(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to add NAT rule"),
  });
}

export function useDeleteNatRule(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => deleteNatRule(routerId, ruleId),
    onSuccess: async () => {
      toast.success("NAT rule removed");
      await invalidateFirewall(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to remove NAT rule"),
  });
}

export function useUpdateNatRule(routerId: string, ruleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NatRulePayload) => updateNatRule(routerId, ruleId, payload),
    onSuccess: async () => {
      toast.success("NAT rule updated");
      await invalidateFirewall(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update NAT rule"),
  });
}

export function useAddAddressListEntry(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressListPayload) => addAddressListEntry(routerId, payload),
    onSuccess: async () => {
      toast.success("Address list entry added");
      await invalidateFirewall(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to add address list entry"),
  });
}

export function useDeleteAddressListEntry(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => deleteAddressListEntry(routerId, entryId),
    onSuccess: async () => {
      toast.success("Address list entry removed");
      await invalidateFirewall(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to remove address list entry"),
  });
}

export function useBlockSubscriber(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BlockSubscriberPayload) => blockSubscriber(routerId, payload),
    onSuccess: async () => {
      toast.success("Subscriber blocked on router");
      await invalidateFirewall(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to block subscriber"),
  });
}

export function useUnblockSubscriber(routerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ipAddress: string) => unblockSubscriber(routerId, ipAddress),
    onSuccess: async () => {
      toast.success("Subscriber unblocked");
      await invalidateFirewall(queryClient, routerId);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to unblock subscriber"),
  });
}
