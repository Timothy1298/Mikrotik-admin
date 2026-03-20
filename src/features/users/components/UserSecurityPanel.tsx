import { InlineError } from '@/components/feedback/InlineError';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUserSecurity } from '@/features/users/hooks';
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import type { UserDetail } from '@/features/users/types/user.types';
import { formatDateTime } from '@/lib/formatters/date';

export function UserSecurityPanel({ user }: { user: UserDetail }) {
  const securityQuery = useUserSecurity(user.id);
  const security = securityQuery.data || user.security;
  const flags = security?.flags || [];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>Security summary</CardTitle><CardDescription>Login history, failed attempts, and risk posture.</CardDescription></div><RefreshButton loading={securityQuery.isFetching} onClick={() => void securityQuery.refetch()} /></div></CardHeader>
        {securityQuery.isError ? <InlineError message="Security data could not be refreshed. Showing the last loaded account snapshot." /> : null}
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex items-center justify-between"><span>Risk status</span><UserStatusBadge status={security.riskStatus} /></div>
          <div className="flex items-center justify-between"><span>Failed logins 24h</span><span>{security.failedLogins24h}</span></div>
          <div className="flex items-center justify-between"><span>Failed logins 7d</span><span>{security.failedLogins7d}</span></div>
          <div className="flex items-center justify-between"><span>Last successful login</span><span>{formatDateTime(security.lastSuccessfulLogin)}</span></div>
          <div className="flex items-center justify-between"><span>Last failed login</span><span>{formatDateTime(security.lastFailedLogin)}</span></div>
        </div>
      </Card>
      <Card>
        <CardHeader><div><CardTitle>Security events and flags</CardTitle><CardDescription>Operational review context for suspicious or risky accounts.</CardDescription></div></CardHeader>
        <div className="space-y-4">
          {flags.length ? flags.map((flag, index) => (
            <div key={`${flag.flag}-${index}`} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-medium text-slate-100">{flag.flag}</p><UserStatusBadge status={flag.severity === 'high' ? 'flagged' : 'watchlist'} /></div>
              <p className="mt-2 text-sm text-slate-400">{flag.description || 'No description provided.'}</p>
              <p className="mt-2 font-mono text-xs text-slate-500">{flag.createdBy} • {formatDateTime(flag.createdAt)}</p>
            </div>
          )) : <p className="text-sm text-slate-400">No risk flags recorded for this account.</p>}
        </div>
      </Card>
    </div>
  );
}
