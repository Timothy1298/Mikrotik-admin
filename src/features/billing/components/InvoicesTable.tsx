import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/Button";
import { InvoiceStatusBadge } from "@/features/billing/components/InvoiceStatusBadge";
import type { BillingTransaction } from "@/features/billing/types/billing.types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";

export function InvoicesTable({ rows, onOpen, onDownloadPdf }: { rows: BillingTransaction[]; onOpen: (row: BillingTransaction) => void; onDownloadPdf?: (row: BillingTransaction) => void }) {
  const columns = useMemo<ColumnDef<BillingTransaction>[]>(() => [
    { header: "Invoice", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.transactionId}</p><p className="text-xs text-slate-500">{row.original.description}</p></div> },
    { header: "Account", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.account?.name || "Unknown"}</span> },
    { header: "Amount", cell: ({ row }) => <span className="text-sm text-slate-200">{formatCurrency(row.original.amount, row.original.currency || "USD")}</span> },
    { header: "Status", cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} /> },
    { header: "Due", cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{formatDateTime(row.original.dueDate)}</span> },
    { header: "Created", cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{formatDateTime(row.original.createdAt)}</span> },
    ...(onDownloadPdf ? [{ header: "PDF", cell: ({ row }: { row: { original: BillingTransaction } }) => <Button variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); onDownloadPdf(row.original); }}>Download</Button> }] : []),
  ], [onDownloadPdf]);
  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No invoices found" emptyDescription="No invoices matched the current filters." />;
}
