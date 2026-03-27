import { CreditCard, Router, Search, Wallet } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { billingTabs } from "@/config/module-tabs";
import { appRoutes } from "@/config/routes";
import { useRouterSubscriptionBilling } from "@/features/billing/hooks/useBilling";
import { useRouters } from "@/features/routers/hooks/useRouters";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";

export function BillingRouterSubscriptionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [routerIdInput, setRouterIdInput] = useState("");
  const [routerId, setRouterId] = useState("");
  const deferredSearch = useDeferredValue(routerIdInput.trim());
  const routersQuery = useRouters({
    q: deferredSearch || undefined,
    limit: 8,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const lookupQuery = useRouterSubscriptionBilling(routerId, Boolean(routerId));

  const handleSelectRouter = (selectedRouterId: string) => {
    setRouterIdInput(selectedRouterId);
    setRouterId(selectedRouterId);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Router Billing Lookup"
        description="Find the billing account and subscription state attached to a specific router."
        meta="Router-linked subscriptions"
      />
      <Tabs tabs={[...billingTabs]} value={location.pathname} onChange={navigate} />

      <Card>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
          <Input
            label="Router ID"
            value={routerIdInput}
            onChange={(event) => setRouterIdInput(event.target.value)}
            placeholder="Search or paste a router record ID"
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Button onClick={() => setRouterId(routerIdInput.trim())}>Lookup Router</Button>
          <RefreshButton loading={lookupQuery.isFetching} onClick={() => void lookupQuery.refetch()} />
        </div>
      </Card>

      <Card>
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Routers with billing context</p>
              <p className="mt-1 text-sm text-text-secondary">Pick a router to load its linked account, subscription state, and invoice context.</p>
            </div>
            <RefreshButton loading={routersQuery.isFetching} onClick={() => void routersQuery.refetch()} />
          </div>

          {routersQuery.isPending ? <SectionLoader /> : null}
          {routersQuery.isError ? <ErrorState title="Unable to load routers" description="Retry after confirming the router directory is available." onAction={() => void routersQuery.refetch()} /> : null}

          {!routersQuery.isPending && !routersQuery.isError ? (
            (routersQuery.data?.items || []).length ? (
              <div className="grid gap-3">
                {(routersQuery.data?.items || []).map((router) => (
                  <button
                    key={router.id}
                    type="button"
                    onClick={() => handleSelectRouter(router.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      routerId === router.id
                        ? "border-primary/40 bg-primary/10"
                        : "border-background-border bg-background-panel hover:border-primary/40 hover:bg-primary/10"
                    }`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-text-primary">{router.name}</p>
                          <Badge tone={router.billingState === "paid" || router.billingState === "active" ? "success" : router.billingState === "trial" ? "info" : "warning"}>
                            {router.billingState || "unknown"}
                          </Badge>
                          <Badge tone={router.connectionStatus === "online" ? "success" : "warning"}>
                            {router.connectionStatus}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">
                          {router.customer?.name || "No customer"} • {router.customer?.email || "No email"} • {router.vpnIp || "No VPN IP"}
                        </p>
                        <p className="mt-1 font-mono text-xs text-text-muted">{router.id}</p>
                      </div>

                      <div className="grid gap-2 text-sm text-text-secondary lg:min-w-[220px]">
                        <p>Subscription: <span className="text-text-primary">{router.customer?.subscriptionState || "Unknown"}</span></p>
                        <p>Status: <span className="text-text-primary">{router.status}</span></p>
                        <p>Last seen: <span className="text-text-primary">{router.lastSeen ? formatDateTime(router.lastSeen) : "Never"}</span></p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Router}
                title="No routers found"
                description={deferredSearch ? "No routers matched the current search." : "Routers will appear here once they are available in the directory."}
              />
            )
          ) : null}
        </div>
      </Card>

      {!routerId ? <EmptyState icon={Router} title="Enter a router ID" description="The billing lookup will show the linked account, subscription state, and open invoice context." /> : null}

      {routerId && lookupQuery.isPending ? <SectionLoader /> : null}
      {routerId && lookupQuery.isError ? <ErrorState title="Unable to load router billing" description="Retry after confirming the router exists and the admin billing lookup endpoint is available." onAction={() => void lookupQuery.refetch()} /> : null}

      {lookupQuery.data ? (
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Router</p>
                <h2 className="mt-2 text-2xl font-semibold text-text-primary">{lookupQuery.data.router.name}</h2>
                <p className="mt-1 text-sm text-text-secondary">{lookupQuery.data.router.id} • {lookupQuery.data.router.status}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">VPN IP</p>
                  <p className="mt-2 text-sm text-text-primary">{lookupQuery.data.router.vpnIp || "Unavailable"}</p>
                </div>
                <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Open invoices</p>
                  <p className="mt-2 text-sm text-text-primary">{lookupQuery.data.summary.openInvoiceCount}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => navigate(appRoutes.routerDetail(lookupQuery.data.router.id))}>Open Router</Button>
                {lookupQuery.data.account ? <Button onClick={() => navigate(appRoutes.billingAccount(lookupQuery.data.account!.id))}>Open Billing Account</Button> : null}
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Account</p>
                {lookupQuery.data.account ? (
                  <>
                    <h3 className="mt-2 text-xl font-semibold text-text-primary">{lookupQuery.data.account.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{lookupQuery.data.account.email}</p>
                  <p className="mt-2 text-sm text-text-primary">Balance {formatCurrency(lookupQuery.data.account.balance || 0, lookupQuery.data.account.currency || "USD")}</p>
                </>
              ) : (
                <p className="mt-2 text-sm text-text-secondary">No account is linked to this router.</p>
              )}
              </div>

              {lookupQuery.data.subscription ? (
                <div className="rounded-2xl border border-background-border bg-background-panel p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="info">{lookupQuery.data.subscription.planType}</Badge>
                    <Badge tone={lookupQuery.data.subscription.status === "active" ? "success" : "warning"}>{lookupQuery.data.subscription.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-text-primary">Recurring price {formatCurrency(lookupQuery.data.subscription.pricePerMonth || 0, lookupQuery.data.account?.currency || "USD")}</p>
                  <p className="mt-2 text-sm text-text-secondary">Next billing {formatDateTime(lookupQuery.data.subscription.nextBillingDate)}</p>
                  <p className="mt-1 text-sm text-text-secondary">Last payment {formatDateTime(lookupQuery.data.subscription.lastPaymentDate)}</p>
                  <p className="mt-1 text-sm text-text-secondary">Payment method {lookupQuery.data.subscription.paymentMethod || "Unspecified"}</p>
                  <p className="mt-1 text-sm text-text-secondary">Open invoices {lookupQuery.data.summary.openInvoiceCount}</p>
                </div>
              ) : (
                <EmptyState icon={Wallet} title="No subscription linked" description="This router currently has no billing subscription record attached." />
              )}
            </div>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
