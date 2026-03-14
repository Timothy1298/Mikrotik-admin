import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { VpnServerRouterItem } from "@/features/vpn-servers/types/vpn-server.types";
import { formatDateTime } from "@/lib/formatters/date";

export function VpnServerRoutersPanel({ items, loading }: { items: VpnServerRouterItem[]; loading?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Routers preview</CardTitle>
          <CardDescription>Routers currently assigned to this VPN server.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {loading ? <p className="text-sm text-slate-400">Loading routers…</p> : items.length ? items.map((router) => (
          <div key={router.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-100">{router.name}</p>
                <p className="mt-1 text-xs text-slate-500">{router.customer?.name || "No customer"} • {router.vpnIp}</p>
              </div>
              <span className="font-mono text-xs text-slate-500">{formatDateTime(router.lastSeen)}</span>
            </div>
          </div>
        )) : <p className="text-sm text-slate-400">No routers are currently attached to this VPN server.</p>}
      </div>
    </Card>
  );
}
