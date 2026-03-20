import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-display/DataTable";
import { Dropdown } from "@/components/ui/Dropdown";
import { BillingRiskBadge } from "@/features/billing/components/BillingRiskBadge";
import { SubscriptionStatusBadge } from "@/features/billing/components/SubscriptionStatusBadge";
import type { BillingSubscriptionRow } from "@/features/billing/types/billing.types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";

export function SubscriptionsTable({
  rows,
  onOpen,
  onExtendTrial,
  onMarkReviewed,
  onSuspend,
  onReactivate,
  onResendInvoice,
  onApplyGrace,
  onRemoveGrace,
  onRecordPayment,
  onCreateInvoice,
  onIssueRefund,
  onAddNote,
  onAddFlag,
}: {
  rows: BillingSubscriptionRow[];
  onOpen: (row: BillingSubscriptionRow) => void;
  onExtendTrial: (row: BillingSubscriptionRow) => void;
  onMarkReviewed: (row: BillingSubscriptionRow) => void;
  onSuspend: (row: BillingSubscriptionRow) => void;
  onReactivate: (row: BillingSubscriptionRow) => void;
  onResendInvoice: (row: BillingSubscriptionRow) => void;
  onApplyGrace: (row: BillingSubscriptionRow) => void;
  onRemoveGrace: (row: BillingSubscriptionRow) => void;
  onRecordPayment?: (row: BillingSubscriptionRow) => void;
  onCreateInvoice?: (row: BillingSubscriptionRow) => void;
  onIssueRefund?: (row: BillingSubscriptionRow) => void;
  onAddNote: (row: BillingSubscriptionRow) => void;
  onAddFlag: (row: BillingSubscriptionRow) => void;
}) {
  const columns = useMemo<ColumnDef<BillingSubscriptionRow>[]>(() => [
    { header: "Account", cell: ({ row }) => <div><p className="font-medium text-slate-100">{row.original.account?.name || "Unknown"}</p><p className="text-xs text-slate-500">{row.original.account?.email}</p></div> },
    { header: "Plan", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.planName}</span> },
    { header: "Subscription", cell: ({ row }) => <SubscriptionStatusBadge status={row.original.subscriptionStatus} /> },
    { header: "Trial", cell: ({ row }) => <SubscriptionStatusBadge status={row.original.trialStatus} /> },
    { header: "Billable routers", cell: ({ row }) => <span className="text-sm text-slate-200">{row.original.billableRouterCount}</span> },
    { header: "Recurring", cell: ({ row }) => <span className="text-sm text-slate-200">{formatCurrency(row.original.priceSummary, row.original.account?.currency || "USD")}</span> },
    { header: "Next billing", cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{formatDateTime(row.original.nextBillingDate)}</span> },
    { header: "Risk", cell: ({ row }) => <BillingRiskBadge overdue={row.original.overdue} /> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Dropdown items={[
          { label: "Open details", onClick: () => onOpen(row.original) },
          { label: "Extend trial", onClick: () => onExtendTrial(row.original) },
          { label: "Mark reviewed", onClick: () => onMarkReviewed(row.original) },
          { label: "Suspend account", onClick: () => onSuspend(row.original), danger: true },
          { label: "Reactivate account", onClick: () => onReactivate(row.original) },
          { label: "Resend invoice", onClick: () => onResendInvoice(row.original) },
          { label: "Apply grace period", onClick: () => onApplyGrace(row.original) },
          { label: "Remove grace period", onClick: () => onRemoveGrace(row.original) },
          ...(onRecordPayment ? [{ label: "Record payment", onClick: () => onRecordPayment(row.original) }] : []),
          ...(onCreateInvoice ? [{ label: "Create invoice", onClick: () => onCreateInvoice(row.original) }] : []),
          ...(onIssueRefund ? [{ label: "Issue refund", onClick: () => onIssueRefund(row.original) }] : []),
          { label: "Add note", onClick: () => onAddNote(row.original) },
          { label: "Flag account", onClick: () => onAddFlag(row.original) },
        ]} />
      ),
    },
  ], [onAddFlag, onAddNote, onApplyGrace, onCreateInvoice, onExtendTrial, onIssueRefund, onMarkReviewed, onOpen, onReactivate, onRecordPayment, onRemoveGrace, onResendInvoice, onSuspend]);

  return <DataTable data={rows} columns={columns} onRowClick={onOpen} emptyTitle="No subscriptions found" emptyDescription="No subscriptions matched the current filters." />;
}
