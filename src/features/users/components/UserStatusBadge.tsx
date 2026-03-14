import { Badge } from '@/components/ui/Badge';

const toneMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  active: 'success',
  suspended: 'danger',
  pending_verification: 'warning',
  verified: 'success',
  unverified: 'warning',
  trial: 'info',
  current: 'success',
  none: 'neutral',
  overdue: 'danger',
  past_due: 'danger',
  normal: 'success',
  watchlist: 'warning',
  flagged: 'danger',
  restricted: 'danger',
  healthy: 'success',
  warning: 'warning',
  critical: 'danger',
};

export function UserStatusBadge({ status }: { status: string }) {
  return <Badge tone={toneMap[status] || 'neutral'}>{status.replace(/_/g, ' ')}</Badge>;
}
