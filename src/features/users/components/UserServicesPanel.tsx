import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { UserDetail } from '@/features/users/types/user.types';

export function UserServicesPanel({ user }: { user: UserDetail }) {
  const serviceChips = [
    { label: 'Router management', enabled: user.services.routerManagementEnabled },
    { label: 'WireGuard connectivity', enabled: user.services.wireguardConnectivity },
    { label: 'Monitoring', enabled: user.services.monitoringEnabled },
    { label: 'Analytics', enabled: user.services.analyticsReporting },
    { label: 'Trial features', enabled: user.services.trialFeaturesEnabled },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Service consumption</CardTitle>
          <CardDescription>Current entitlements, service state, and billable platform usage for this account.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {serviceChips.map((service) => (
            <Badge key={service.label} tone={service.enabled ? 'success' : 'neutral'}>
              {service.label}
            </Badge>
          ))}
          <Badge tone="info">{user.services.supportTier}</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Billable routers</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{user.services.billableRouters}</p>
          </div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Allocated public ports</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{user.services.allocatedPublicPorts}</p>
          </div>
          <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Total routers</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{user.services.totalRouters}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
