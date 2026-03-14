import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import type { UserDetail } from '@/features/users/types/user.types';

export function UserAccountHealthCard({ user }: { user: UserDetail }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Account health</CardTitle>
          <CardDescription>Operational status, billing pressure, and support burden at a glance.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Operational health</p>
          <div className="mt-3"><UserStatusBadge status={user.state.health} /></div>
          <p className="mt-3 text-sm text-slate-400">Billing state: {user.state.billingState}. Risk status: {user.state.riskStatus}.</p>
        </div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Service insights</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {user.insights.slice(0, 4).map((insight) => <li key={insight}>{insight}</li>)}
          </ul>
        </div>
      </div>
    </Card>
  );
}
