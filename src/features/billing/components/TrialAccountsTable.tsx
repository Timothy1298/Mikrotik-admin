import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { Dropdown } from "@/components/ui/Dropdown";
import type { BillingTrialRow } from "@/features/billing/types/billing.types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";

export function TrialAccountsTable({ rows, onOpen, onExtendTrial }: { rows: BillingTrialRow[]; onOpen: (row: BillingTrialRow) => void; onExtendTrial: (row: BillingTrialRow) => void }) {
  const columns = useMemo<ColumnDef<BillingTrialRow>[]>(() => [
    { header: "Account", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.name}</p><p className="text-xs text-slate-500">{row.original.email}</p></div> },
    { header: "Trial ends", cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{formatDateTime(row.original.trialEndsAt)}</span> },
    { header: "Ending soon", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.trialEndingSoon ? "Yes" : "No"}</span> },
    { header: "Trial subscriptions", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.subscriptionsOnTrial}</span> },
    { header: "Estimated value", cell: ({ row }) => <span className="text-sm text-slate-200">{formatCurrency(row.original.estimatedRecurringValue, "USD")}</span> },
    { header: "Actions", cell: ({ row }) => <Dropdown items={[{ label: "Open details", onClick: () => onOpen(row.original) }, { label: "Extend trial", onClick: () => onExtendTrial(row.original) }]} /> },
  ], [onExtendTrial, onOpen]);
  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No trial accounts found" emptyDescription="No trial accounts matched the current filters." />;
}
