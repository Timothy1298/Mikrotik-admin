import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { BillingFilterState, BillingSection } from "@/features/billing/types/billing.types";

export function BillingFilters({ section, filters, onChange }: { section: BillingSection; filters: BillingFilterState; onChange: (patch: Partial<BillingFilterState>) => void }) {
  const showPaymentMethod = section === "payments";
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <Input placeholder="Search accounts, subscriptions, invoices, or payments..." value={filters.q || ""} onChange={(event) => onChange({ q: event.target.value, page: 1 })} />
      <Select value={filters.window || "30d"} onChange={(event) => onChange({ window: event.target.value })} options={[{ label: "Last 7 days", value: "7d" }, { label: "Last 30 days", value: "30d" }, { label: "Last 90 days", value: "90d" }]} />
      <Select
        value={filters.status || filters.subscriptionStatus || ""}
        onChange={(event) => onChange(section === "subscriptions" || section === "active-paid" || section === "overdue-risk" ? { subscriptionStatus: event.target.value || undefined } : { status: event.target.value || undefined })}
        options={[
          { label: "All statuses", value: "" },
          { label: "Active", value: "active" },
          { label: "Trial", value: "trial" },
          { label: "Past due", value: "past_due" },
          { label: "Pending", value: "pending" },
          { label: "Completed", value: "completed" },
          { label: "Failed", value: "failed" },
        ]}
      />
      <Select
        value={filters.type || filters.source || ""}
        onChange={(event) => onChange(section === "activity" ? { source: event.target.value || undefined } : { type: event.target.value || undefined })}
        options={section === "activity"
          ? [
              { label: "All sources", value: "" },
              { label: "Billing", value: "billing" },
              { label: "Invoice", value: "invoice" },
              { label: "Payment", value: "payment" },
              { label: "Admin", value: "admin" },
            ]
          : [
              { label: "All types", value: "" },
              { label: "Invoice", value: "invoice" },
              { label: "Payment", value: "payment" },
              { label: "Subscription", value: "subscription_event" },
              { label: "Payment failure", value: "payment_failed" },
            ]}
      />
      {showPaymentMethod ? (
        <Select
          value={filters.paymentMethod || ""}
          onChange={(event) => onChange({ paymentMethod: event.target.value || undefined })}
          options={[
            { label: "All methods", value: "" },
            { label: "Manual / Cash", value: "manual" },
            { label: "M-Pesa", value: "mpesa" },
            { label: "Airtel Money", value: "airtel_money" },
            { label: "Bank Transfer", value: "bank_transfer" },
            { label: "PayPal", value: "paypal" },
            { label: "Paystack", value: "paystack" },
          ]}
        />
      ) : null}
    </div>
  );
}
