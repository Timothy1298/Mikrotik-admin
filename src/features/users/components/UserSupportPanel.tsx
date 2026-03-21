import { Link } from 'react-router-dom';
import { InlineError } from '@/components/feedback/InlineError';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { appRoutes } from '@/config/routes';
import { useUserSupport } from '@/features/users/hooks';
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import type { UserDetail } from '@/features/users/types/user.types';
import { formatDateTime } from '@/lib/formatters/date';

export function UserSupportPanel({ user }: { user: UserDetail }) {
  const supportQuery = useUserSupport(user.id);
  const tickets = supportQuery.data?.tickets || user.support?.tickets || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>Support history</CardTitle><CardDescription>Ticket burden, support state, and issue history tied to this account.</CardDescription></div><RefreshButton loading={supportQuery.isFetching} onClick={() => void supportQuery.refetch()} /></div>
      </CardHeader>
      {supportQuery.isError ? <InlineError message="Support data could not be refreshed. Showing the last loaded account snapshot." /> : null}
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="font-mono text-text-muted"><tr><th className="pb-3">Subject</th><th className="pb-3">Category</th><th className="pb-3">Priority</th><th className="pb-3">Status</th><th className="pb-3">Created</th></tr></thead>
          <tbody className="divide-y divide-brand-500/15">
            {tickets.length ? tickets.map((ticket) => (
              <tr key={String(ticket._id)}>
                <td className="py-4 text-text-primary"><Link className="text-primary hover:underline" to={appRoutes.supportTicket(String(ticket._id))}>{String(ticket.subject || '-')}</Link></td>
                <td className="py-4 text-text-secondary">{String(ticket.category || '-')}</td>
                <td className="py-4"><UserStatusBadge status={String(ticket.priority || 'warning')} /></td>
                <td className="py-4"><UserStatusBadge status={String(ticket.status || 'open')} /></td>
                <td className="py-4 font-mono text-text-secondary">{formatDateTime(String(ticket.createdAt || ''))}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-text-muted">No support tickets are linked to this account.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
