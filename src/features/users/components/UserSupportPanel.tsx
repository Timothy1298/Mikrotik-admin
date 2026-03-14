import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import type { UserDetail } from '@/features/users/types/user.types';
import { formatDateTime } from '@/lib/formatters/date';

export function UserSupportPanel({ user }: { user: UserDetail }) {
  const tickets = user.support?.tickets || [];

  return (
    <Card>
      <CardHeader>
        <div><CardTitle>Support history</CardTitle><CardDescription>Ticket burden, support state, and issue history tied to this account.</CardDescription></div>
      </CardHeader>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="font-mono text-slate-500"><tr><th className="pb-3">Subject</th><th className="pb-3">Category</th><th className="pb-3">Priority</th><th className="pb-3">Status</th><th className="pb-3">Created</th></tr></thead>
          <tbody className="divide-y divide-brand-500/15">
            {tickets.length ? tickets.map((ticket) => (
              <tr key={String(ticket._id)}>
                <td className="py-4 text-slate-100">{String(ticket.subject || '-')}</td>
                <td className="py-4 text-slate-300">{String(ticket.category || '-')}</td>
                <td className="py-4"><UserStatusBadge status={String(ticket.priority || 'warning')} /></td>
                <td className="py-4"><UserStatusBadge status={String(ticket.status || 'open')} /></td>
                <td className="py-4 font-mono text-slate-300">{formatDateTime(String(ticket.createdAt || ''))}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-slate-500">No support tickets are linked to this account.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
