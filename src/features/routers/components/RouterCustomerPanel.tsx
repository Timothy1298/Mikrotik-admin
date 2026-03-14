import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { RouterDetail } from "@/features/routers/types/router.types";

export function RouterCustomerPanel({ router }: { router: RouterDetail }) {
  const customer = router.customer;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Customer context</CardTitle>
          <CardDescription>Ownership, account state, and customer-side operational context linked to this router.</CardDescription>
        </div>
      </CardHeader>
      {customer ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="text-sm font-medium text-slate-100">{customer.name}</p>
            <p className="mt-1 text-sm text-slate-400">{customer.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={customer.accountStatus === "active" ? "success" : "danger"}>{customer.accountStatus}</Badge>
            <Badge tone={customer.verificationStatus === "verified" ? "success" : "warning"}>{customer.verificationStatus}</Badge>
            <Badge tone="info">{customer.subscriptionState}</Badge>
            <Badge tone="neutral">{customer.routersOwned} routers</Badge>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">No customer ownership record is attached to this router.</p>
      )}
    </Card>
  );
}
