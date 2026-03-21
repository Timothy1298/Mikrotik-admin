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
      <div className="grid gap-4">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">Operational health</p>
          <div className="mt-3"><UserStatusBadge status={user.state.health} /></div>
          <p className="mt-3 text-sm text-text-secondary">Billing state: {user.state.billingState}. Risk status: {user.state.riskStatus}.</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">Service insights</p>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            {user.insights.slice(0, 4).map((insight) => <li key={insight}>{insight}</li>)}
          </ul>
        </div>
      </div>
    </Card>
  );
}
