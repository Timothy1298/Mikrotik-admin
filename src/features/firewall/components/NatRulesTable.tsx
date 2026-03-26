import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import type { NatRule } from "@/features/firewall/types/firewall.types";

export function NatRulesTable({
  rows,
  onAddRule,
  onEditRule,
  onDeleteRule,
  isLoading,
}: {
  rows: NatRule[];
  onAddRule: () => void;
  onEditRule: (rule: NatRule) => void;
  onDeleteRule: (rule: NatRule) => void;
  isLoading?: boolean;
}) {
  const columns = useMemo<ColumnDef<NatRule>[]>(() => [
    { header: "Chain", cell: ({ row }) => <span className="font-mono text-sm text-text-primary">{row.original.chain || "-"}</span> },
    { header: "Action", cell: ({ row }) => <span>{row.original.action || "-"}</span> },
    { header: "Protocol", cell: ({ row }) => <span>{row.original.protocol || "any"}</span> },
    { header: "Dst Port", cell: ({ row }) => <span className="font-mono text-xs">{row.original.dstPort || "-"}</span> },
    { header: "To Address", cell: ({ row }) => <span className="font-mono text-xs">{row.original.toAddresses || "-"}</span> },
    { header: "To Port", cell: ({ row }) => <span className="font-mono text-xs">{row.original.toPorts || "-"}</span> },
    { header: "Comment", cell: ({ row }) => <span>{row.original.comment || "No comment"}</span> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown items={[{ label: "Edit", onClick: () => onEditRule(row.original) }, { label: "Delete", onClick: () => onDeleteRule(row.original), danger: true }]} />
      ),
    },
  ], [onDeleteRule, onEditRule]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={onAddRule}>Add NAT rule</Button>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        emptyTitle="No NAT rules found"
        emptyDescription="Add srcnat or dstnat rules to manage address translation on this router."
      />
    </div>
  );
}
