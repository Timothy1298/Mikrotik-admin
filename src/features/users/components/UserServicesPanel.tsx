import { InlineError } from '@/components/feedback/InlineError';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useUserServices } from '@/features/users/hooks';
import type { UserDetail } from '@/features/users/types/user.types';

export function UserServicesPanel({ user }: { user: UserDetail }) {
  const servicesQuery = useUserServices(user.id);
  const services = servicesQuery.data || user.services;
  const serviceChips = [
    { label: 'Router management', enabled: services.routerManagementEnabled },
    { label: 'WireGuard connectivity', enabled: services.wireguardConnectivity },
    { label: 'Monitoring', enabled: services.monitoringEnabled },
    { label: 'Analytics', enabled: services.analyticsReporting },
    { label: 'Trial features', enabled: services.trialFeaturesEnabled },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Service consumption</CardTitle>
            <CardDescription>Current entitlements, service state, and billable platform usage for this account.</CardDescription>
          </div>
          <RefreshButton loading={servicesQuery.isFetching} onClick={() => void servicesQuery.refetch()} />
        </div>
      </CardHeader>
      {servicesQuery.isError ? <InlineError message="Services data could not be refreshed. Showing the last loaded account snapshot." /> : null}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {serviceChips.map((service) => (
            <Badge key={service.label} tone={service.enabled ? 'success' : 'neutral'}>
              {service.label}
            </Badge>
          ))}
          <Badge tone="info">{services.supportTier}</Badge>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Billable routers</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{services.billableRouters}</p>
          </div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Allocated public ports</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{services.allocatedPublicPorts}</p>
          </div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Total routers</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{services.totalRouters}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
