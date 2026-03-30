import { Plus, Router } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/feedback/EmptyState';
import { InlineError } from '@/components/feedback/InlineError';
import { SectionLoader } from '@/components/feedback/SectionLoader';
import { RefreshButton } from '@/components/shared/RefreshButton';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { appRoutes } from '@/config/routes';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import { useUserRouters } from '@/features/users/hooks';
import type { UserDetail } from '@/features/users/types/user.types';
import { formatBytes } from '@/lib/formatters/bytes';
import { formatDateTime } from '@/lib/formatters/date';
import { can } from '@/lib/permissions/can';
import { permissions } from '@/lib/permissions/permissions';

export function UserRoutersTable({ user, onAddRouter }: { user: UserDetail; onAddRouter?: () => void }) {
  const { data: currentUser } = useCurrentUser(true);
  const routersQuery = useUserRouters(user.id);
  const routers = routersQuery.data?.items || user.routers;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Routers</CardTitle>
            <CardDescription>Every router tied to this account, with tunnel and port context.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            {can(currentUser, permissions.routersManage) && onAddRouter ? (
              <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={onAddRouter}>
                Add Router
              </Button>
            ) : null}
            <RefreshButton loading={routersQuery.isFetching} onClick={() => void routersQuery.refetch()} />
          </div>
        </div>
      </CardHeader>
      {routersQuery.isPending ? <SectionLoader /> : null}
      {routersQuery.isError ? <InlineError message="Router data could not be refreshed. Showing the last loaded account snapshot." /> : null}
      {routers.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="font-mono text-text-muted">
              <tr>
                <th className="pb-3">Router</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">VPN IP</th>
                <th className="pb-3">Ports</th>
                <th className="pb-3">Last seen</th>
                <th className="pb-3">Transfer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-500/15">
              {routers.map((router) => (
                <tr key={router.id}>
                  <td className="py-4">
                    <div>
                      <Link className="font-medium text-primary hover:underline" to={appRoutes.routerDetail(router.id)}>
                        {router.name}
                      </Link>
                      <p className="font-mono text-xs text-text-muted">{formatDateTime(router.createdAt)}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <UserStatusBadge status={router.status} />
                  </td>
                  <td className="py-4 font-mono text-text-secondary">{router.vpnIp || '-'}</td>
                  <td className="py-4 font-mono text-text-secondary">
                    {(() => {
                      const ports = router.ports;
                      const winbox = ports?.winbox ?? '-';
                      const ssh = ports?.ssh ?? '-';
                      const api = ports?.api ?? '-';
                      return `W ${winbox} / S ${ssh} / A ${api}`;
                    })()}
                  </td>
                  <td className="py-4 font-mono text-text-secondary">{formatDateTime(router.lastSeen)}</td>
                  <td className="py-4 font-mono text-text-secondary">
                    RX {formatBytes(router.transferRx)} / TX {formatBytes(router.transferTx)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Router} title="No routers linked" description="This subscriber does not currently have any managed routers assigned." />
      )}
    </Card>
  );
}
