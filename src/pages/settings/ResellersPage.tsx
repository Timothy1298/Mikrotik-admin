import { Building2, CreditCard, RefreshCw, Router, Users2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { appRoutes } from "@/config/routes";
import { useResellerStatus } from "@/features/settings/hooks";
import { permissions } from "@/lib/permissions/permissions";
import { can } from "@/lib/permissions/can";
import { SettingsShell } from "@/pages/settings/components/SettingsShell";

const resellerCapabilities = [
  {
    title: "Subscriber operations",
    description: "Use the Users workspace to handle onboarding, verification, notes, security review, and support impact for reseller-managed customers.",
    actionLabel: "Open Users",
    icon: Users2,
    route: appRoutes.usersOverview,
  },
  {
    title: "Commercial packaging",
    description: "Build the plan catalog, voucher stock, and tariff logic before reseller commissions are introduced.",
    actionLabel: "Open Service Plans",
    icon: CreditCard,
    route: appRoutes.settingsServicePlans,
  },
  {
    title: "Infrastructure assignment",
    description: "Prepare router estates and downstream footprints so reseller territories can be mapped onto real network assets later.",
    actionLabel: "Open Routers",
    icon: Router,
    route: appRoutes.routersOverview,
  },
];

export function ResellersPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const resellerStatusQuery = useResellerStatus();

  if (!can(user || undefined, permissions.settingsManage)) {
    return <Navigate to={appRoutes.forbidden} replace />;
  }

  if (resellerStatusQuery.isPending) {
    return (
      <SettingsShell
        title="Reseller Management"
        description="Readiness for reseller accounts, channel ownership, plan allocations, and commission workflows."
      >
        <SectionLoader />
      </SettingsShell>
    );
  }

  const isStubbed = resellerStatusQuery.isError;
  const stubMessage = resellerStatusQuery.error instanceof Error ? resellerStatusQuery.error.message : "The reseller endpoints are not available yet.";

  return (
    <SettingsShell
      title="Reseller Management"
      description="Prepare for sub-distributor and franchise operations while keeping the current platform boundary explicit."
      actions={
        <Button
          variant="outline"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          isLoading={resellerStatusQuery.isFetching}
          onClick={() => void resellerStatusQuery.refetch()}
        >
          Refresh
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <MetricCard title="Backend Status" value={isStubbed ? "Stub only" : "Ready"} progress={isStubbed ? 20 : 100} />
        <MetricCard title="Reseller Accounts" value={isStubbed ? "0" : String(resellerStatusQuery.data?.items?.length || 0)} progress={0} />
        <MetricCard title="Admin Readiness" value={isStubbed ? "Planning" : "Live"} progress={isStubbed ? 35 : 100} />
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={isStubbed ? "warning" : "success"}>{isStubbed ? "Not implemented yet" : "Available"}</Badge>
              <Badge tone="neutral">Admin capability boundary</Badge>
            </div>
            <h2 className="text-xl font-semibold text-text-primary">Reseller workspace readiness</h2>
            <p className="max-w-3xl text-sm text-text-secondary">
              This module should eventually own reseller account creation, territory/router allocation, subscriber ownership, pricing overrides, payout ledgers, and performance dashboards. The backend currently exposes only a stub, so the page now makes that explicit instead of pretending the workflow exists.
            </p>
          </div>
          <Building2 className="h-10 w-10 text-primary/70" />
        </div>

        {isStubbed ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-text-primary">
            Current API response: <span className="font-medium">{stubMessage}</span>
          </div>
        ) : null}
      </Card>

      {resellerStatusQuery.isError ? (
        <ErrorState
          title="Reseller module is not live yet"
          description="The backend still returns a stub for reseller management. The surrounding admin workflows below are the supported alternatives right now."
          onAction={() => void resellerStatusQuery.refetch()}
          actionLabel="Check again"
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {resellerCapabilities.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{item.title}</p>
                  <p className="text-sm text-text-secondary">{item.description}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate(item.route)}>
                {item.actionLabel}
              </Button>
            </Card>
          );
        })}
      </div>
    </SettingsShell>
  );
}
