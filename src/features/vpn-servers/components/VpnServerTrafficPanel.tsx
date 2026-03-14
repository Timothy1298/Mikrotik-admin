import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { VpnServerDetail } from "@/features/vpn-servers/types/vpn-server.types";

export function VpnServerTrafficPanel({ server }: { server: VpnServerDetail }) {
  const traffic = server.traffic;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Traffic / load</CardTitle>
          <CardDescription>Transfer totals, active peer counts, and capacity context for this server.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">RX</p><p className="mt-3 text-sm text-slate-100">{traffic.totalTransferRx.toLocaleString()}</p></div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">TX</p><p className="mt-3 text-sm text-slate-100">{traffic.totalTransferTx.toLocaleString()}</p></div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active peers</p><p className="mt-3 text-sm text-slate-100">{traffic.activePeerCount}</p></div>
        <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total peers</p><p className="mt-3 text-sm text-slate-100">{traffic.totalPeerCount}</p></div>
      </div>
    </Card>
  );
}
