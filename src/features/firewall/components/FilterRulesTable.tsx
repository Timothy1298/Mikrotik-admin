import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Plus } from "lucide-react";
import { DataTable } from "@/components/data-display/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { Switch } from "@/components/ui/Switch";
import { Tabs } from "@/components/ui/Tabs";
import type { FilterRule } from "@/features/firewall/types/firewall.types";

function actionTone(action: string) {
  if (action === "accept") return "success";
  if (action === "drop") return "danger";
  if (action === "reject") return "warning";
  return "neutral";
}

export function FilterRulesTable({
  rows,
  activeChain,
  onChainChange,
  onAddRule,
  onEditRule,
  onDeleteRule,
  onToggleRule,
  isLoading,
}: {
  rows: FilterRule[];
  activeChain: string;
  onChainChange: (value: string) => void;
  onAddRule: () => void;
  onEditRule: (rule: FilterRule) => void;
  onDeleteRule: (rule: FilterRule) => void;
  onToggleRule: (rule: FilterRule, disabled: boolean) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<FilterRule>[]>(() => [
    { header: "Chain", cell: ({ row }) => <span className="font-mono text-sm text-text-primary">{row.original.chain || "-"}</span> },
    { header: "Action", cell: ({ row }) => <Badge tone={actionTone(row.original.action)}>{row.original.action || "rule"}</Badge> },
    { header: "Protocol", cell: ({ row }) => <span>{row.original.protocol || "any"}</span> },
    { header: "Source", cell: ({ row }) => <span className="font-mono text-xs">{row.original.srcAddress || "Any"}</span> },
    { header: "Destination", cell: ({ row }) => <span className="font-mono text-xs">{row.original.dstAddress || "Any"}{row.original.dstPort ? `:${row.original.dstPort}` : ""}</span> },
    { header: "Comment", cell: ({ row }) => <span>{row.original.comment || "No comment"}</span> },
    {
      header: "Enabled",
      cell: ({ row }) => (
        <Switch
          checked={!row.original.disabled}
          label={!row.original.disabled ? "On" : "Off"}
          onClick={() => onToggleRule(row.original, !row.original.disabled)}
        />
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown
          items={[
            { label: "Edit", onClick: () => onEditRule(row.original) },
            { label: "Delete", onClick: () => onDeleteRule(row.original), danger: true },
          ]}
        />
      ),
    },
  ], [onDeleteRule, onEditRule, onToggleRule]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          tabs={[
            { label: "All", value: "" },
            { label: "Input", value: "input" },
            { label: "Forward", value: "forward" },
            { label: "Output", value: "output" },
          ]}
          value={activeChain}
          onChange={onChainChange}
        />
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={onAddRule}>Add filter rule</Button>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        emptyTitle="No filter rules found"
        emptyDescription="Create firewall filter rules to allow, drop, or reject router traffic."
      />
      <div className="flex items-center gap-2 rounded-2xl border border-danger/20 bg-danger/5 p-3 text-sm text-text-secondary">
        <Ban className="h-4 w-4 text-danger" />
        Billing enforcement uses the router `blocked` address list. Add drop rules on the router that reference that list if you want traffic actually denied.
      </div>
    </div>
  );
}
