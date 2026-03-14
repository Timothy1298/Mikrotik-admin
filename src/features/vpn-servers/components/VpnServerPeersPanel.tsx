import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { VpnServerPeerItem } from "@/features/vpn-servers/types/vpn-server.types";
import { formatDateTime } from "@/lib/formatters/date";

export function VpnServerPeersPanel({ items, loading }: { items: VpnServerPeerItem[]; loading?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Peers preview</CardTitle>
          <CardDescription>Peer distribution and handshake health attached to this server.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {loading ? <p className="text-sm text-slate-400">Loading peers…</p> : items.length ? items.map((peer) => (
          <div key={peer.id} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-100">{peer.reference}</p>
                <p className="mt-1 text-xs text-slate-500">{peer.health} • {peer.router?.name || "No linked router"}</p>
              </div>
              <span className="font-mono text-xs text-slate-500">{formatDateTime(peer.lastHandshake)}</span>
            </div>
          </div>
        )) : <p className="text-sm text-slate-400">No peers are currently attached to this VPN server.</p>}
      </div>
    </Card>
  );
}
