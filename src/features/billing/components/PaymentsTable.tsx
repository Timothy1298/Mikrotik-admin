import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { PaymentStatusBadge } from "@/features/billing/components/PaymentStatusBadge";
import type { BillingTransaction } from "@/features/billing/types/billing.types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";

export function PaymentsTable({ rows, onOpen }: { rows: BillingTransaction[]; onOpen: (row: BillingTransaction) => void }) {
  const columns = useMemo<ColumnDef<BillingTransaction>[]>(() => [
    { header: "Payment", cell: ({ row }) => <div><p className="font-medium text-text-primary">{row.original.transactionId}</p><p className="text-xs text-text-muted">{row.original.paymentMethod || row.original.description}</p></div> },
    { header: "Account", cell: ({ row }) => <span className="text-sm text-text-primary">{row.original.account?.name || "Unknown"}</span> },
    { header: "Amount", cell: ({ row }) => <span className="text-sm text-text-primary">{formatCurrency(row.original.amount, row.original.currency || "USD")}</span> },
    { header: "Status", cell: ({ row }) => <PaymentStatusBadge status={row.original.status} /> },
    { header: "Settled", cell: ({ row }) => <span className="font-mono text-xs text-text-secondary">{formatDateTime(row.original.settledAt)}</span> },
    { header: "Failure", cell: ({ row }) => <span className="text-xs text-text-secondary">{row.original.failureReason || "None"}</span> },
  ], []);
  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No payments found" emptyDescription="No payments matched the current filters." />;
}
