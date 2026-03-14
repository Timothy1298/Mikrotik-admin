import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import type { UserDetail } from '@/features/users/types/user.types';
import { formatDateTime } from '@/lib/formatters/date';

export function UserFlagsPanel({
  user,
  onRemoveFlag,
}: {
  user: UserDetail;
  onRemoveFlag?: (flag: UserDetail['flags'][number]) => void;
}) {
  const flags = user.flags || [];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Flags and review context</CardTitle>
          <CardDescription>Manual review markers, billing risk flags, and internal operational context.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-4">
        {flags.length ? flags.map((flag) => (
          <div key={`${flag.flag}-${flag.createdAt}`} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-100">{flag.flag.replace(/_/g, ' ')}</p>
                  <UserStatusBadge status={flag.severity === 'high' ? 'flagged' : 'watchlist'} />
                </div>
                <p className="text-sm text-slate-400">{flag.description || 'No description provided.'}</p>
                <p className="font-mono text-xs text-slate-500">{flag.createdBy} • {formatDateTime(flag.createdAt)}</p>
              </div>
              {onRemoveFlag ? <Button variant="ghost" className="text-danger hover:bg-danger/10" onClick={() => onRemoveFlag(flag)}>Remove flag</Button> : null}
            </div>
          </div>
        )) : <p className="text-sm text-slate-400">No internal flags recorded for this account.</p>}
      </div>
    </Card>
  );
}
