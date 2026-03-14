import { appRoutes } from "@/config/routes";
import type { BillingSection } from "@/features/billing/types/billing.types";

export const billingSections: Record<BillingSection, { title: string; description: string; route: string; emptyTitle: string; emptyDescription: string }> = {
  subscriptions: {
    title: "Subscriptions",
    description: "Search and operate on billing-relevant subscription and account state across the platform.",
    route: appRoutes.billingSubscriptions,
    emptyTitle: "No subscriptions found",
    emptyDescription: "No subscriptions matched the current filters.",
  },
  trials: {
    title: "Trial Accounts",
    description: "Trial lifecycle tracking, days remaining, conversion pressure, and extension actions.",
    route: appRoutes.billingTrials,
    emptyTitle: "No trial accounts found",
    emptyDescription: "No trial accounts matched the current filters.",
  },
  "active-paid": {
    title: "Active Paid",
    description: "Current paid accounts with recurring value, next billing dates, and payment health context.",
    route: appRoutes.billingActivePaid,
    emptyTitle: "No active paid accounts found",
    emptyDescription: "No active paid subscriptions matched the current filters.",
  },
  "overdue-risk": {
    title: "Overdue & Risk",
    description: "Overdue, failed-payment, grace-period, and suspension-risk billing follow-up queues.",
    route: appRoutes.billingOverdueRisk,
    emptyTitle: "No overdue or risk accounts found",
    emptyDescription: "No accounts currently match the selected billing risk criteria.",
  },
  invoices: {
    title: "Invoices",
    description: "Invoice visibility across account, status, amount, due date, and payment relationship.",
    route: appRoutes.billingInvoices,
    emptyTitle: "No invoices found",
    emptyDescription: "No invoices matched the current filters.",
  },
  payments: {
    title: "Payments",
    description: "Payment history, failures, settlement state, and linked billing account visibility.",
    route: appRoutes.billingPayments,
    emptyTitle: "No payments found",
    emptyDescription: "No payments matched the current filters.",
  },
  entitlements: {
    title: "Entitlements",
    description: "Service entitlement visibility derived from real billing and subscription state.",
    route: appRoutes.billingEntitlements,
    emptyTitle: "No entitlement records found",
    emptyDescription: "No billing accounts matched the current entitlement filters.",
  },
  activity: {
    title: "Billing Activity",
    description: "Billing-related event timeline across subscriptions, invoices, payments, and admin actions.",
    route: appRoutes.billingActivity,
    emptyTitle: "No billing activity found",
    emptyDescription: "No billing activity matched the selected filters.",
  },
  "notes-flags": {
    title: "Notes / Flags",
    description: "Accounts under follow-up, manual review, or internal billing watch.",
    route: appRoutes.billingNotesFlags,
    emptyTitle: "No flagged billing accounts found",
    emptyDescription: "No note or flag-focused billing accounts matched the current filters.",
  },
};
