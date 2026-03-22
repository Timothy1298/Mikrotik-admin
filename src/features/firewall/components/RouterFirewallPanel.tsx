import { useMemo, useState } from "react";
import { Ban, ListFilter, Shield } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import {
  useAddAddressListEntry,
  useAddFilterRule,
  useAddNatRule,
  useAddressLists,
  useBlockSubscriber,
  useDeleteAddressListEntry,
  useDeleteFilterRule,
  useDeleteNatRule,
  useFilterRules,
  useNatRules,
  useToggleFilterRule,
  useUpdateFilterRule,
} from "@/features/firewall/hooks/useFirewall";
import type { FilterRule, FilterRulePayload, NatRulePayload } from "@/features/firewall/types/firewall.types";
import { AddFilterRuleDialog } from "@/features/firewall/components/AddFilterRuleDialog";
import { AddNatRuleDialog } from "@/features/firewall/components/AddNatRuleDialog";
import { AddToAddressListDialog } from "@/features/firewall/components/AddToAddressListDialog";
import { AddressListTable } from "@/features/firewall/components/AddressListTable";
import { BlockSubscriberDialog } from "@/features/firewall/components/BlockSubscriberDialog";
import { FilterRulesTable } from "@/features/firewall/components/FilterRulesTable";
import { NatRulesTable } from "@/features/firewall/components/NatRulesTable";

export function RouterFirewallPanel({ routerId }: { routerId: string }) {
  const [tab, setTab] = useState<"filter" | "nat" | "address-list">("filter");
  const [filterChain, setFilterChain] = useState("");
  const [listFilter, setListFilter] = useState("");
  const [selectedRule, setSelectedRule] = useState<FilterRule | null>(null);
  const filterDialog = useDisclosure(false);
  const natDialog = useDisclosure(false);
  const addressDialog = useDisclosure(false);
  const blockDialog = useDisclosure(false);

  const filterRulesQuery = useFilterRules(routerId, filterChain);
  const natRulesQuery = useNatRules(routerId);
  const addressListsQuery = useAddressLists(routerId, listFilter);

  const addFilterMutation = useAddFilterRule(routerId);
  const updateFilterMutation = useUpdateFilterRule(routerId, selectedRule?.routerosId || "");
  const deleteFilterMutation = useDeleteFilterRule(routerId);
  const toggleFilterMutation = useToggleFilterRule(routerId);
  const addNatMutation = useAddNatRule(routerId);
  const deleteNatMutation = useDeleteNatRule(routerId);
  const addAddressMutation = useAddAddressListEntry(routerId);
  const deleteAddressMutation = useDeleteAddressListEntry(routerId);
  const blockMutation = useBlockSubscriber(routerId);

  const blockedCount = useMemo(
    () => (addressListsQuery.data || []).filter((entry) => entry.list === "blocked").length,
    [addressListsQuery.data],
  );

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Firewall</CardTitle>
          <CardDescription>Manage filter rules, NAT, address lists, and billing enforcement blocks directly on this router.</CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Filter rules</p>
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{filterRulesQuery.data?.length || 0}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">NAT rules</p>
            <ListFilter className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{natRulesQuery.data?.length || 0}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Blocked entries</p>
            <Ban className="h-4 w-4 text-danger" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-text-primary">{blockedCount}</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { label: "Filter Rules", value: "filter" },
          { label: "NAT", value: "nat" },
          { label: "Address Lists", value: "address-list" },
        ]}
        value={tab}
        onChange={(value) => setTab(value as "filter" | "nat" | "address-list")}
      />

      {filterRulesQuery.isError ? <InlineError message={filterRulesQuery.error instanceof Error ? filterRulesQuery.error.message : "Unable to load filter rules"} /> : null}
      {natRulesQuery.isError ? <InlineError message={natRulesQuery.error instanceof Error ? natRulesQuery.error.message : "Unable to load NAT rules"} /> : null}
      {addressListsQuery.isError ? <InlineError message={addressListsQuery.error instanceof Error ? addressListsQuery.error.message : "Unable to load address lists"} /> : null}

      {tab === "filter" ? (
        <FilterRulesTable
          rows={filterRulesQuery.data || []}
          activeChain={filterChain}
          onChainChange={setFilterChain}
          onAddRule={() => {
            setSelectedRule(null);
            filterDialog.onOpen();
          }}
          onEditRule={(rule) => {
            setSelectedRule(rule);
            filterDialog.onOpen();
          }}
          onDeleteRule={(rule) => {
            if (!window.confirm(`Delete filter rule ${rule.routerosId}?`)) return;
            deleteFilterMutation.mutate(rule.routerosId);
          }}
          onToggleRule={(rule, disabled) => toggleFilterMutation.mutate({ ruleId: rule.routerosId, disabled })}
          isLoading={filterRulesQuery.isPending}
        />
      ) : tab === "nat" ? (
        <NatRulesTable
          rows={natRulesQuery.data || []}
          onAddRule={natDialog.onOpen}
          onDeleteRule={(rule) => {
            if (!window.confirm(`Delete NAT rule ${rule.routerosId}?`)) return;
            deleteNatMutation.mutate(rule.routerosId);
          }}
          isLoading={natRulesQuery.isPending}
        />
      ) : (
        <AddressListTable
          rows={addressListsQuery.data || []}
          listFilter={listFilter}
          onListFilterChange={setListFilter}
          onAddEntry={addressDialog.onOpen}
          onBlockSubscriber={blockDialog.onOpen}
          onRemoveEntry={(entry) => deleteAddressMutation.mutate(entry.routerosId)}
        />
      )}

      <AddFilterRuleDialog
        open={filterDialog.open}
        loading={addFilterMutation.isPending || updateFilterMutation.isPending}
        initialRule={selectedRule}
        onClose={filterDialog.onClose}
        onConfirm={(payload: FilterRulePayload) => {
          if (selectedRule) {
            updateFilterMutation.mutate(payload, { onSuccess: () => filterDialog.onClose() });
            return;
          }
          addFilterMutation.mutate(payload, { onSuccess: () => filterDialog.onClose() });
        }}
      />

      <AddNatRuleDialog
        open={natDialog.open}
        loading={addNatMutation.isPending}
        onClose={natDialog.onClose}
        onConfirm={(payload: NatRulePayload) => addNatMutation.mutate(payload, { onSuccess: () => natDialog.onClose() })}
      />

      <AddToAddressListDialog
        open={addressDialog.open}
        loading={addAddressMutation.isPending}
        onClose={addressDialog.onClose}
        onConfirm={(payload) => addAddressMutation.mutate(payload, { onSuccess: () => addressDialog.onClose() })}
      />

      <BlockSubscriberDialog
        open={blockDialog.open}
        loading={blockMutation.isPending}
        onClose={blockDialog.onClose}
        onConfirm={(payload) => blockMutation.mutate(payload, { onSuccess: () => blockDialog.onClose() })}
      />
    </Card>
  );
}
