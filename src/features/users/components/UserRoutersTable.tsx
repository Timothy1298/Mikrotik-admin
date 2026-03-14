import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/formatters/date';
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge';
import type { UserDetail } from '@/features/users/types/user.types';

export function UserRoutersTable({ user }: { user: UserDetail }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Routers</CardTitle>
          <CardDescription>Every router tied to this account, with tunnel and port context.</CardDescription>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="font-mono text-slate-500">
            <tr>
              <th className="pb-3">Router</th><th className="pb-3">Status</th><th className="pb-3">VPN IP</th><th className="pb-3">Ports</th><th className="pb-3">Last seen</th><th className="pb-3">Transfer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-500/15">
            {user.routers.map((router) => (
              <tr key={router.id}>
                <td className="py-4"><div><p className="font-medium text-slate-100">{router.name}</p><p className="font-mono text-xs text-slate-500">{formatDateTime(router.createdAt)}</p></div></td>
                <td className="py-4"><UserStatusBadge status={router.status} /></td>
                <td className="py-4 font-mono text-slate-300">{router.vpnIp}</td>
                <td className="py-4 font-mono text-slate-300">W {router.ports.winbox} / S {router.ports.ssh} / A {router.ports.api}</td>
                <td className="py-4 font-mono text-slate-300">{formatDateTime(router.lastSeen)}</td>
                <td className="py-4 font-mono text-slate-300">RX {Math.round(router.transferRx / 1024)} KB / TX {Math.round(router.transferTx / 1024)} KB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
